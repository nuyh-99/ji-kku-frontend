"use client";

import { use, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getFestivalDetail } from "@/lib/api/spot";
import { mapFestivalDetailToDetailData } from "@/features/event-regions/utils/mapFestivalDetail";
import { loadKakaoMapSdk, buildKakaoMapLink } from "@/lib/map/kakaoMap";

// TODO: 실제로는 API에서 이미지 배열(images: string[])을 받아와야 함.
function useFestivalImages(imageUrl: string) {
  return imageUrl ? [imageUrl] : [];
}

export default function FestivalDetailPage({
  params,
}: {
  params: Promise<{ festivalId: string }>;
}) {
  const { festivalId } = use(params);
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["festivalDetail", festivalId],
    queryFn: () => getFestivalDetail(festivalId),
  });

  if (isLoading) return <div className="px-4 py-4">로딩 중...</div>;
  if (isError || !data) return <div className="px-4 py-4">정보를 불러오지 못했습니다.</div>;

  const festival = mapFestivalDetailToDetailData(data);

  return <FestivalDetailContent festival={festival} onBack={() => router.back()} />;
}

function FestivalDetailContent({
  festival,
  onBack,
}: {
  festival: ReturnType<typeof mapFestivalDetailToDetailData>;
  onBack: () => void;
}) {
  const images = useFestivalImages(festival.imageUrl);
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // --- 스케일 캔버스 (여기 추가) ---
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
  return () => {
    window.removeEventListener("resize", update);
  };
}, []);
  // --- 이미지 스크롤 캐러셀 ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ... 이하 기존 코드 그대로

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentIndex(index);
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

    const center = new window.kakao.maps.LatLng(festival.lat, festival.lng);
    const map = new window.kakao.maps.Map(mapRef.current, { center, level: 4 });
    new window.kakao.maps.Marker({ position: center, map });
  }, [isMapSdkReady, festival.lat, festival.lng]);

  const handleCheckLocation = () => {
    const { lat, lng, title } = festival;
    window.open(buildKakaoMapLink(title, lat, lng), "_blank");
  };

  return (
    
<div
  ref={outerRef}
  className="w-full flex items-center justify-center overflow-hidden"
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
          <button aria-label="뒤로가기" onClick={() => router.back()} type="button"
          className="flex items-center justify-center rounded-full hover:bg-gray-200 active:bg-gray-200 transition-colors"
          style={{ width: 40, height: 40, margin: -6 }}
>
            <Image src="/assets/chevron-left.svg" alt="뒤로가기" width={28} height={28} className="shrink-0" />
          </button>

          <button aria-label="메뉴" onClick={() => router.push("/mypage")} type="button"
            className="flex items-center justify-center rounded-full hover:bg-gray-200 active:bg-gray-200 transition-colors"
            style={{ width: 40, height: 40, margin: -6 }}
            >
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
      </div>

      {/* 이미지 캐러셀 (가로 스크롤로 넘김) */}
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
        alt={`${festival.title} 이미지 ${i + 1}`}
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

        {/* 페이지 카운터 */}
        {images.length > 0 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white">
            {currentIndex + 1} | {images.length}
          </span>
        )}
      </div>

      <div className="px-[17px]">
        {/* 축제 이름 */}
        <h1
          className="mt-[15px]"
          style={{ fontWeight: 700, fontSize: 16,  color: "#6CA59C" }}
        >
          {festival.title}
        </h1>

        {/* 상세 주소 */}
        <p
          className="mt-[5px]"
          style={{ fontWeight: 400, fontSize: 12, lineHeight: "100%", letterSpacing: "0em", color: "#9C9C9C" }}
        >
          {festival.address}
        </p>

       {/* 상세 설명 */}
<p
  className={`mt-[15px] whitespace-pre-line ${isExpanded ? "" : "line-clamp-2"}`}
  style={{  fontWeight: 400, fontSize: 14, lineHeight: "110%", color: "#000000" }}
>
  {festival.description}
</p>
<button
  type="button"
  onClick={() => setIsExpanded((prev) => !prev)}
  className="mt-1 text-gray-500 hover:text-gray-400 active:text-gray-400 transition-colors"
  style={{ fontWeight: 600, fontSize: 13 }}
>
  {isExpanded ? "접기" : "더보기"}
</button>

        {/* 이용 정보 (축제 전용 데이터: period, venue 반영) */}
        <dl
          className="mt-[8px] space-y-0.5"
          style={{   fontWeight: 400, lineHeight: "100%", fontSize: 14, color: "#000000" }}
        >
          <div className="flex gap-1">
            <dt className="text-gray-500">축제기간 :</dt>
            <dd className="text-gray-500">{festival.period}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-gray-500">지역 :</dt>
            <dd className="text-gray-500">{festival.venue}</dd>
          </div>
        </dl>

        {/* 카카오맵 */}
        <div
          ref={mapRef}
          className="mt-6 flex items-center justify-center bg-[#EEEEEE] text-sm text-gray-400"
          style={{ width: 360, height: 222 }}
        >
          {isMapSdkError && "지도를 불러오지 못했습니다"}
          {!isMapSdkReady && !isMapSdkError && "지도 로딩 중..."}
        </div>

        {/* 위치 확인하기 버튼 → 카카오맵 웹으로 새 탭 이동 */}
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
    </div>
  );
}