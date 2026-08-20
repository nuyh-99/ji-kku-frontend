"use client";

import { use, useMemo, useRef, useState, useLayoutEffect, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getMissionSpots, type MissionSpotItem } from "@/lib/api/mission";
import GangwonMapSvg from "@/components/map/GangwonMapSvg";
import { getEupmyeondongMap } from "@/data/regions/eupmyeondong";

// ==========================================
// 🎛️ 지도 및 핀 보정 상수 설정
// ==========================================
const LEFT_ALIGN_OFFSET_X = 20;

const DEFAULT_MAP_WIDTH = 393; // 초기 너비
const MAP_HEIGHT = 500; // 지도 컨테이너 높이
const ZOOM = 1.4; // 지도가 상하로 짤리지 않도록 적절한 배율 설정

const PAN_PADDING_X = 50; // 좌우 드래그 가능 여백

// 📍 핀 보정 오프셋
const PIN_OFFSET_X = -250; // 핀 너비(40px)의 절반만큼 좌로 이동하여 중앙 맞춤
const PIN_OFFSET_Y = -410; // 핀 높이(40px)만큼 위로 올려서 뾰족한 끝이 지점에 닿게 함

/**
 * 🛠️ 백엔드 연동용: mapX(경도), mapY(위도) -> SVG viewBox 좌표 변환 함수
 */
function calculatePinCoordinates(spot: MissionSpotItem, viewBox?: string) {
  let x = 0;
  let y = 0;

  // 💡 string이든 number든 안전하게 숫자로 수치화
  const lng = Number(spot.mapX);
  const lat = Number(spot.mapY);

  if (!isNaN(lng) && !isNaN(lat) && lng > 0 && lat > 0 && viewBox) {
    const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(" ").map(Number);

    const MIN_LNG = 127.0;
    const MAX_LNG = 129.6;
    const MIN_LAT = 37.0;
    const MAX_LAT = 38.6;

    const ratioX = (lng - MIN_LNG) / (MAX_LNG - MIN_LNG);
    const ratioY = (MAX_LAT - lat) / (MAX_LAT - MIN_LAT);

    x = vbX + ratioX * vbWidth;
    y = vbY + ratioY * vbHeight;
  } else {
    const item = spot as any;
    x = Number(item.x ?? 0);
    y = Number(item.y ?? 0);
  }

  return {
    x: x + PIN_OFFSET_X,
    y: y + PIN_OFFSET_Y,
  };
}

export default function EventRegionPage({
  params,
}: {
  params: Promise<{ sigunguCd: string }>;
}) {
  const { sigunguCd } = use(params);
  const router = useRouter();
  const sigunguCdNum = Number(sigunguCd);

  // 📌 1. MissionSpotItem[] (배열) 타입으로 useQuery 타입 명시
  const { data: spotList = [], isLoading, isError } = useQuery<MissionSpotItem[]>({
    queryKey: ["missionSpots", sigunguCdNum],
    queryFn: () => getMissionSpots(sigunguCdNum),
  });

  if (isLoading) return <div className="px-4 py-4 text-white">로딩 중...</div>;
  if (isError || !spotList) return <div className="px-4 py-4 text-white">정보를 불러오지 못했습니다.</div>;

  // 📌 2. spot 대신 배열인 spots=spotList 로 전달
  return <EventRegionContent sigunguCd={sigunguCdNum} spots={spotList} onBack={() => router.back()} />;
}

function EventRegionContent({
  sigunguCd,
  spots,
  onBack,
}: {
  sigunguCd: number;
  spots: MissionSpotItem[]; // 📌 3. 단일 객체 -> 배열 타입으로 변경
  onBack: () => void;
}) {
  // contentId 기준으로 클릭 상태 관리
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [popupScreenPos, setPopupScreenPos] = useState<{ x: number; y: number } | null>(null);

  const map = getEupmyeondongMap(String(sigunguCd));

  // 컨테이너 너비 측정
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapWidth, setMapWidth] = useState(DEFAULT_MAP_WIDTH);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setMapWidth(el.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 맨 왼쪽 정렬 기준 offset 계산
  const baseLeftOffset = useMemo(() => {
    const leftX = (mapWidth * (ZOOM - 1)) / 2 + LEFT_ALIGN_OFFSET_X;
    return { x: leftX, y: 0 };
  }, [mapWidth]);

  const mapMaxOffsetX = (mapWidth * (ZOOM - 1)) / 2 + PAN_PADDING_X;
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const getPanClampedOffset = (rawX: number) => {
    return {
      x: clamp(rawX, -mapMaxOffsetX, mapMaxOffsetX + LEFT_ALIGN_OFFSET_X * 2),
      y: 0,
    };
  };

  const [offset, setOffset] = useState(baseLeftOffset);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setOffset(baseLeftOffset);
  }, [baseLeftOffset]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;

    draggingRef.current = true;
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startOffsetRef.current = offset;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const deltaX = e.clientX - startPosRef.current.x;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setOffset(getPanClampedOffset(startOffsetRef.current.x + deltaX));
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    setIsDragging(false);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
  };

  // 📍 스팟 마커 클릭 시 팝업 스크린 좌표 계산 (클릭된 특정 spot의 contentId 저장)
  const handleSpotClick = (e: React.MouseEvent, contentId: number) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setSelectedContentId(contentId);

    const POPUP_HEIGHT = 171;
    // 마커(where.png + ellipse) 세로 길이의 절반만큼 팝업이 마커 쪽으로 겹치게 함
    const overlapOffset = rect.height / 2;

    const showBelow = rect.top + overlapOffset - POPUP_HEIGHT < 20;

    setPopupScreenPos({
      x: Math.min(rect.left - 50, window.innerWidth - 150),
      y: showBelow
        ? rect.bottom - overlapOffset // 아래에 띄우되 마커 위쪽 절반과 겹침
        : rect.top + overlapOffset - POPUP_HEIGHT, // 위에 띄우되 마커 아래쪽 절반과 겹침
    });
  };
  // 선택된 spot 객체 찾기
  const selectedSpot = spots.find((s) => s.contentId === selectedContentId);
  const router = useRouter();
  return (
    <div className="relative min-h-screen w-full max-w-[393px] mx-auto overflow-hidden pb-8 select-none">
      {/* 1. 배경 이미지 & 블러 */}
      <div
        className="pointer-events-none absolute z-0 overflow-hidden"
        style={{ width: 430, height: 872, top: -2, left: -20 }}
      >
        <Image
          src="/event-region/event-background.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0 bg-black/10"
          style={{
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        />
      </div>

      {/* 2. 상단 헤더 & 게이지 */}
      <div className="relative px-[17px] pb-4" style={{ paddingTop: 44 }}>
        <header className="flex items-center justify-between mb-[5px]">
          <button aria-label="뒤로가기" onClick={() => router.back()} type="button">
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

        <EventRegionGauge visitedCount={spots.filter((s) => s.isCompleted).length} />

        <p
  className="absolute text-[14px] text-white/70"
  style={{
    top: 130, // 이 값이 현재 너무 아래에 있다면, 게이지 바(top: 20) 위쪽으로 오도록 더 작은 값(예: -12 등)으로 올려주셔야 합니다!
    left: 40,
    color: "#FFF",
    textAlign: "center",
    fontFamily: "Pretendard",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "normal",
  }}
>
          이벤트 지역 5곳을 방문하고 지역 배지를 수집해보세요!
        </p>
      </div>

      {/* 3. SVG 지도 영역 */}
      <div className="mt-15">
      {map ? (
        <div
          ref={containerRef}
          className="relative z-10 w-full overflow-hidden select-none flex items-center justify-center"
          style={{
            height: MAP_HEIGHT,
            touchAction: "none",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* SVG 선 그라디언트 정의 */}
          <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
            <defs>
              <radialGradient id="border-fade-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#9C9C9C" stopOpacity="1" />
                <stop offset="65%" stopColor="#9C9C9C" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#9C9C9C" stopOpacity="0.2" />
              </radialGradient>
            </defs>
          </svg>

          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${ZOOM})`,
              transformOrigin: "center center",
              willChange: "transform",
            }}
          >
            <div
              className="relative h-full w-full flex items-center justify-center
                [&_path]:[transform-box:fill-box]
                [&_path]:[transform-origin:center]
                [&_path]:[transform:scale(0.979)]
                [&_path]:stroke-[url(#border-fade-gradient)]
                [&_path]:[stroke-width:2px]
                [&_path]:[stroke-linejoin:round]
                [&_path]:[stroke-linecap:round]
                [&_path]:[paint-order:stroke_fill]"
              style={{
                filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.5))",
              }}
            >
              <GangwonMapSvg
                regions={map.regions}
                viewBox={map.viewBox}
                labelSize={map.labelSize}
                ariaLabel="이벤트 지역 지도"
                className="w-full h-full max-h-full object-contain"
                overlay={
                  <g className="mission-spot-markers pointer-events-auto">
                    {/* 📌 4. 배열(spots)을 map으로 반복하여 마커 여러 개 그리기 */}
                    {spots.map((item) => (
                      <MissionSpotMarker
                        key={item.contentId}
                        spot={item}
                        viewBox={map.viewBox}
                        onClick={(e) => handleSpotClick(e, item.contentId)}
                      />
                    ))}
                  </g>
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex h-[300px] w-full items-center justify-center text-sm text-white/70">
          준비중입니다
        </div>
      )}
      </div>

      {/* 4. 하얀색 팝업 박스 (선택된 spot이 있을 때만 렌더링) */}
      {selectedSpot && popupScreenPos && (
        <EventSpotPopup
          sigunguCd={sigunguCd}
          spot={selectedSpot}
          screenPos={popupScreenPos}
          onClose={() => {
            setSelectedContentId(null);
            setPopupScreenPos(null);
          }}
        />
      )}
    </div>
  );
}

// 📌 마커 컴포넌트
function MissionSpotMarker({
  spot,
  viewBox,
  onClick,
}: {
  spot: MissionSpotItem;
  viewBox?: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const { x: spotX, y: spotY } = calculatePinCoordinates(spot, viewBox);

  return (
    <g
      transform={`translate(${spotX}, ${spotY})`}
      onClick={onClick}
      className="cursor-pointer transition-transform duration-200 hover:scale-110"
      style={{ pointerEvents: "all" }}
    >
      <ellipse
        cx="0"
        cy="0"
        rx={10.5}
        ry={5}
        fill="#9C9C9C85"
      />
      <image
        href="/event-region/where.png"
        x="-20"
        y="-40"
        width="40"
        height="40"
        preserveAspectRatio="xMidYMid meet"
      />
    </g>
  );
}

function EventRegionGauge({ visitedCount }: { visitedCount: number }) {
  const clamped = Math.min(5, Math.max(0, visitedCount));

  // 💡 시작점으로부터 70px씩 누적되도록 설정 (마지막은 317)
  const widths = [0, 15,85, 155, 225, 295];
  const fillWidth = widths[clamped];

  const numberLefts = [30, 100, 170, 240, 315];

  return (
    <div className="relative h-[100px] w-full">
      {/* 숫자 1~5 */}
      {numberLefts.map((leftPos, i) => (
        <span
          key={i + 1}
          className="absolute text-[12px] text-[#294E49]"
          style={{
            top: 0,
            left: leftPos,
            fontFamily: "Pretendard",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "normal",
          }}
        >
          {i + 1}
        </span>
      ))}

      {/* 배경 게이지 바 */}
      <div
        className="absolute rounded-[126px]"
        style={{ top: 20, left: 18, width: 315, height: 26, background: "#6CA59C" }}
      >
        {clamped > 0 && (
          <div
            className="absolute rounded-l-[126px] transition-all duration-500"
            style={{
              top: 0,
              left: 0,
              width: fillWidth, // 💡 게이지 바 시작점으로부터 70px 간격씩 채워짐
              height: 26,
              background: "#FFFFFF",
              boxShadow: "0px 0px 10px 2px #FFFFFF",
            }}
          />
        )}
      </div>
    </div>
  );
}

function EventSpotPopup({
  sigunguCd,
  spot,
  screenPos,
  onClose,
}: {
  sigunguCd: number;
  spot: MissionSpotItem;
  screenPos: { x: number; y: number };
  onClose: () => void;
}) {
  const router = useRouter();

  // 💡 백엔드에서 string으로 내려주는 firstImage를 검사해서
  // 없으면(undefined/null/빈 문자열) noimage.jpg를 사용
  let imageUrl: string;

  if (!spot.firstImage || spot.firstImage.trim() === "") {
    imageUrl = "/festivals/noimage.jpg";
  } else if (spot.firstImage.startsWith("http://")) {
    imageUrl = spot.firstImage.replace("http://", "https://");
  } else {
    imageUrl = spot.firstImage;
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />

      <div
        className="fixed z-50 overflow-hidden rounded-[9px] bg-[#FFFFFF]"
        style={{
          top: screenPos.y,
          left: screenPos.x,
          width: 136,
          height: 171,
          boxShadow: "0px 0px 12px 0px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute overflow-hidden rounded-[9px] bg-[#E5E5E5]"
          style={{ top: 3, left: 3, width: 130, height: 97 }}
        >
          {/* 💡 Next.js Image 대신 기본 <img> 태그 사용 (next.config 설정 제약 우회) */}
          <img
            src={imageUrl}
            alt={spot.title || "스팟 이미지"}
            className="w-full h-full object-cover"
            onError={(e) => {
              // 이미지 로드 실패 시(404, 깨진 링크 등) 기본 이미지로 대체
              e.currentTarget.src = "/festivals/noimage.jpg";
            }}
          />
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute flex items-center justify-center rounded-full bg-black/40 z-10"
            style={{ top: 2, right: 2, width: 16, height: 16 }}
          >
            <svg width={10} height={10} viewBox="0 0 9 9" fill="none">
              <path d="M1 1L8 8M8 1L1 8" stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        <p
          className="absolute truncate text-[12px] font-semibold text-black"
          style={{ top: 108, left: 10, width: 116, height: 14, fontFamily: "Pretendard" }}
        >
          {spot.title}
        </p>

        <p
          className="absolute truncate text-[8px] text-[#9C9C9C]"
          style={{ top: 124, left: 10, width: 116, height: 10, fontFamily: "Pretendard" }}
        >
          {spot.overview || "상세 페이지에서 확인하세요."}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const currentSigungu = spot.sigunguCd || sigunguCd;
            router.push(`/event-regions/${sigunguCd}/${spot.contentId}`);
          }}
          className="absolute flex items-center justify-center rounded-[3.8px] cursor-pointer z-10"
          style={{ top: 142.54, left: 10, width: 116, height: 20.92, background: "#FCEFEF" }}
        >
          <span className="text-[8.56px] text-[#FF3030]">자세히보기</span>
          <svg className="ml-1" style={{ width: 10.46, height: 10.46 }} viewBox="0 0 11 11" fill="none">
            <path d="M4 2L7.5 5.5L4 9" stroke="#FF3030" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </>
  );
}