"use client";

import { use, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { ChevronLeftIcon, MenuIcon } from "@/components/common/icons";
import { getMissionSpots, verifyMissionVisit, MissionSpotItem } from "@/lib/api/mission";
import type { MissionSpotsResult } from "@/types/mission";

const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 852;

function useSpotImages(imageUrl?: string | null) {
  return imageUrl ? [imageUrl] : [];
}

type NaverLatLng = object;
type NaverMap = object;

interface NaverMapsApi {
  LatLng: new (lat: number, lng: number) => NaverLatLng;
  Map: new (element: HTMLElement, options: { center: NaverLatLng; zoom: number }) => NaverMap;
  Marker: new (options: { position: NaverLatLng; map: NaverMap }) => unknown;
}

declare global {
  interface Window {
    naver?: { maps: NaverMapsApi };
  }
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

  const { data, isLoading, isError } = useQuery<MissionSpotsResult>({
    queryKey: ["missionSpots", sigunguCd],
    queryFn: () => getMissionSpots(sigunguCd),
    enabled: !!sigunguCd,
  });

  const spot = data?.content.find((s) => s.contentId === contentId);

  if (isLoading) return <div className="px-4 py-4">로딩 중...</div>;
  if (isError || !spot) return <div className="px-4 py-4">정보를 불러오지 못했습니다.</div>;

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);

  const [showVerifyPopup, setShowVerifyPopup] = useState(false);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const updateScale = () => {
      const { clientWidth, clientHeight } = el;
      const scaleX = clientWidth / DESIGN_WIDTH;
      const scaleY = clientHeight / DESIGN_HEIGHT;
      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentIndex(index);
  };

  const mapRef = useRef<HTMLDivElement>(null);

  const lat = Number(spot.mapY);
  const lng = Number(spot.mapX);

  useEffect(() => {
    if (typeof window === "undefined" || !window.naver || !mapRef.current) return;
    if (isNaN(lat) || isNaN(lng)) return;

    const center = new window.naver.maps.LatLng(lat, lng);
    const map = new window.naver.maps.Map(mapRef.current, {
      center,
      zoom: 16,
    });
    new window.naver.maps.Marker({ position: center, map });
  }, [lat, lng]);

  const handleCheckLocation = () => {
    const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(
      spot.title
    )}?c=${lng},${lat},16,0,0,0,dh`;
    window.open(naverMapUrl, "_blank");
  };

  const handleVerifyVisit = async () => {
    if (!spot.missionSpotId) return;

    try {
      const res = await verifyMissionVisit(spot.missionSpotId, {});
      if (res.isCompleted) {
        queryClient.invalidateQueries({ queryKey: ["missionSpots", sigunguCd] });
        setShowVerifyPopup(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCloseVerifyPopup = () => {
    setShowVerifyPopup(false);
  };

  return (
    <div
      ref={outerRef}
      className="w-full flex items-center justify-center overflow-hidden"
      style={{ height: "100dvh" }}
    >
      <div
        className="relative bg-white overflow-y-auto overflow-x-hidden select-none scrollbar-hide"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <header className="flex items-center justify-between px-[17px] py-3" style={{ paddingTop: 44 }}>
          <button aria-label="뒤로가기" onClick={onBack} type="button">
            <Image
              src="/assets/chevron-left.svg"
              alt="뒤로가기"
              width={28}
              height={28}
              className="shrink-0"
            />
          </button>

          <button aria-label="메뉴" onClick={() => router.push("/mypage")} type="button">
            <div
              className="shrink-0"
              style={{
                width: 28,
                height: 28,
                background: "url('/assets/Menu.png') 50% / contain no-repeat",
              }}
            />
          </button>
        </header>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ width: 393, height: 253 }}
        >
          {images.length > 0 ? (
            images.map((url, i) => (
              <div
                key={i}
                className="relative shrink-0 snap-center"
                style={{ width: 393, height: 253 }}
              >
                <Image src={url} alt={`${spot.title} 이미지 ${i + 1}`} fill className="object-cover" />
              </div>
            ))
          ) : (
            <div
              className="flex shrink-0 items-center justify-center bg-gray-100 text-sm text-gray-400"
              style={{ width: 393, height: 253 }}
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

        <div className="px-[17px] pb-8">
          <div className="mt-[26px] flex items-center justify-between">
            <h1
              style={{ fontWeight: 700, fontSize: 16, lineHeight: "100%", color: "#6CA59C" }}
            >
              {spot.title}
            </h1>
          </div>

          <p
            className="mt-1"
            style={{ fontWeight: 400, fontSize: 12, lineHeight: "100%", color: "#9C9C9C" }}
          >
            {spot.addr1}
          </p>

          <p
            className="mt-6 whitespace-pre-line"
            style={{ fontWeight: 400, fontSize: 14, lineHeight: "160%", color: "#000000" }}
          >
            {spot.overview}
          </p>

          <dl
            className="mt-4 space-y-1"
            style={{ fontWeight: 400, fontSize: 14, color: "#000000" }}
          >
            <div className="flex gap-1">
              <dt className="text-gray-500">지역 :</dt>
              <dd className="text-gray-500">{spot.sigunguNm}</dd>
            </div>
          </dl>

          <div
            ref={mapRef}
            className="mt-6 flex items-center justify-center bg-[#EEEEEE] text-sm text-gray-400"
            style={{ width: 360, height: 222 }}
          >
            {typeof window !== "undefined" && !window.naver && "지도 SDK 로드 필요"}
          </div>

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

          <button
            onClick={handleVerifyVisit}
            className="mt-3 flex w-full items-center justify-center text-white"
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

        {showVerifyPopup && (
          <VisitVerifiedPopup onConfirm={handleCloseVerifyPopup} />
        )}
      </div>
    </div>
  );
}

function VisitVerifiedPopup({ onConfirm }: { onConfirm: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" aria-hidden />

      <div
        className="absolute z-50 overflow-hidden"
        style={{
          width: 221,
          height: 256,
          top: 303,
          left: 86,
          borderRadius: 9,
          background: "#FFFFFF",
          boxShadow: "0px 0px 4px 0px #00000080",
        }}
      >
        <div
          className="absolute"
          style={{
            width: 100,
            height: 100,
            top: 30,
            left: 61,
            transform: "rotate(-90deg)",
          }}
        >
          <Image
            src="/event-region/confetti.png"
            alt=""
            width={100}
            height={100}
            className="object-contain"
          />
        </div>

        <p
          className="absolute"
          style={{
            width: 142,
            height: 19,
            top: 137,
            left: 40,
            fontWeight: 700,
            fontSize: 16,
            lineHeight: "100%",
            letterSpacing: "0%",
            color: "#000000",
            textAlign: "center",
          }}
        >
          인증이 완료되었습니다
        </p>

        <p
          className="absolute"
          style={{
            width: 144,
            height: 17,
            top: 160,
            left: 39,
            fontWeight: 400,
            fontSize: 14,
            lineHeight: "100%",
            letterSpacing: "0%",
            color: "#5F5F5F",
            textAlign: "center",
          }}
        >
          배지에 가까워지고 있어요
        </p>

        <button
          type="button"
          onClick={onConfirm}
          className="absolute flex items-center justify-center"
          style={{
            color: "#6CA59C",
            width: 187,
            height: 45,
            top: 194,
            left: 17,
            borderRadius: 9,
            gap: 10,
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