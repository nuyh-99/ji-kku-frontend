"use client";

import { use, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getFestivalDetail } from "@/lib/api/spot";
import { mapFestivalDetailToDetailData } from "@/features/event-regions/utils/mapFestivalDetail";

// TODO: 실제로는 API에서 이미지 배열(images: string[])을 받아와야 함.
function useFestivalImages(imageUrl: string) {
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

  // --- 이미지 스크롤 캐러셀 ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentIndex(index);
  };

  // --- 네이버 지도 ---
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.naver || !mapRef.current) return;

    const center = new window.naver.maps.LatLng(festival.lat, festival.lng);
    const map = new window.naver.maps.Map(mapRef.current, {
      center,
      zoom: 16,
    });
    new window.naver.maps.Marker({ position: center, map });
  }, [festival.lat, festival.lng]);

  const handleCheckLocation = () => {
    const { lat, lng, title } = festival;
    const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(
      title
    )}?c=${lng},${lat},16,0,0,0,dh`;
    window.open(naverMapUrl, "_blank");
  };

  return (
    <div className="relative w-full max-w-[393px] mx-auto pb-8" style={{ paddingTop: 44 }}>
      <div className="px-[17px]">
        <header
          className="flex items-start justify-center mb-4"
          style={{ width: 359, height: 28, gap: 303 }}
        >
          <button aria-label="뒤로가기" onClick={onBack} type="button">
            <Image src="/assets/chevron-left.svg" alt="뒤로가기" width={28} height={28} className="shrink-0" />
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
          className="mt-[26px]"
          style={{ fontFamily: "Pretendard", fontWeight: 700, fontSize: 16, lineHeight: "100%", color: "#6CA59C" }}
        >
          {festival.title}
        </h1>

        {/* 상세 주소 */}
        <p
          className="mt-1"
          style={{ fontFamily: "Pretendard", fontWeight: 400, fontSize: 12, lineHeight: "100%", color: "#9C9C9C" }}
        >
          {festival.address}
        </p>

        {/* 상세 설명 */}
        <p
          className="mt-6 whitespace-pre-line"
          style={{ fontFamily: "Pretendard", fontWeight: 400, fontSize: 14, lineHeight: "160%", color: "#000000" }}
        >
          {festival.description}
        </p>

        {/* 이용 정보 (축제 전용 데이터: period, venue 반영) */}
        <dl
          className="mt-4 space-y-1"
          style={{ fontFamily: "Pretendard", fontWeight: 400, fontSize: 14, color: "#000000" }}
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

        {/* 네이버 지도 */}
        <div
          ref={mapRef}
          className="mt-6 flex items-center justify-center bg-[#EEEEEE] text-sm text-gray-400"
          style={{ width: 360, height: 222 }}
        >
          {typeof window !== "undefined" && !window.naver && "지도 SDK 로드 필요"}
        </div>

        {/* 위치 확인하기 버튼 → 네이버 지도 웹으로 새 탭 이동 */}
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
  );
}