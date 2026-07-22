"use client";

// 지도 뷰 캔버스: 공용 GangwonMapSvg 를 zoom/pan(react-zoom-pan-pinch)으로 감싼다.
// - 지역 데이터/viewBox는 고정(GANGWON_*), 동적 상태(채움·선택·클릭)는 props로 받는다.
// - transformRef 로 부모(확대 버튼)가 zoomIn 등을 호출한다.
// - 선택 강조/z-order 는 selectedCode 만 넘기면 공용 렌더러가 처리한다.
import type { Ref } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import GangwonMapSvg from "@/components/map/GangwonMapSvg";
import type { RegionFill } from "@/types/map";
import { GANGWON_REGIONS, GANGWON_VIEW_BOX } from "@/data/regions/gangwon";

interface MapCanvasProps {
  /** code → 채움(색/사진). */
  regionStates?: Record<string, RegionFill>;
  /** 선택 강조할 지역 code. */
  selectedCode?: string | null;
  /** 지역 클릭 콜백(꾸미기 모드에서만 전달 → 그때만 인터랙티브). */
  onRegionClick?: (code: string) => void;
  /** 확대/이동 제어 ref. */
  transformRef?: Ref<ReactZoomPanPinchRef>;
}

export default function MapCanvas({
  regionStates,
  selectedCode,
  onRegionClick,
  transformRef,
}: MapCanvasProps) {
  return (
    <TransformWrapper
      ref={transformRef}
      minScale={1}
      maxScale={6}
      centerOnInit
      doubleClick={{ disabled: true }}
      wheel={{ step: 0.15 }}
    >
      <TransformComponent wrapperStyle={{ width: "100%" }} contentStyle={{ width: "100%" }}>
        <GangwonMapSvg
          regions={GANGWON_REGIONS}
          viewBox={GANGWON_VIEW_BOX}
          regionStates={regionStates}
          selectedCode={selectedCode}
          onRegionClick={onRegionClick}
          ariaLabel="강원특별자치도 지도"
        />
      </TransformComponent>
    </TransformWrapper>
  );
}
