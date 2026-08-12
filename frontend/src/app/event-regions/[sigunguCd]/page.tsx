"use client";

import { use, useMemo, useRef, useState, useLayoutEffect, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { ChevronLeftIcon, MenuIcon } from "@/components/common/icons";
import { getMissionSpots } from "@/lib/api/mission";
import GangwonMapSvg from "@/components/map/GangwonMapSvg";
import { getEupmyeondongMap } from "@/data/regions/eupmyeondong";
import type { MissionSpotItem } from "@/types/mission";

// ==========================================
// 🎛️ 지도 및 핀 보정 상수 설정
// ==========================================
const LEFT_ALIGN_OFFSET_X = 20; 

const DEFAULT_MAP_WIDTH = 393; // 초기 너비
const MAP_HEIGHT = 500; // 지도 컨테이너 높이
const ZOOM = 1.4; // 지도가 상하로 짤리지 않도록 적절한 배율 설정

const PAN_PADDING_X = 50; // 좌우 드래그 가능 여백

// 📍 지도가 상단 여백(mb-30) 및 ZOOM(1.4) 영향으로 아래로 내려간 현상을 반영한 핀 오프셋
const PIN_OFFSET_X = -260; // 핀 너비(40px)의 절반 및 지도 레이아웃 중심 보정
const PIN_OFFSET_Y = -410; // 핀 높이(40px) 및 상단 여백 밀림 수직 보정

/**
 * 🛠️ 사용자 화면 레이아웃(지도 위치 밀림)을 고려한 핀 좌표 계산 함수
 */
function calculatePinCoordinates(spot: MissionSpotItem, viewBox?: string) {
  let x = 0;
  let y = 0;

  // 백엔드 응답 데이터(mapX, mapY) 수치화
  const lng = Number(spot.mapX); // 경도 (128.xxxx)
  const lat = Number(spot.mapY); // 위도 (37.xxxx ~ 38.xxxx)

  if (!isNaN(lng) && !isNaN(lat) && lng > 0 && lat > 0 && viewBox) {
    const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(" ").map(Number);

    // 강원도 및 시군구 영역 기준 Bounding Box
    const MIN_LNG = 127.0; // 강원 서쪽 끝
    const MAX_LNG = 129.6; // 강원 동쪽 끝
    const MIN_LAT = 37.0;  // 강원 남쪽 끝
    const MAX_LAT = 38.6;  // 강원 북쪽 끝

    // 1. 위경도 -> SVG viewBox 내 기본 비율 좌표 계산 (0 ~ 1)
    const ratioX = (lng - MIN_LNG) / (MAX_LNG - MIN_LNG);
    const ratioY = (MAX_LAT - lat) / (MAX_LAT - MIN_LAT);

    // 2. SVG 내 1차 좌표 계산
    const rawX = vbX + ratioX * vbWidth;
    const rawY = vbY + ratioY * vbHeight;

    // 3. 지도가 내려간 보정값(PIN_OFFSET) 적용
    x = rawX + PIN_OFFSET_X;
    y = rawY + PIN_OFFSET_Y;
  } else {
    // 예외 처리 (좌표가 누락된 경우)
    const item = spot as any;
    x = Number(item.x ?? 0) + PIN_OFFSET_X;
    y = Number(item.y ?? 0) + PIN_OFFSET_Y;
  }

  return { x, y };
}

export default function EventRegionPage({
  params,
}: {
  params: Promise<{ sigunguCd: string }>;
}) {
  const { sigunguCd } = use(params);
  const router = useRouter();
  const sigunguCdNum = Number(sigunguCd);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["missionSpots", sigunguCdNum],
    queryFn: () => getMissionSpots(sigunguCdNum),
  });

  if (isLoading) return <div className="px-4 py-4 text-white">로딩 중...</div>;
  if (isError || !data) return <div className="px-4 py-4 text-white">정보를 불러오지 못했습니다.</div>;

  return <EventRegionContent sigunguCd={sigunguCdNum} missions={data} onBack={() => router.back()} />;
}

function EventRegionContent({
  sigunguCd,
  missions,
  onBack,
}: {
  sigunguCd: number;
  missions: { completedCount: number; content: MissionSpotItem[] };
  onBack: () => void;
}) {
  // missionSpotId 기준으로 클릭 상태 관리
  const [selectedMissionSpotId, setSelectedMissionSpotId] = useState<number | null>(null);
  const [popupScreenPos, setPopupScreenPos] = useState<{ x: number; y: number } | null>(null);

  const map = getEupmyeondongMap(String(sigunguCd));
  const visitedCount = Math.min(5, missions.completedCount);

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

  // 좌우 X축 제약만 적용 (Y축 0 고정)
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

  // 📍 스팟 마커 클릭 시 스크린 위치 측정 핸들러
  const handleSpotClick = (spot: MissionSpotItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setSelectedMissionSpotId(spot.missionSpotId);
    setPopupScreenPos({
      x: Math.min(rect.left - 50, window.innerWidth - 150),
      y: rect.top - 120 < 20 ? rect.bottom + 50 : rect.top - 150,
    });
  };

  const selectedSpot = selectedMissionSpotId
    ? missions.content.find((s) => s.missionSpotId === selectedMissionSpotId) ?? null
    : null;

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
      <div className="relative z-10">
        <header className="flex items-center justify-between px-4 py-3 text-[#000000]">
          <button aria-label="뒤로가기" onClick={onBack}>
            <ChevronLeftIcon className="size-6" />
          </button>
          <button aria-label="메뉴">
            <MenuIcon className="size-6" />
          </button>
        </header>

        <EventRegionGauge visitedCount={map ? visitedCount : 0} />

        <p className="text-center text-[13px] text-white/90 mb-30 font-medium">
          이벤트 지역 5곳을 방문하고 지역 배지를 수집해보세요! ⓘ
        </p>
      </div>

      {/* 3. SVG 지도 영역 */}
      {map ? (
        <div
          ref={containerRef}
          className="relative z-10 w-full overflow-hidden select-none flex items-center justify-center"
          style={{
            height: MAP_HEIGHT,
            touchAction: "pan-x",
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

                /* 테두리 두께 적용 */
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
                  /* 📍 백엔드 데이터 연동 마커 그룹 */
                  <g className="mission-spot-markers pointer-events-auto">
                    {missions.content.map((spot) => (
                      <MissionSpotMarker
                        key={spot.missionSpotId}
                        spot={spot}
                        viewBox={map.viewBox}
                        onClick={(e) => handleSpotClick(spot, e)}
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

      {/* 4. 팝업 */}
      {selectedSpot && popupScreenPos && (
        <EventSpotPopup
          spot={selectedSpot}
          screenPos={popupScreenPos}
          onClose={() => {
            setSelectedMissionSpotId(null);
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
      {/* 1. 타원 그림자 */}
      <ellipse
        cx="0"
        cy="0"
        rx={10.5}
        ry={5}
        fill="#9C9C9C85"
      />

      {/* 2. Where Icon - 핀의 뾰족한 밑부분 끝이 (spotX, spotY) 지점에 닿도록 세팅 */}
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
  const fillWidth = (clamped / 5) * 333;
  const numberLefts = [37, 113, 191, 269, 347];

  return (
    <div className="relative h-[100px] w-full">
      {[1, 2, 3, 4, 5].map((n, i) => (
        <span
          key={n}
          className="absolute text-[12px] font-bold leading-none text-[#294E49]"
          style={{ top: 42, left: numberLefts[i], fontFamily: "Pretendard" }}
        >
          {n}
        </span>
      ))}
      <div
        className="absolute rounded-[126px]"
        style={{ top: 60, left: 30, width: 333, height: 26, background: "#6CA59C" }}
      >
        {clamped > 0 && (
          <div
            className="absolute rounded-l-[126px] transition-all duration-500"
            style={{
              top: 0,
              left: 0,
              width: fillWidth,
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
  spot,
  screenPos,
  onClose,
}: {
  spot: MissionSpotItem;
  screenPos: { x: number; y: number };
  onClose: () => void;
}) {
  const router = useRouter();

  // 백엔드 명세상 overview가 없으므로 디폴트 문구 출력 처리
  const spotOverview = (spot as any).overview || "상세 페이지에서 확인하세요.";

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
        <div className="absolute overflow-hidden rounded-[9px] bg-[#E5E5E5]" style={{ top: 3, left: 3, width: 130, height: 97 }}>
          <Image 
            src={spot.firstImage ?? "/event-region/default-spot.png"} 
            alt={spot.title} 
            fill 
            className="object-cover" 
          />
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute flex items-center justify-center rounded-full bg-black/40"
            style={{ top: -1.75, right: -1.75, width: 12.39, height: 12.39, transform: "rotate(-45deg)" }}
          >
            <svg width={8.26} height={8.26} viewBox="0 0 9 9" fill="none">
              <path d="M4.5 0V9M0 4.5H9" stroke="#FFFFFF" strokeWidth="1.2" />
            </svg>
          </button>
        </div>

        <p className="absolute truncate text-[12px] font-semibold text-black" style={{ top: 108, left: 10, width: 116, height: 14, fontFamily: "Pretendard" }}>
          {spot.title}
        </p>

        <p className="absolute truncate text-[8px] text-[#9C9C9C]" style={{ top: 124, left: 10, width: 116, height: 10, fontFamily: "Pretendard" }}>
          {spotOverview}
        </p>

        {/* 💡 자세히보기 클릭시 관광지 식별자인 contentId로 상세 페이지 라우팅 */}
        <button
          type="button"
          onClick={() => router.push(`/event-region/spot/${spot.contentId}`)}
          className="absolute flex items-center rounded-[3.8px]"
          style={{ top: 142.54, left: 10, width: 116, height: 20.92, background: "#FCEFEF" }}
        >
          <span className="absolute text-[8.56px]" style={{ top: 4.75, left: 38.03, width: 40, height: 10, color: "#FF3030", fontFamily: "Pretendard" }}>
            자세히보기
          </span>
          <svg className="absolute" style={{ top: 4.46, left: 104, width: 10.46, height: 10.46 }} viewBox="0 0 11 11" fill="none">
            <path d="M4 2L7.5 5.5L4 9" stroke="#FF3030" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </>
  );
}