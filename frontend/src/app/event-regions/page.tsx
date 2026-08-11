"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Menu } from "lucide-react";

import GangwonMapSvg from "@/components/map/GangwonMapSvg";
import EventRegionGlowOverlay from "@/features/event-regions/components/EventRegionGlowOverlay";
import { GANGWON_REGIONS, GANGWON_VIEW_BOX } from "@/data/regions/gangwon";
import { getRegionsBoundingBox } from "@/lib/map/getRegionsBoundingBox";
import { getEventRegionCodes, getEventRegionStates } from "@/lib/map/eventRegionsToMapState";
import { getEventRegions } from "@/features/event-regions/api/eventRegion";

import FestivalCard from "@/features/event-regions/components/FestivalCard";
import { useFestivalCards } from "@/features/event-regions/hooks/useFestivalCards";

const DEFAULT_MAP_WIDTH = 360; // 실측 전 임시값(초기 렌더용). 실제 계산은 측정된 width로 함
const MAP_HEIGHT = 496; // 디자인 고정 높이
const ZOOM = 1.6; // 확대 배율 (고정 — 이 값은 바꾸지 않음)

const PAN_PADDING_X = 24; // 지도 끝에서 추가로 끌리는 좌우 여백(px)
const PAN_PADDING_Y = 24; // 지도 끝에서 추가로 끌리는 상하 여백(px)
const PAN_PADDING_Y_TOP = 24; // 위쪽(=아래로 내려서 위쪽 여백이 보이는 만큼)은 지금 그대로 유지
const PAN_PADDING_Y_BOTTOM = 1;
// 가장자리 페이드 정도. 1에 가까울수록 페이드 시작 지점이 늦게(바깥쪽에서) 시작됨.
const FADE_START_RATIO = 0.85;

// "minX minY width height" 형태의 viewBox 문자열 파싱
function parseViewBox(viewBox: string) {
  const [minX, minY, width, height] = viewBox.split(" ").map(Number);
  return { minX, minY, width, height };
}

export default function EventRegionsPage() {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["event-regions"],
    queryFn: getEventRegions,
  });
  const { festivals, isLoading: isFestivalsLoading } = useFestivalCards();

  const items = data?.content ?? [];
  const regionStates = getEventRegionStates(
    items,
    GANGWON_REGIONS.map((r) => r.code)
  );
  const eventCodes = useMemo(() => getEventRegionCodes(items), [items]);

  // --- 실제 렌더링된 컨테이너 너비 측정 (width: 100%라서 기기마다 다를 수 있음) ---
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

  // --- 이벤트 지역 bbox를 컨테이너 픽셀 좌표계로 변환 ---
  const contentBox = useMemo(() => {
    if (eventCodes.length === 0) return null;

    const bboxViewBox = getRegionsBoundingBox(GANGWON_REGIONS, eventCodes);
    if (!bboxViewBox) return null;

    const bbox = parseViewBox(bboxViewBox);
    const vb = parseViewBox(GANGWON_VIEW_BOX);

    // slice: 컨테이너를 꽉 채우도록 "더 크게" 늘어나는 쪽 기준 → Math.max
    const scale = Math.min(mapWidth / vb.width, MAP_HEIGHT / vb.height); // meet: Math.min
    const drawnW = vb.width * scale;
    const drawnH = vb.height * scale;
    const padX = (mapWidth - drawnW) / 2; // 좌우는 중앙 정렬(xMid) 그대로
    const padY = MAP_HEIGHT - drawnH / 2; // 상하는 여백을 전부 위쪽에 (xMidYMax와 일치)
    const toContainer = (x: number, y: number) => ({
      x: padX + (x - vb.minX) * scale,
      y: padY + (y - vb.minY) * scale,
    });

    const p0 = toContainer(bbox.minX, bbox.minY);
    const p1 = toContainer(bbox.minX + bbox.width, bbox.minY + bbox.height);

    return {
      x0: Math.min(p0.x, p1.x),
      y0: Math.min(p0.y, p1.y),
      x1: Math.max(p0.x, p1.x),
      y1: Math.max(p0.y, p1.y),
    };
  }, [eventCodes, mapWidth]);

  // 지도 가장자리 기준 최대 pan 거리 (여백 포함)
  const mapMaxOffsetX = (mapWidth * (ZOOM - 1)) / 2 + PAN_PADDING_X;
  const mapMaxOffsetYTop = (MAP_HEIGHT * (ZOOM - 1)) / 7 + PAN_PADDING_Y_TOP; // 아래로 내리는 최대치 (위쪽 공백 노출)
  const mapMaxOffsetYBottom = (MAP_HEIGHT * (ZOOM - 1)) / 5 + PAN_PADDING_Y_BOTTOM; // 위로 올리는 최대치 (아래쪽 공백 노출)

  // 이벤트 지역 bbox가 화면 밖으로 나가지 않도록 하는 offset 허용 범위
  // (초기 배치 전용 — 드래그 중에는 사용하지 않음)
  const bboxRange = useMemo(() => {
    if (!contentBox) return null;
    const cx = mapWidth / 2;
    const cy = MAP_HEIGHT / 2;

    // transform-origin: center 기준 변환식: screen = center + (local - center) * ZOOM + offset
    const lowerX = -cx - (contentBox.x0 - cx) * ZOOM;
    const upperX = mapWidth - cx - (contentBox.x1 - cx) * ZOOM;
    const lowerY = -cy - (contentBox.y0 - cy) * ZOOM;
    const upperY = MAP_HEIGHT - cy - (contentBox.y1 - cy) * ZOOM;

    return {
      minX: Math.min(lowerX, upperX),
      maxX: Math.max(lowerX, upperX),
      minY: Math.min(lowerY, upperY),
      maxY: Math.max(lowerY, upperY),
    };
  }, [contentBox, mapWidth]);

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  // 드래그(pan) 중 사용할 clamp: 지도 가장자리 제약만 적용.
  // 이벤트 지역 제약을 여기 넣으면, ZOOM이 낮을 때 이벤트 지역 bbox가
  // 컨테이너와 비슷한 크기가 되어 허용 offset 범위가 사실상 한 점으로
  // 좁아져 버려 "드래그해도 안 움직이는" 문제가 생긴다. 그래서 드래그 중엔
  // 이 제약을 빼고 지도 가장자리까지 자유롭게 움직이게 한다.
  const getPanClampedOffset = (raw: { x: number; y: number }) => {
    return {
      x: clamp(raw.x, -mapMaxOffsetX, mapMaxOffsetX),
      y: clamp(raw.y, -mapMaxOffsetYBottom, mapMaxOffsetYTop),
    };
  };

  // 초기 화면 배치용 clamp: "지도 가장자리 제한"과 "이벤트 지역 항상 보이기 제한"의 교집합.
  // 사용자가 페이지에 처음 들어왔을 때만 적용해서, 이벤트 지역이 확실히 보이도록 한다.
  const getInitialClampedOffset = (raw: { x: number; y: number }) => {
    let minX = -mapMaxOffsetX;
    let maxX = mapMaxOffsetX;
    let minY = -mapMaxOffsetYBottom;
    let maxY = mapMaxOffsetYTop;

    if (bboxRange) {
      const combinedMinX = Math.max(minX, bboxRange.minX);
      const combinedMaxX = Math.min(maxX, bboxRange.maxX);
      if (combinedMinX <= combinedMaxX) {
        minX = combinedMinX;
        maxX = combinedMaxX;
      }
      // bbox가 화면보다 커서 두 조건을 동시에 만족 못하면 지도 가장자리 제한만 유지

      const combinedMinY = Math.max(minY, bboxRange.minY);
      const combinedMaxY = Math.min(maxY, bboxRange.maxY);
      if (combinedMinY <= combinedMaxY) {
        minY = combinedMinY;
        maxY = combinedMaxY;
      }
    }

    return {
      x: clamp(raw.x, minX, maxX),
      y: clamp(raw.y, minY, maxY),
    };
  };

  // 초기 offset: 이벤트 지역 bbox 중심이 화면 안쪽(targetYRatio 지점)에 오도록
  const initialOffset = useMemo(() => {
    if (!contentBox) return { x: 0, y: 0 };
    const cx = (contentBox.x0 + contentBox.x1) / 2;
    const cy = (contentBox.y0 + contentBox.y1) / 2;
    const targetYRatio = 0.7; // 필요에 따라 조정
    const raw = {
      x: -(cx - mapWidth / 2) * ZOOM,
      y: -(cy - MAP_HEIGHT * targetYRatio) * ZOOM,
    };
    return getInitialClampedOffset(raw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentBox, mapWidth]);

  const [offset, setOffset] = useState(initialOffset);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startOffsetRef = useRef({ x: 0, y: 0 });

  // 데이터/너비가 확정된 후 initialOffset을 한 번 반영
  useEffect(() => {
    if (contentBox) {
      setOffset(initialOffset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentBox, mapWidth]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startOffsetRef.current = offset;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    setOffset(
      getPanClampedOffset({
        x: startOffsetRef.current.x + deltaX,
        y: startOffsetRef.current.y + deltaY,
      })
    );
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
    setIsDragging(false);
  };

  // 이벤트 지역만 클릭 가능 → app/event-regions/[sigunguCd]/page.tsx로 이동.
  // 이벤트 지역이 아니면 아무 동작도 하지 않는다.
  const handleRegionClick = (code: string) => {
    if (!eventCodes.includes(code)) return;
    router.push(`/event-regions/${code}`);
  };

  return (
    <div className="relative px-[17px] pt-10 pb-4">
      <header className="flex items-center justify-between mb-4">
        <button aria-label="뒤로가기" onClick={() => router.back()}>
          <ChevronLeft size={24} />
        </button>
        <button aria-label="메뉴">
          <Menu size={24} />
        </button>
      </header>

      <p
        className="mt-[19px] text-[#9C9C9C]"
        style={{
          width: 248,
          height: 17,
          fontFamily: "Pretendard",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "100%",
          letterSpacing: "0%",
        }}
      >
        이벤트 지역을 방문하고 배지를 수집해보세요!
      </p>

      <div
        ref={containerRef}
        className="relative mt-4 w-full overflow-hidden select-none"
        style={{
          height: MAP_HEIGHT,
          borderRadius: 9,
          border: "1px solid #6CA59C",
          touchAction: "none",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${ZOOM})`,
            transformOrigin: "center center",
            willChange: "transform",
            // 단일 radial-gradient 마스크로 가장자리를 자연스럽게 페이드.
            // mask-composite(교집합) 없이 그라디언트 하나로 처리하므로
            // Safari/Chrome/Firefox 어디서든 동일하게 렌더링되고,
            // 색을 덧칠하는 게 아니라 알파(투명도)를 낮추는 방식이라 번짐도 없음.
            maskImage: `radial-gradient(ellipse at center, black ${
              FADE_START_RATIO * 100
            }%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse at center, black ${
              FADE_START_RATIO * 100
            }%, transparent 100%)`,
          }}
        >
          <div className="relative h-full w-full">
            {/* 공용 GangwonMapSvg는 수정하지 않음 — 팀장 소유 파일.
               heightMode 없이 className="!h-full"로 h-auto를 override해서
               높이만 이 페이지 전용으로 강제한다. */}
            <GangwonMapSvg
              regions={GANGWON_REGIONS}
              regionStates={regionStates}
              viewBox={GANGWON_VIEW_BOX}
              className="!h-full"
              onRegionClick={handleRegionClick}
            />

            {/* event 지역 teal 테두리 + glow는 원본이 지원하지 않으므로
               같은 viewBox/좌표를 그대로 재사용하는 오버레이 SVG로 얹는다. */}
            <EventRegionGlowOverlay
              regions={GANGWON_REGIONS}
              eventCodes={eventCodes}
              viewBox={GANGWON_VIEW_BOX}
            />
          </div>
        </div>
      </div>

      <p
        className="mt-[19px] text-[#6CA59C]"
        style={{
          width: 111,
          height: 18,
          fontFamily: "Pretendard",
          fontWeight: 700,
          fontSize: 15,
          lineHeight: "100%",
          letterSpacing: "0%",
          textAlign: "center",
        }}
      >
        지금 뜨고있는 축제
      </p>
          {/* 축제 카드 가로 스크롤 리스트 */}
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 -mx-[17px] px-[17px] scrollbar-hide">
        {isFestivalsLoading && festivals.length === 0 ? (
          // 로딩 중: 카드 스켈레톤 2~3개
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 animate-pulse rounded-[6.2px] bg-gray-200"
              style={{ width: 146.75, height: 149.03 }}
            />
          ))
        ) : (
          festivals.map((festival) => (
            <FestivalCard key={festival.id} festival={festival} />
          ))
        )}
      </div>
    </div>
  );
}