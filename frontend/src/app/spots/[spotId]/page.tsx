"use client";

import { use, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getSpotDetail } from "@/lib/api/spot";
import { mapSpotDetailToDetailData } from "@/features/spots/utils/mapSpotDetail";
import { loadKakaoMapSdk, buildKakaoMapLink } from "@/lib/map/kakaoMap";

// TODO: 실제로는 API에서 이미지 배열(images: string[])을 받아와야 함.
// 지금은 firstImage 하나만 있으니 임시로 배열처럼 다룸.
function useSpotImages(imageUrl: string) {
  return imageUrl ? [imageUrl] : [];
}

export default function SpotDetailPage({
  params,
}: {
  params: Promise<{ spotId: string }>;
}) {
  const { spotId } = use(params);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["spotDetail", spotId],
    queryFn: () => getSpotDetail(spotId),
  });

  if (isLoading) return <div className="px-4 py-4">로딩 중...</div>;
  if (isError || !data) return <div className="px-4 py-4">정보를 불러오지 못했습니다.</div>;

  const spot = mapSpotDetailToDetailData(data);

  return <SpotDetailContent spot={spot} />;
}

function SpotDetailContent({
  spot,
}: {
  spot: ReturnType<typeof mapSpotDetailToDetailData>;
}) {
  const images = useSpotImages(spot.imageUrl);
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

    const center = new window.kakao.maps.LatLng(spot.lat, spot.lng);
    const map = new window.kakao.maps.Map(mapRef.current, { center, level: 4 });
    new window.kakao.maps.Marker({ position: center, map });
  }, [isMapSdkReady, spot.lat, spot.lng]);

  const handleCheckLocation = () => {
    const { lat, lng, title } = spot;
    window.open(buildKakaoMapLink(title, lat, lng), "_blank");
  };

  // --- 상세 설명 더보기/접기 (실제로 넘칠 때만 버튼 노출) ---
  const descRef = useRef<HTMLParagraphElement>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isDescClamped, setIsDescClamped] = useState(false);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    setIsDescClamped(el.scrollHeight > el.clientHeight);
  }, [spot.description]);

  return (
    <div className="relative mx-auto overflow-y-auto overflow-x-hidden bg-white h-dvh w-full max-w-[430px] scrollbar-hide">
      <div className="pb-8" style={{ paddingTop: 44 }}>
          <div className="px-[17px]">
            <header
              className="flex w-full items-center justify-between mb-2"
              style={{ height: 28 }}
            >
              <button
                aria-label="뒤로가기"
                onClick={() => router.back()}
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
            style={{ aspectRatio: "393 / 253" }}
          >
            {images.length > 0 ? (
              images.map((url, i) => (
                <div key={i} className="relative w-full shrink-0 snap-center" style={{ aspectRatio: "393 / 253" }}>
                  <img
                    src={url}
                    alt={`${spot.title} 이미지 ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="relative w-full shrink-0 snap-center" style={{ aspectRatio: "393 / 253" }}>
                <img
                  src="/festivals/noimage.jpg"
                  alt="이미지 없음"
                  className="absolute inset-0 h-full w-full object-cover"
                />
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
            <h1
              className="mt-[15px]"
              style={{ fontWeight: 700, fontSize: 16, color: "#6CA59C" }}
            >
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
              {spot.address}
            </p>

            {/* 상세 설명 (실제로 넘칠 때만 더보기 노출) */}
            <p
              ref={descRef}
              className={`mt-[15px] whitespace-pre-line ${!isDescExpanded ? "line-clamp-4" : ""}`}
              style={{ fontWeight: 400, fontSize: 14, lineHeight: "110%", color: "#000000" }}
            >
              {spot.description}
            </p>
            {isDescClamped && (
              <button
                type="button"
                onClick={() => setIsDescExpanded((v) => !v)}
                className="mt-1 text-gray-500 hover:text-gray-400 active:text-gray-400 transition-colors"
                style={{ fontWeight: 600, fontSize: 13 }}
              >
                {isDescExpanded ? "접기" : "더보기"}
              </button>
            )}

            {/* 카카오맵 */}
            <div
              ref={mapRef}
              className="mt-6 flex items-center justify-center bg-[#EEEEEE] text-sm text-gray-400"
              style={{ width: "100%", aspectRatio: "360 / 222" }}
            >
              {isMapSdkError && "지도를 불러오지 못했습니다"}
              {!isMapSdkReady && !isMapSdkError && "지도 로딩 중..."}
            </div>

            {/* 위치 확인하기 버튼 */}
            <button
              onClick={handleCheckLocation}
              className="mt-4 flex w-full items-center justify-center"
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
          </div>
      </div>
    </div>
  );
}