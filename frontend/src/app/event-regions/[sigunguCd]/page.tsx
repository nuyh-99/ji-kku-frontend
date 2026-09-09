"use client";

import { use, useMemo, useRef, useState, useLayoutEffect, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getMissionSpots, type MissionSpotItem } from "@/lib/api/mission";
import GangwonMapSvg from "@/components/map/GangwonMapSvg";
import { getEupmyeondongMap } from "@/data/regions/eupmyeondong";
import type { MissionSpotsResult } from "@/types/mission";
// ==========================================
// 🎛️ 지도 및 핀 보정 상수 설정
// ==========================================
const LEFT_ALIGN_OFFSET_X = 20;
const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 852;

const DEFAULT_MAP_WIDTH = 393; // 초기 너비
const MAP_HEIGHT = 700; // 지도 컨테이너 높이
const DESIRED_ZOOM = 1.1; // 지도가 상하로 짤리지 않도록 적절한 배율 설정

const PAN_PADDING_X = 50; // 좌우 드래그 가능 여백
const PAN_PADDING_Y = 100;


// 📍 핀 보정 오프셋
const PIN_OFFSET_X = -250; // 핀 너비(40px)의 절반만큼 좌로 이동하여 중앙 맞춤
const PIN_OFFSET_Y = -410; // 핀 높이(40px)만큼 위로 올려서 뾰족한 끝이 지점에 닿게 함

// ==========================================
// 🎛️ 지역별(sigunguCd) 위경도 → SVG 좌표 보정값
// scripts/generate-eupmyeondong.mjs 의 웹 메르카토르 투영 + fit 로직을
// 프론트에서 재현하기 위한 지역별 계수. 값은 지역마다 캘리브레이션 필요.
// (담당자에게 transform export 요청 전까지의 임시 우회.)
// ==========================================
const REGION_TRANSFORM: Record
  string,
  { scale: number; offsetX: number; offsetY: number; minX: number; maxY: number }
> = {
  "51110": { scale: 72102.351635, offsetX: 12.2, offsetY: 12, minX: 2.225414, maxY: 0.719876 }, // 춘천
  "51130": { scale: 79451.800491, offsetX: 12.6, offsetY: 12, minX: 2.229551, maxY: 0.707101 }, // 원주
  "51150": { scale: 76524.954399, offsetX: 12, offsetY: 12.5, minX: 2.244151, maxY: 0.71618 }, // 강릉
  "51170": { scale: 185818.261793, offsetX: 12, offsetY: 13.5, minX: 2.250735, maxY: 0.709286 }, // 동해
  "51190": { scale: 138886.748676, offsetX: 63.9, offsetY: 12, minX: 2.249156, maxY: 0.703564 }, // 태백
  "51210": { scale: 190481.309113, offsetX: 16.3, offsetY: 12, minX: 2.241349, maxY: 0.723115 }, // 속초
  "51230": { scale: 72741.486887, offsetX: 12, offsetY: 12.7, minX: 2.248784, maxY: 0.70644 }, // 삼척
  "51720": { scale: 34311.635496, offsetX: 25.6, offsetY: 12, minX: 2.22591, maxY: 0.716777 }, // 홍천
  "51730": { scale: 69075.742939, offsetX: 13.6, offsetY: 12, minX: 2.229819, maxY: 0.71094 }, // 횡성
  "51750": { scale: 46120.465864, offsetX: 20.3, offsetY: 12, minX: 2.235994, maxY: 0.704933 }, // 영월
  "51760": { scale: 70736.064222, offsetX: 18.9, offsetY: 12, minX: 2.238271, maxY: 0.714028 }, // 평창
  "51770": { scale: 77812.800519, offsetX: 12, offsetY: 14, minX: 2.242854, maxY: 0.708992 }, // 정선
  "51780": { scale: 73745.579855, offsetX: 18.7, offsetY: 12, minX: 2.218476, maxY: 0.725552 }, // 철원
  "51790": { scale: 77763.93131, offsetX: 12.6, offsetY: 12, minX: 2.224083, maxY: 0.725842 }, // 화천
  "51800": { scale: 114515.232289, offsetX: 15.7, offsetY: 12, minX: 2.231225, maxY: 0.725552 }, // 양구
  "51810": { scale: 68742.697983, offsetX: 19.5, offsetY: 12, minX: 2.233624, maxY: 0.726377 }, // 인제
  "51820": { scale: 90591.847921, offsetX: 35.9, offsetY: 12, minX: 2.237581, maxY: 0.731711 }, // 고성
  "51830": { scale: 92605.643895, offsetX: 13, offsetY: 12, minX: 2.241075, maxY: 0.721573 }, // 양양
};

const toRadiansClient = (deg: number) => (deg * Math.PI) / 180;
const projectLonClient = (lon: number) => toRadiansClient(lon);
const projectLatClient = (lat: number) =>
  Math.log(Math.tan(Math.PI / 4 + toRadiansClient(lat) / 2));

/**
 * 🛠️ 백엔드 연동용: mapX(경도), mapY(위도) -> SVG viewBox 좌표 변환 함수
 * scripts/generate-eupmyeondong.mjs 의 웹 메르카토르 투영 로직을 지역별 계수로 재현.
 */
function calculatePinCoordinates(spot: MissionSpotItem, sigunguCd: number) {
  let x = 0;
  let y = 0;

  // 💡 string이든 number든 안전하게 숫자로 수치화
  const lng = Number(spot.mapX);
  const lat = Number(spot.mapY);
  const t = REGION_TRANSFORM[String(sigunguCd)];

  if (!isNaN(lng) && !isNaN(lat) && lng > 0 && lat > 0 && t) {
    const px = projectLonClient(lng);
    const py = projectLatClient(lat);

    x = (px - t.minX) * t.scale + t.offsetX;
    y = (t.maxY - py) * t.scale + t.offsetY;
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
  const { data, isLoading, isError } = useQuery<MissionSpotsResult>({
  queryKey: ["missionSpots", sigunguCdNum],
  queryFn: () => getMissionSpots(sigunguCdNum),
});

const spotList = data?.content ?? [];
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
  const [contentBox, setContentBox] = useState<{width:number;height:number} | null>(null);

 useLayoutEffect(() => {
  const svgEl = containerRef.current?.querySelector("svg");
  if (!svgEl) return;
  try {
    const { width, height } = (svgEl as SVGSVGElement).getBBox();
    if (width > 0 && height > 0) {   // 👈 유효한 값일 때만 반영
      setContentBox({ width, height });
    }
  } catch {
    // 렌더 전 호출 시 예외 무시
  }
}, [map?.viewBox, mapWidth]);
  const outerRef = useRef<HTMLDivElement>(null);
const [scale, setScale] = useState(1);

useLayoutEffect(() => {
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

 // 변경
const { effectiveZoom, mapMaxOffsetX, mapDownStopY, mapUpMaxOffsetY } = useMemo(() => {
  if (!map?.viewBox) return { effectiveZoom: 1, mapMaxOffsetX: 0, mapDownStopY: 0, mapUpMaxOffsetY: 0 };

  const vbW = (contentBox?.width || Number(map.viewBox.split(" ")[2])) || 1;
  const vbH = (contentBox?.height || Number(map.viewBox.split(" ")[3])) || 1;
  const mapAspect = vbW / vbH;
  const containerAspect = mapWidth / MAP_HEIGHT;

  let baseW: number, baseH: number;
  if (mapAspect > containerAspect) {
    baseW = mapWidth;
    baseH = mapWidth / mapAspect;
  } else {
    baseH = MAP_HEIGHT;
    baseW = MAP_HEIGHT * mapAspect;
  }

  const maxSafeZoom = MAP_HEIGHT / baseH;
  const zoom = Math.min(DESIRED_ZOOM, maxSafeZoom);

  const scaledW = baseW * zoom;
  const scaledH = baseH * zoom;

  const verticalOverflow = Math.max(0, (scaledH - MAP_HEIGHT) / 2);

  const PAN_PADDING_Y_UP_EXTRA = 40; // 👈 위로 더 올라갈 수 있게 보정하는 여유값 (숫자 조절하며 테스트)

return {
  effectiveZoom: zoom,
  mapMaxOffsetX: Math.max(0, (scaledW - mapWidth) / 2) + PAN_PADDING_X,
  mapDownStopY: verticalOverflow + PAN_PADDING_Y,
  mapUpMaxOffsetY: verticalOverflow + PAN_PADDING_Y_UP_EXTRA, // 👈 여기 보정
};
}, [map?.viewBox, mapWidth, contentBox]);
const baseOffset = useMemo(() => {
  const leftX = (mapWidth * (effectiveZoom - 1)) / 2 + LEFT_ALIGN_OFFSET_X;
  return { x: leftX, y: 0 };
}, [mapWidth, effectiveZoom]);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getPanClampedOffset = (rawX: number, rawY: number) => {
  return {
    x: clamp(rawX, -mapMaxOffsetX, mapMaxOffsetX + LEFT_ALIGN_OFFSET_X * 2),
    y: clamp(rawY, -mapUpMaxOffsetY, mapDownStopY),
  };
};

  const [offset, setOffset] = useState(baseOffset);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setOffset(baseOffset);
  }, [baseOffset]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
  if (e.button !== 0 && e.pointerType === "mouse") return;
  e.preventDefault();

  draggingRef.current = true;
  setIsDragging(true);   // 👈 누락되어 있던 부분
  startPosRef.current = { x: e.clientX, y: e.clientY };
  startOffsetRef.current = offset;

  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {}
};

  const targetOffsetRef = useRef(offset);
const LERP_FACTOR = 0.6; // 0~1, 작을수록 더 부드럽고 느리게 따라옴

const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
  if (!draggingRef.current) return;
  const deltaX = e.clientX - startPosRef.current.x;
  const deltaY = e.clientY - startPosRef.current.y;

  targetOffsetRef.current = getPanClampedOffset(
    startOffsetRef.current.x + deltaX,
    startOffsetRef.current.y + deltaY
  );

  if (!rafRef.current) {
    const animate = () => {
      setOffset((prev) => {
        const next = {
          x: prev.x + (targetOffsetRef.current.x - prev.x) * LERP_FACTOR,
          y: prev.y + (targetOffsetRef.current.y - prev.y) * LERP_FACTOR,
        };
        return next;
      });

      if (draggingRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  }
};

const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
  draggingRef.current = false;
  setIsDragging(false);

  if (rafRef.current) {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }
  // 최종 목표값으로 스냅 (transition이 부드럽게 처리)
  setOffset(targetOffsetRef.current);

  try {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  } catch {}
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
  <div
    ref={outerRef}
    className="w-full flex items-center justify-center overflow-hidden"
    style={{ height: "100dvh" }}
  >
    <div
      className="relative bg-white overflow-hidden select-none"
      style={{
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
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
      <div className="relative px-[17px] pb-4 z-20 pointer-events-none" style={{ paddingTop: 44 }}>
        <header className="flex items-center justify-between mb-[5px] pointer-events-auto">
          <button aria-label="뒤로가기" onClick={() => router.back()} type="button"
                    className="flex items-center justify-center rounded-full hover:bg-gray-200 active:bg-gray-200 transition-colors"
                    style={{ width: 40, height: 40, margin: -6 }}
          >
                      <Image
                        src="/assets/chevron-left.svg"
                        alt="뒤로가기"
                        width={28}
                        height={28}
                        className="shrink-0"
                      />
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

        <div className="pointer-events-auto">
          <EventRegionGauge visitedCount={spots.filter((s) => s.isCompleted).length} />
            </div>

        <p
  className="absolute text-[14px] text-white/70"
  style={{
    top: 130, // 이 값이 현재 너무 아래에 있다면, 게이지 바(top: 20) 위쪽으로 오도록 더 작은 값(예: -12 등)으로 올려주셔야 합니다!
    left: 0,
    right:0,
    margin: "0 auto",
    color: "#FFF",
    textAlign: "center",
    fontFamily: "Pretendard Variable",
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
      <div className="-mt-5">
      {map ? (
        <div
  ref={containerRef}
  className="relative z-10 w-full overflow-hidden select-none flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto"
  style={{
    height: MAP_HEIGHT,
  
    touchAction: "none",
    cursor: isDragging ? "grabbing" : "grab",
  }}
  onPointerDownCapture={handlePointerDown}   // 👈 여기 Capture로 변경
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
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${effectiveZoom})`,
    transformOrigin: "center center",
    willChange: "transform",
    transition: isDragging ? "none" : "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
  }}
>
            <div
              className="relative h-full w-full flex items-center justify-center
                
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
                 className="!w-full !h-full"
                overlay={
                  <g className="mission-spot-markers pointer-events-auto">
                    {/* 📌 4. 배열(spots)을 map으로 반복하여 마커 여러 개 그리기 */}
                    {spots.map((item) => (
                      <MissionSpotMarker
                        key={item.contentId}
                        spot={item}
                        sigunguCd={sigunguCd}
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
    </div>
  );
}

// 📌 마커 컴포넌트
function MissionSpotMarker({
  spot,
  sigunguCd,
  onClick,
}: {
  spot: MissionSpotItem;
  sigunguCd: number;
  onClick: (e: React.MouseEvent) => void;
}) {
  const { x: spotX, y: spotY } = calculatePinCoordinates(spot, sigunguCd);

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

  const widths = [0, 56.15, 115.6, 173.4, 231.2, 289];
  const fillWidth = widths[clamped];

  return (
    <div className="relative h-[100px] w-full">
      <div
  className="absolute flex justify-between"
  style={{
    top: 0,
    left: 13,
    width: 327,
    height: 14,
  }}
>
  {[0, 1, 2, 3, 4, 5].map((num) => (
    <span
      key={num}
      className="text-[12px] text-[#294E49]"
      style={{
        fontFamily: "Pretendard",
        fontStyle: "normal",
        fontWeight: 400,
        lineHeight: "normal",
      }}
    >
      {num}
    </span>
  ))}
</div>

      {/* 배경 게이지 바 */}
      <div
        className="absolute rounded-[126px]"
        style={{
          top: 19, // 96 - 77(헤더 높이) = 19
          left: 13,
          width: 333,
          height: 26,
          background: "#6CA59CB0",
        }}
      >
        {clamped > 0 && (
          <div
            className="absolute rounded-l-[126px] transition-all duration-500"
            style={{
              top: 0,
              left: 13,
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
  router.push(`/event-regions/${currentSigungu}/${spot.contentId}`);
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