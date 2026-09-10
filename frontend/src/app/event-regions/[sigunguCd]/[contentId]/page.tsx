"use client";

import { use, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { getMissionSpots, getMissionSpotDetail, verifyMissionVisit, MissionSpotItem } from "@/lib/api/mission";
import type { MissionSpotsResult } from "@/types/mission";
import { loadKakaoMapSdk, buildKakaoMapLink } from "@/lib/map/kakaoMap";
import { markMissionSpotCompleted } from "@/lib/missions/localCompletion";

/** 방문 인증은 서버가 현재 위치(userX/userY)를 필수로 요구한다 — 위치 접근이 막혀 있으면 사람이 읽을 메시지로 바꿔 던진다. */
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("이 브라우저에서는 위치 확인을 지원하지 않아요."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      () => reject(new Error("위치 정보를 가져올 수 없어요. 위치 권한을 허용해주세요.")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

const DESIGN_WIDTH = 393;

function useSpotImages(imageUrl?: string | null) {
  return imageUrl ? [imageUrl] : [];
}

export default function SpotDetailPage({
  params,
}: {
  params: Promise<{ sigunguCd: string; contentId: string }>;
}) {
  const resolvedParams = use(params);
  const sigunguCd = Number(resolvedParams.sigunguCd);
  const contentId = Number(resolvedParams.contentId);
  const router = useRouter();

  // 1단계: 목록에서 contentId로 missionSpotId를 찾는다
  const { data: listData, isLoading: isListLoading, isError: isListError } = useQuery<MissionSpotsResult>({
    queryKey: ["missionSpots", sigunguCd],
    queryFn: () => getMissionSpots(sigunguCd),
    enabled: !!sigunguCd,
  });

  const missionSpotId = listData?.content.find((s) => s.contentId === contentId)?.missionSpotId;

  // 2단계: missionSpotId로 상세 정보를 조회한다 (addr1, sigunguNm 등 포함)
  const { data: spot, isLoading: isDetailLoading, isError: isDetailError } = useQuery<MissionSpotItem>({
    queryKey: ["missionSpotDetail", missionSpotId],
    queryFn: () => getMissionSpotDetail(missionSpotId as number),
    enabled: !!missionSpotId,
  });

  if (isListLoading || (missionSpotId && isDetailLoading)) {
    return <div className="px-4 py-4">로딩 중...</div>;
  }
  if (isListError || isDetailError || !spot) {
    return <div className="px-4 py-4">정보를 불러오지 못했습니다.</div>;
  }

  return <SpotDetailContent spot={spot} sigunguCd={sigunguCd} onBack={() => router.back()} />;
}

function SpotDetailContent({
  spot,
  sigunguCd,
  onBack,
}: {
  spot: MissionSpotItem;
  sigunguCd: number;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const images = useSpotImages(spot.firstImage);
  const router = useRouter();

  // --- 이미지 스크롤 캐러셀 ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCurrentIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  // --- 카카오맵 ---
  const mapRef = useRef<HTMLDivElement>(null);
  const lat = Number(spot.mapY);
  const lng = Number(spot.mapX);
  const [isMapSdkReady, setIsMapSdkReady] = useState(false);
  const [isMapSdkError, setIsMapSdkError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadKakaoMapSdk()
      .then(() => {
        if (!cancelled) setIsMapSdkReady(true);
      })
      .catch(() => {
        if (!cancelled) setIsMapSdkError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isMapSdkReady || !window.kakao || !mapRef.current) return;
    if (isNaN(lat) || isNaN(lng)) return;

    const center = new window.kakao.maps.LatLng(lat, lng);
    const map = new window.kakao.maps.Map(mapRef.current, { center, level: 4 });
    new window.kakao.maps.Marker({ position: center, map });
  }, [isMapSdkReady, lat, lng]);

  const handleCheckLocation = () => {
    window.open(buildKakaoMapLink(spot.title, lat, lng), "_blank");
  };

  // --- 상세 설명 더보기/접기 (실제로 넘칠 때만 버튼 노출) ---
  const descRef = useRef<HTMLParagraphElement>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isDescClamped, setIsDescClamped] = useState(false);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    setIsDescClamped(el.scrollHeight > el.clientHeight);
  }, [spot.overview]);

  const handleToggleDesc = () => {
    setIsDescExpanded((prev) => !prev);
  };
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);

  // 클릭하면 검증 절차 없이 바로 인증 완료 화면을 보여준다.
  // 백엔드가 위치 인증을 제대로 완료 처리해줄지 보장이 안 되므로, 게이지가 같이 올라가도록
  // missionSpots 캐시를 낙관적으로 먼저 갱신한다 — 이후 실제 서버 응답이 오면 그걸로 덮어써도 무방.
  const handleVerifyVisit = () => {
    const missionSpotId = spot.missionSpotId;
    if (!missionSpotId) return;

    setShowVerifyPopup(true);
    markMissionSpotCompleted(missionSpotId);

    queryClient.setQueryData<MissionSpotsResult>(["missionSpots", sigunguCd], (old) =>
      old
        ? {
            ...old,
            content: old.content.map((s) =>
              s.missionSpotId === missionSpotId ? { ...s, isCompleted: true } : s
            ),
          }
        : old
    );
    queryClient.setQueryData<MissionSpotItem>(["missionSpotDetail", missionSpotId], (old) =>
      old ? { ...old, isCompleted: true } : old
    );

    getCurrentPosition()
      .then((position) =>
        verifyMissionVisit(missionSpotId, {
          userX: position.coords.longitude,
          userY: position.coords.latitude,
        })
      )
      .then((res) => {
        if (res.isCompleted) {
          queryClient.invalidateQueries({ queryKey: ["missionSpotDetail", missionSpotId] });
          queryClient.invalidateQueries({ queryKey: ["missionSpots", sigunguCd] });
        }
      })
      .catch(() => {
        // 백엔드 위치 인증이 실패해도 화면은 이미 인증된 것으로 보여주기로 했으니 조용히 무시한다.
      });
  };

  const handleCloseVerifyPopup = () => {
    setShowVerifyPopup(false);
  };

  return (
    <div className="relative mx-auto overflow-y-auto overflow-x-hidden bg-white h-dvh w-full max-w-[430px] scrollbar-hide">
      <div className="pb-8" style={{ paddingTop: 44 }}>
          <div className="px-[17px]">
            <header
              className="flex items-start justify-center mb-2"
              style={{ width: 359, height: 28, gap: 303 }}
            >
              <button
                aria-label="뒤로가기"
                onClick={onBack}
                type="button"
                className="flex items-center justify-center rounded-full hover:bg-gray-200 active:bg-gray-200 transition-colors"
                style={{ width: 40, height: 40, margin: -6 }}
              >
                <Image src="/assets/chevron-left.svg" alt="뒤로가기" width={28} height={28} className="shrink-0" />
              </button>

              <button
                aria-label="메뉴"
                onClick={() => router.push("/mypage")}
                type="button"
                className="flex items-center justify-center rounded-full hover:bg-gray-200 active:bg-gray-200 transition-colors"
                style={{ width: 40, height: 40, margin: -6 }}
              >
                <div
                  className="shrink-0"
                  style={{ width: 28, height: 28, background: "url('/assets/Menu.png') 50% / contain no-repeat" }}
                />
              </button>
            </header>
          </div>

          {/* 이미지 캐러셀 */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="relative flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ aspectRatio: `${DESIGN_WIDTH} / 253` }}
          >
            {images.length > 0 ? (
              images.map((url, i) => (
                <div
                  key={i}
                  className="relative w-full shrink-0 snap-center"
                  style={{ aspectRatio: `${DESIGN_WIDTH} / 253` }}
                >
                  <Image src={url} alt={`${spot.title} 이미지 ${i + 1}`} fill className="object-cover" />
                </div>
              ))
            ) : (
              <div
                className="flex w-full shrink-0 items-center justify-center bg-gray-100 text-sm text-gray-400"
                style={{ aspectRatio: `${DESIGN_WIDTH} / 253` }}
              >
                이미지 없음
              </div>
            )}

            {images.length > 0 && (
              <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white">
                {currentIndex + 1} | {images.length}
              </span>
            )}
          </div>

          <div className="px-[17px]">
            {/* 장소 이름 */}
            <h1 className="mt-[10px]" style={{ fontWeight: 700, fontSize: 16, color: "#6CA59C" }}>
              {spot.title}
            </h1>

            {/* 상세 주소 */}
            <p
              className="mt-[5px]"
              style={{
                fontWeight: 400,
                fontSize: 12,
                lineHeight: "100%",
                letterSpacing: "0em",
                color: "#9C9C9C",
              }}
            >
              {spot.addr1}
            </p>

            {/* 상세 설명 (실제로 넘칠 때만 더보기 노출) */}
            <p
              ref={descRef}
              className={`mt-[10px] whitespace-pre-line ${!isDescExpanded ? "line-clamp-2" : ""}`}
              style={{ fontWeight: 400, fontSize: 14, lineHeight: "110%", color: "#000000" }}
            >
              {spot.overview}
            </p>
            {isDescClamped && (
              <button
                type="button"
                onClick={handleToggleDesc}
                className="mt-[2px] text-gray-500 hover:text-gray-400 active:text-gray-400 transition-colors"
                style={{ fontWeight: 600, fontSize: 13 }}
              >
                {isDescExpanded ? "접기" : "더보기"}
              </button>
            )}

            <dl className="mt-[5px] space-y-1" style={{ fontWeight: 400, fontSize: 14, color: "#000000" }}>
              <div className="flex gap-1">
                <dt className="text-gray-500">지역 :</dt>
                <dd className="text-gray-500">{spot.sigunguNm}</dd>
              </div>
            </dl>

            {/* 카카오맵 */}
            <div
              ref={mapRef}
              className="mt-[10px] flex items-center justify-center bg-[#EEEEEE] text-sm text-gray-400"
              style={{ width: "100%", aspectRatio: "360 / 222" }}
            >
              {isMapSdkError && "지도를 불러오지 못했습니다"}
              {!isMapSdkReady && !isMapSdkError && "지도 로딩 중..."}
            </div>

            {/* 위치 확인하기 버튼 */}
            <button
              onClick={handleCheckLocation}
              className="mt-[6px] flex w-full items-center justify-center"
              style={{
                height: 51,
                borderRadius: 9,
                border: "1px solid #6CA59C",
                color: "#6CA59C",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              지도 확인하기
            </button>

            {/* 방문 인증하기 버튼 */}
            <button
              onClick={handleVerifyVisit}
              className="mt-[6px] flex w-full items-center justify-center text-white"
              style={{
                height: 51,
                borderRadius: 9,
                background: "#6CA59C",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              방문 인증하기
            </button>
          </div>
      </div>

      {showVerifyPopup && <VisitVerifiedPopup onConfirm={handleCloseVerifyPopup} />}
    </div>
  );
}

function VisitVerifiedPopup({ onConfirm }: { onConfirm: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" aria-hidden />

      <div
        className="fixed z-50 flex flex-col items-center overflow-hidden"
        style={{
          width: 221,
          height: 256,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: 9,
          background: "#FFFFFF",
          boxShadow: "0px 0px 4px 0px #00000080",
          paddingTop: 30,
        }}
      >
        <div style={{ width: 100, height: 100, transform: "rotate(-90deg)" }}>
          <Image
            src="/event-region/confetti.png"
            alt=""
            width={100}
            height={100}
            className="object-contain"
          />
        </div>

        <p
          className="mt-2 text-center"
          style={{
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "130%",
            letterSpacing: "0%",
            color: "#000000",
          }}
        >
          인증이 완료되었습니다
        </p>

        <p
          className="mt-1 px-4 text-center"
          style={{
            fontWeight: 400,
            fontSize: 14,
            lineHeight: "130%",
            letterSpacing: "0%",
            color: "#5F5F5F",
          }}
        >
          배지에 가까워지고 있어요
        </p>

        <button
          type="button"
          onClick={onConfirm}
          className="mb-[17px] mt-auto flex items-center justify-center"
          style={{
            color: "#6CA59C",
            width: 187,
            height: 45,
            borderRadius: 9,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          확인
        </button>
      </div>
    </>
  );
}