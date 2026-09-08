"use client";

import { use, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getSpotDetail } from "@/lib/api/spot";
import { mapSpotDetailToDetailData } from "@/features/spots/utils/mapSpotDetail";

// TODO: 실제로는 API에서 이미지 배열(images: string[])을 받아와야 함.
// 지금은 firstImage 하나만 있으니 임시로 배열처럼 다룸.
function useSpotImages(imageUrl: string) {
  return imageUrl ? [imageUrl] : [];
}

// 네이버 지도 SDK는 타입 패키지를 쓰지 않으므로, 이 화면이 실제로 호출하는 API만 좁게 선언한다.
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

  // --- 스케일 캔버스 ---
  const DESIGN_WIDTH = 393;
  const DESIGN_HEIGHT = 852;
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const outerEl = outerRef.current;
    if (!outerEl) return;

    const update = () => {
      const widthScale = outerEl.clientWidth / DESIGN_WIDTH;
      const heightScale = outerEl.clientHeight / DESIGN_HEIGHT;
      setScale(Math.min(widthScale, heightScale));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // --- 이미지 스크롤 캐러셀 ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCurrentIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  // --- 네이버 지도 ---
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.naver || !mapRef.current) return;

    const center = new window.naver.maps.LatLng(spot.lat, spot.lng);
    const map = new window.naver.maps.Map(mapRef.current, { center, zoom: 16 });
    new window.naver.maps.Marker({ position: center, map });
  }, [spot.lat, spot.lng]);

  const handleCheckLocation = () => {
    const { lat, lng, title } = spot;
    const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(
      title
    )}?c=${lng},${lat},16,0,0,0,dh`;
    window.open(naverMapUrl, "_blank");
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
    <div
      ref={outerRef}
      className="w-full flex items-center justify-center overflow-hidden bg-gray-900"
      style={{ height: "100dvh" }}
    >
      <div style={{ width: DESIGN_WIDTH * scale, height: DESIGN_HEIGHT * scale }}>
        <div
          className="relative bg-white pb-8"
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            overflowY: "auto",
            paddingTop: 44,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div className="px-[17px]">
            <header
              className="flex items-start justify-center mb-2"
              style={{ width: 359, height: 28, gap: 303 }}
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
            className="relative flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ width: 393, height: 253 }}
          >
            {images.length > 0 ? (
              images.map((url, i) => (
                <div key={i} className="relative shrink-0 snap-center" style={{ width: 393, height: 253 }}>
                  <img
                    src={url}
                    alt={`${spot.title} 이미지 ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="relative shrink-0 snap-center" style={{ width: 393, height: 253 }}>
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
              style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 16, color: "#6CA59C" }}
            >
              {spot.title}
            </h1>

            {/* 상세 주소 */}
            <p
              className="mt-[5px]"
              style={{
                fontFamily: "Pretendard",
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
              style={{ fontFamily: "Pretendard", fontWeight: 400, fontSize: 14, lineHeight: "110%", color: "#000000" }}
            >
              {spot.description}
            </p>
            {isDescClamped && (
              <button
                type="button"
                onClick={() => setIsDescExpanded((v) => !v)}
                className="mt-1 text-gray-500 hover:text-gray-400 active:text-gray-400 transition-colors"
                style={{ fontFamily: "Pretendard", fontWeight: 600, fontSize: 13 }}
              >
                {isDescExpanded ? "접기" : "더보기"}
              </button>
            )}

            {/* 네이버 지도 */}
            <div
              ref={mapRef}
              className="mt-6 flex items-center justify-center bg-[#EEEEEE] text-sm text-gray-400"
              style={{ width: 360, height: 222 }}
            >
              {typeof window !== "undefined" && !window.naver && "지도 SDK 로드 필요"}
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
                fontFamily: "Pretendard",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              지도 확인하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}