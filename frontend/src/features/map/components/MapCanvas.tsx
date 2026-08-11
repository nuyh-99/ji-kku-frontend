"use client";

// 지도 뷰 캔버스: 공용 GangwonMapSvg 를 zoom/pan(react-zoom-pan-pinch)으로 감싼다.
// - 어떤 지도(시군구/읍면동)를 그릴지는 regions·viewBox 로 주입받는다.
// - transformRef 로 부모(확대 버튼)가 zoomIn 등을 호출한다.
// - 선택 강조/z-order 는 selectedCode 만 넘기면 공용 렌더러가 처리한다.
// - 스티커를 드래그하는 동안에는 panningDisabled 로 지도 패닝을 잠근다
//   (안 그러면 스티커와 지도가 같이 끌려간다).
import type { ReactNode, Ref } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import GangwonMapSvg from "@/components/map/GangwonMapSvg";
import type { RegionFill, RegionShape } from "@/types/map";

interface MapCanvasProps {
  /** 렌더할 지역 폴리곤 목록. */
  regions: RegionShape[];
  /** 이 지도의 좌표계. */
  viewBox: string;
  /** 지역명 라벨 크기(viewBox 단위). */
  labelSize?: number;
  /** code → 채움(색/사진). */
  regionStates?: Record<string, RegionFill>;
  /** 선택 강조할 지역 code. */
  selectedCode?: string | null;
  /** 지역 클릭 콜백(감상 모드=드릴다운, 도구 모드=꾸밀 대상 선택). */
  onRegionClick?: (code: string) => void;
  /** 확대/이동 제어 ref. */
  transformRef?: Ref<ReactZoomPanPinchRef>;
  /** 지도 위에 겹쳐 그릴 SVG 요소(스티커 레이어). */
  overlay?: ReactNode;
  /** 좌표 변환용 svg 엘리먼트 ref. */
  svgRef?: Ref<SVGSVGElement>;
  /** 패닝 잠금(스티커 드래그 중). */
  panningDisabled?: boolean;
  /** 지도 a11y 라벨. */
  ariaLabel?: string;
}

export default function MapCanvas({
  regions,
  viewBox,
  labelSize,
  regionStates,
  selectedCode,
  onRegionClick,
  transformRef,
  overlay,
  svgRef,
  panningDisabled = false,
  ariaLabel = "강원특별자치도 지도",
}: MapCanvasProps) {
  return (
    <TransformWrapper
      ref={transformRef}
      minScale={1}
      maxScale={6}
      centerOnInit
      doubleClick={{ disabled: true }}
      wheel={{ step: 0.15 }}
      panning={{ disabled: panningDisabled }}
    >
      <TransformComponent wrapperStyle={{ width: "100%" }} contentStyle={{ width: "100%" }}>
        <GangwonMapSvg
          regions={regions}
          viewBox={viewBox}
          labelSize={labelSize}
          regionStates={regionStates}
          selectedCode={selectedCode}
          onRegionClick={onRegionClick}
          overlay={overlay}
          svgRef={svgRef}
          ariaLabel={ariaLabel}
        />
      </TransformComponent>
    </TransformWrapper>
  );
}
