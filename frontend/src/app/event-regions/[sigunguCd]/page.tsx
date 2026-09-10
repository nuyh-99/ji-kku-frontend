"use client";

import { use, useMemo, useRef, useState, useLayoutEffect, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getMissionSpots, type MissionSpotItem } from "@/lib/api/mission";
import GangwonMapSvg from "@/components/map/GangwonMapSvg";
import { getEupmyeondongMap } from "@/data/regions/eupmyeondong";
import type { MissionSpotsResult } from "@/types/mission";
import { createPortal } from "react-dom";
import { markRegionBadgeUnlocked } from "@/lib/achievements/localBadges";
import { getLocallyCompletedMissionSpotIds } from "@/lib/missions/localCompletion";
// ==========================================
// 🎛️ 지도 및 핀 보정 상수 설정
// ==========================================
const LEFT_ALIGN_OFFSET_X = 20;
const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 852;

const DEFAULT_MAP_WIDTH = 393; 
const MAP_HEIGHT = 700; 
const DESIRED_ZOOM = 1.1; 

const PAN_PADDING_X = 50; 
const PAN_PADDING_Y = 100;

const PIN_OFFSET_X = 0; 
const PIN_OFFSET_Y =0

// ==========================================
// 🎛️ 지역별(sigunguCd) 위경도 → SVG 좌표 변환 함수
// ==========================================
const toRadiansClient = (deg: number) => (deg * Math.PI) / 180;
const projectLonClient = (lon: number) => toRadiansClient(lon);
const projectLatClient = (lat: number) =>
  Math.log(Math.tan(Math.PI / 4 + toRadiansClient(lat) / 2));

function calculatePinCoordinates(
  spot: MissionSpotItem,
  transform?: { scale: number; offsetX: number; offsetY: number; minX: number; maxY: number },
) {
  let x = 0;
  let y = 0;

  const lng = Number(spot.mapX);
  const lat = Number(spot.mapY);

  if (!isNaN(lng) && !isNaN(lat) && lng > 0 && lat > 0 && transform) {
    const px = projectLonClient(lng);
    const py = projectLatClient(lat);

    x = (px - transform.minX) * transform.scale + transform.offsetX;
    y = (transform.maxY - py) * transform.scale + transform.offsetY;
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

  const { data, isLoading, isError } = useQuery<MissionSpotsResult>({
    queryKey: ["missionSpots", sigunguCdNum],
    queryFn: () => getMissionSpots(sigunguCdNum),
  });

  const spotList = data?.content ?? [];
  if (isLoading) return <div className="px-4 py-4 text-white">로딩 중...</div>;
  if (isError || !spotList) return <div className="px-4 py-4 text-white">정보를 불러오지 못했습니다.</div>;

  return <EventRegionContent sigunguCd={sigunguCdNum} spots={spotList} onBack={() => router.back()} />;
}

function EventRegionContent({
  sigunguCd,
  spots,
  onBack,
}: {
  sigunguCd: number;
  spots: MissionSpotItem[];
  onBack: () => void;
}) {
  const router = useRouter();
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);

  // 백엔드 방문 인증이 불안정해서, 서버가 아직 미완료로 보고해도 로컬 기록이 있으면 완료로 친다.
  const [locallyCompletedIds] = useState(() => getLocallyCompletedMissionSpotIds());

  const visitedCount = spots.filter(
    (s) => s.isCompleted || (s.missionSpotId != null && locallyCompletedIds.has(s.missionSpotId))
  ).length;

  // 지역 게이지가 5/5로 다 차면 내 업적 페이지에서 바로 배지가 보이도록 기록해둔다.
  useEffect(() => {
    if (visitedCount >= 5) {
      markRegionBadgeUnlocked(sigunguCd);
    }
  }, [sigunguCd, visitedCount]);

  const map = getEupmyeondongMap(String(sigunguCd));

  const containerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  

  const [mapWidth, setMapWidth] = useState(DEFAULT_MAP_WIDTH);
  const [contentBox, setContentBox] = useState<{width:number;height:number} | null>(null);
  const [scale, setScale] = useState(1);
  const [mapLayerEl, setMapLayerEl] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const svgEl = containerRef.current?.querySelector("svg");
    if (!svgEl) return;
    try {
      const { width, height } = (svgEl as SVGSVGElement).getBBox();
      if (width > 0 && height > 0) {
        setContentBox({ width, height });
      }
    } catch {}
  }, [map?.viewBox, mapWidth]);

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
    const PAN_PADDING_Y_UP_EXTRA = 40;

    return {
      effectiveZoom: zoom,
      mapMaxOffsetX: Math.max(0, (scaledW - mapWidth) / 2) + PAN_PADDING_X,
      mapDownStopY: verticalOverflow + PAN_PADDING_Y,
      mapUpMaxOffsetY: verticalOverflow + PAN_PADDING_Y_UP_EXTRA,
    };
  }, [map?.viewBox, mapWidth, contentBox]);

  const baseOffset = useMemo(() => {
    const leftX = (mapWidth * (effectiveZoom - 1)) / 2 + LEFT_ALIGN_OFFSET_X;
    return { x: leftX, y: 0 };
  }, [mapWidth, effectiveZoom]);

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const [offset, setOffset] = useState(baseOffset);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  const pendingPointerIdRef = useRef<number | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });
  const targetOffsetRef = useRef(offset);

  useEffect(() => {
    setOffset(baseOffset);
  }, [baseOffset]);

  useEffect(() => {
    setMapLayerEl(mapContainerRef.current);
  }, []);

  const DRAG_THRESHOLD = 6;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    draggingRef.current = false;
    pendingPointerIdRef.current = e.pointerId;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startOffsetRef.current = offset;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pendingPointerIdRef.current !== e.pointerId) return;

    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;

    if (!draggingRef.current) {
      const moved = Math.hypot(deltaX, deltaY);
      if (moved < DRAG_THRESHOLD) return;

      draggingRef.current = true;
      setIsDragging(true);
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }

    const nextX = clamp(
      startOffsetRef.current.x + deltaX,
      -mapMaxOffsetX,
      mapMaxOffsetX + LEFT_ALIGN_OFFSET_X * 2
    );
    const nextY = clamp(
      startOffsetRef.current.y + deltaY,
      -mapUpMaxOffsetY,
      mapDownStopY
    );

    targetOffsetRef.current = { x: nextX, y: nextY };

    if (mapContainerRef.current) {
      mapContainerRef.current.style.transform = `translate(${nextX}px, ${nextY}px) scale(${effectiveZoom})`;
      mapContainerRef.current.style.transition = "none";
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pendingPointerIdRef.current = null;

    if (!draggingRef.current) return;

    draggingRef.current = false;
    setIsDragging(false);
    setOffset(targetOffsetRef.current);

    if (mapContainerRef.current) {
      mapContainerRef.current.style.transition = "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)";
    }

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  const selectedSpot = spots.find((s) => s.contentId === selectedContentId);

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
        <div
          className="pointer-events-none absolute z-0 overflow-hidden"
          style={{ width: 430, height: 872, top: -2, left: -20 }}
        >
          <Image src="/event-region/event-background.png" alt="" fill className="object-cover" priority />
          <div
            className="absolute inset-0 bg-black/10"
            style={{
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />
        </div>

        <div className="relative px-[17px] pb-4 z-20 pointer-events-none" style={{ paddingTop: 44 }}>
          <header className="flex items-center justify-between mb-[5px] pointer-events-auto">
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

          <div className="pointer-events-auto">
            <EventRegionGauge visitedCount={visitedCount} />
          </div>

          <p
            className="absolute text-[14px] text-white/70"
            style={{
              top: 130,
              left: 0,
              right: 0,
              margin: "0 auto",
              color: "#FFF",
              textAlign: "center",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "normal",
            }}
          >
            이벤트 지역 5곳을 방문하고 지역 배지를 수집해보세요!
          </p>
        </div>

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
              onPointerDownCapture={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
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
                ref={mapContainerRef}
                className="relative w-full h-full flex items-center justify-center"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${effectiveZoom})`,
                  transformOrigin: "center center",
                  willChange: "transform",
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
                        {spots.map((item) => (
                          <MissionSpotMarker
                            key={item.contentId}
                            spot={item}
                            transform={map.transform}
                            isSelected={selectedContentId === item.contentId}
                            effectiveZoom={effectiveZoom}
                            onSelect={() => setSelectedContentId(item.contentId)}
                            onClose={() => setSelectedContentId(null)}
                            sigunguCd={sigunguCd}
                            portalContainer={mapLayerEl}
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
      </div>
    </div>
  );
}

function MissionSpotMarker({
  spot,
  transform,
  isSelected,
  effectiveZoom,
  onSelect,
  onClose,
  sigunguCd,
  portalContainer,
}: {
  spot: MissionSpotItem;
  transform?: { scale: number; offsetX: number; offsetY: number; minX: number; maxY: number };
  isSelected: boolean;
  effectiveZoom: number;
  onSelect: () => void;
  onClose: () => void;
  sigunguCd: number;
  portalContainer: HTMLDivElement | null;
}) {
  const { x: spotSvgX, y: spotSvgY } = calculatePinCoordinates(spot, transform);

  const POPUP_WIDTH = 136;
  const POPUP_HEIGHT = 171;
  const POPUP_GAP = 10;

  const pinImgRef = useRef<SVGImageElement>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    if (!isSelected) {
      setPopupPos(null);
      return;
    }

    const pinEl = pinImgRef.current;
    if (!pinEl || !portalContainer) return;

    // portalContainer(=mapContainerRef)는 지도 pan/zoom과 같은 transform을 받는 컨테이너이므로,
    // 여기서 구하는 좌표는 그 local(변환 전) 좌표계 기준 — 드래그로 offset이 바뀌어도
    // 팝업이 같은 transform을 함께 받아 자동으로 따라 움직인다.
    const pinRect = pinEl.getBoundingClientRect();
    const containerRect = portalContainer.getBoundingClientRect();

    const centerX = (pinRect.left + pinRect.width / 2 - containerRect.left) / effectiveZoom;
    const topY = (pinRect.top - containerRect.top) / effectiveZoom;

    setPopupPos({
      x: centerX - POPUP_WIDTH / 2,
      y: topY - POPUP_HEIGHT - POPUP_GAP,
    });
  }, [isSelected, effectiveZoom, portalContainer]);

  return (
    <>
      <g
        transform={`translate(${spotSvgX}, ${spotSvgY})`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="cursor-pointer"
        style={{ pointerEvents: "all" }}
      >
        <g
          className="transition-transform duration-200 hover:scale-110"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <ellipse cx="0" cy="0" rx={10.5} ry={5} fill="#9C9C9C85" />
          <image
            ref={pinImgRef}
            href="/event-region/where.png"
            x="-20"
            y="-40"
            width="40"
            height="40"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      </g>

      {isSelected &&
        portalContainer &&
        popupPos &&
        createPortal(
          <div
            className="absolute z-50"
            style={{
              left: popupPos.x,
              top: popupPos.y,
              width: POPUP_WIDTH,
              height: POPUP_HEIGHT,
              pointerEvents: "auto",
            }}
          >
            <EventSpotPopup
              sigunguCd={sigunguCd}
              spot={spot}
              screenPos={popupPos}
              onClose={onClose}
            />
          </div>,
          portalContainer
        )}
    </>
  );
}

function EventRegionGauge({ visitedCount }: { visitedCount: number }) {
  const clamped = Math.min(5, Math.max(0, visitedCount));
  const TRACK_WIDTH = 333;
  // 라벨 0~5, 5칸으로 트랙을 균등 분할 — 왼쪽 끝(0)에서 시작해 5/5에서 트랙 오른쪽 끝까지 정확히 채운다.
  const STEP = TRACK_WIDTH / 5;
  const fillWidth = STEP * clamped;

  return (
    <div className="relative h-[100px] w-full">
      <div
        className="absolute flex justify-between"
        style={{ top: 0, left: 13, width: 327, height: 14 }}
      >
        {[0, 1, 2, 3, 4, 5].map((num) => (
          <span key={num} className="text-[12px] text-[#294E49]" >
            {num}
          </span>
        ))}
      </div>

      <div
        className="absolute rounded-[126px]"
        style={{ top: 19, left: 13, width: TRACK_WIDTH, height: 26, background: "#6CA59CB0" }}
      >
        {clamped > 0 && (
          <div
            className="absolute rounded-[126px] transition-all duration-500"
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

  let imageUrl: string;
  if (!spot.firstImage || spot.firstImage.trim() === "") {
    imageUrl = "/festivals/noimage.jpg";
  } else if (spot.firstImage.startsWith("http://")) {
    imageUrl = spot.firstImage.replace("http://", "https://");
  } else {
    imageUrl = spot.firstImage;
  }

  return (
    <div className="relative" style={{ width: 136, height: 171 }}>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />

      <div
        className="absolute z-50 overflow-hidden rounded-[9px] bg-[#FFFFFF]"
        style={{
          top: 0,
          left: 0,
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
          <img
            src={imageUrl}
            alt={spot.title || "스팟 이미지"}
            className="w-full h-full object-cover"
            onError={(e) => {
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
          style={{ top: 108, left: 10, width: 116, height: 14 }}
        >
          {spot.title}
        </p>

        <p
          className="absolute truncate text-[8px] text-[#9C9C9C]"
          style={{ top: 124, left: 10, width: 116, height: 10 }}
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
    </div>
  );
}