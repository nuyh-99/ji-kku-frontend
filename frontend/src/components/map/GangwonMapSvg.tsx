"use client";

// 공용 강원도 지도 렌더러 (presentational).
// 자기 상태(store/query) 없이 폴리곤을 그리고, 지역별 채움을 props로 받아 칠한다.
// 클릭은 onRegionClick(code)로 위임한다 → map(꾸미기)·home(방문 미리보기)이 함께 재사용.
// 경계 규칙: 공용 leaf이므로 @/features/* 를 import하지 않는다 (lib/types/data 방향만 허용).
import type { KeyboardEvent, ReactNode, Ref } from "react";
import type { RegionFill, RegionShape } from "@/types/map";

interface GangwonMapSvgProps {
  /** 렌더할 지역 폴리곤 목록. */
  regions: RegionShape[];
  /** code → 채움. 없으면 해당 지역은 empty로 취급. */
  regionStates?: Record<string, RegionFill>;
  /** 선택 강조할 지역 code. */
  selectedCode?: string | null;
  /** 지역 클릭/키보드 선택 콜백. */
  onRegionClick?: (code: string) => void;
  /** SVG 좌표 확장자. 목/실데이터가 각자 좌표계에 맞게 지정. */
  viewBox?: string;
  /** 지역명 라벨 크기(viewBox 단위). 지도마다 좌표 스케일이 달라 주입받는다. */
  labelSize?: number;
  className?: string;
  /** 지도 전체 a11y 라벨. */
  ariaLabel?: string;
  /**
   * 지역 위에 겹쳐 그릴 SVG 요소들(스티커 등).
   * 지도와 같은 viewBox 안에 들어가므로 확대·이동을 그대로 따라간다.
   * 여기서 도메인 로직을 갖지 않기 위해 렌더 슬롯으로만 열어둔다
   * (공용 leaf라 @/features/* 를 import할 수 없다).
   */
  overlay?: ReactNode;
  /** 화면 좌표 ↔ viewBox 좌표 변환이 필요한 호출자를 위한 ref. */
  svgRef?: Ref<SVGSVGElement>;
}

const DEFAULT_VIEW_BOX = "0 0 100 100";
const EMPTY_FILL = "#ffffff"; // 미채움 지역: 흰색 (디자인)
const BORDER_STROKE = "#9c9c9c"; // 지역 경계선 (디자인)
const BORDER_WIDTH = 0.7;
const SELECTED_STROKE = "#111827"; // 선택 강조: 굵은 다크 테두리 (디자인)
const SELECTED_WIDTH = 2.4;
const DEFAULT_LABEL_SIZE = 7.5; // 시군구 지도 기준 (디자인 ≈7.48)

// ─── 지역별 그림자 ────────────────────────────────────────────────────────
// 디자인은 지역 하나하나가 "따로 놓인 종이 조각"이라 조각마다 그림자를 가진다.
// 전체 실루엣에 그림자 1개만 주면 바깥 테두리에만 입체감이 생기고 안쪽은 평평해진다.
//
// 그림자 크기는 화면 px 기준으로 고정한다. filter 를 <svg> 루트가 아니라 자식 path 에
// 걸면 길이 단위가 화면 px 이 아니라 **viewBox 단위**가 되는데, 지도마다 viewBox 폭이
// 다르다(1단계 463.3 · 2단계 682). 그대로 두면 같은 값이 지도마다 다른 크기로 그려지므로
// 폭으로 환산해 준다.
/** 지도가 그려지는 컨테이너 폭(px). `w-full` + `max-w-[430px]` 기준. */
const CONTAINER_PX = 430;
/** 그림자 오프셋·번짐(화면 px). 디자인 기준. */
const SHADOW_DY_PX = 3;
const SHADOW_BLUR_PX = 1.2;
const SHADOW_COLOR = "#000000";
const SHADOW_OPACITY = 0.28;
/** 그림자가 잘리지 않게 두는 filter 영역 여유(지역 bbox 대비). */
const SHADOW_FILTER_MARGIN = "-30%";
const SHADOW_FILTER_SIZE = "160%";

export default function GangwonMapSvg({
  regions,
  regionStates,
  selectedCode = null,
  onRegionClick,
  viewBox = DEFAULT_VIEW_BOX,
  labelSize = DEFAULT_LABEL_SIZE,
  className = "",
  ariaLabel = "강원도 지도",
  overlay,
  svgRef,
}: GangwonMapSvgProps) {
  // 사진 채움 지역만 clipPath 정의가 필요하다.
  const photoRegions = regions.filter((r) => regionStates?.[r.code]?.type === "photo");

  // 이미지를 뷰박스 전체에 깔고 폴리곤으로 클립하기 위해 좌표를 파싱한다.
  const [vbX, vbY, vbW, vbH] = viewBox.split(/\s+/).map(Number);

  // 화면 px → 이 지도의 viewBox 단위. 지도끼리 그림자 크기를 맞추기 위한 환산.
  const toUnits = (px: number) => (px * vbW) / CONTAINER_PX;

  // 선택 지역을 마지막에 그려 맨 앞(z-order)으로 올린다.
  // SVG는 z-index가 없고 문서 순서가 곧 paint 순서다 — 선택 강조 stroke가 이웃에 가리지 않게 한다.
  const ordered =
    selectedCode == null
      ? regions
      : [
          ...regions.filter((r) => r.code !== selectedCode),
          ...regions.filter((r) => r.code === selectedCode),
        ];

  // 선택 콜백이 있을 때만 지역을 인터랙티브(button)로 노출한다.
  // (지도 위 탭-투-셀렉트를 쓰지 않는 화면에서 유령 포커스 버튼을 만들지 않기 위해.)
  const interactive = typeof onRegionClick === "function";

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>, code: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRegionClick?.(code);
    }
  };

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      role="img"
      aria-label={ariaLabel}
      // 그림자는 지역마다 따로 건다(아래 defs). 여기서 전체 실루엣에 한 번 걸면
      // 바깥 테두리만 떠 보이고 안쪽 지역들은 한 덩어리로 붙어 보인다.
      className={`h-auto w-full ${className}`}
    >
      <defs>
        {/*
          지역 하나가 쓰는 그림자. 정의는 하나만 두고 모든 지역이 참조한다
          (지역마다 filter 를 새로 만들면 지도 하나에 최대 25개가 생긴다).
        */}
        <filter
          id="gw-region-shadow"
          x={SHADOW_FILTER_MARGIN}
          y={SHADOW_FILTER_MARGIN}
          width={SHADOW_FILTER_SIZE}
          height={SHADOW_FILTER_SIZE}
        >
          <feDropShadow
            dx={0}
            dy={toUnits(SHADOW_DY_PX)}
            stdDeviation={toUnits(SHADOW_BLUR_PX)}
            floodColor={SHADOW_COLOR}
            floodOpacity={SHADOW_OPACITY}
          />
        </filter>

        {photoRegions.map((r) => (
          <clipPath key={r.code} id={`gw-clip-${r.code}`}>
            <path d={r.d} />
          </clipPath>
        ))}
      </defs>

      {ordered.map((r) => {
        const fill: RegionFill = regionStates?.[r.code] ?? { type: "empty" };
        const selected = r.code === selectedCode;
        return (
          <g
            key={r.code}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={r.name}
            aria-pressed={interactive ? selected : undefined}
            onClick={interactive ? () => onRegionClick?.(r.code) : undefined}
            onKeyDown={interactive ? (event) => handleKeyDown(event, r.code) : undefined}
            // group + outline-none: 브라우저 기본 사각형(bounding box) 포커스 링을 없애고,
            // 아래 포커스 path로 폴리곤 외곽선을 따라 표시한다.
            className={interactive ? "group cursor-pointer outline-none" : "group outline-none"}
          >
            {/*
              1) 채움 레이어.
              그림자는 항상 폴리곤 자체에 건다 — 테두리·라벨까지 번지지 않고,
              사진 채움일 때도 같은 모양의 그림자가 나온다.
              (사진에 직접 filter 를 걸면 clip 보다 filter 가 먼저 적용돼서
               폴리곤 바깥으로 나간 그림자가 그대로 잘려 없어진다.)
            */}
            <path
              d={r.d}
              fill={fill.type === "color" ? fill.value : EMPTY_FILL}
              filter="url(#gw-region-shadow)"
            />
            {fill.type === "photo" && (
              <image
                href={fill.src}
                clipPath={`url(#gw-clip-${r.code})`}
                x={vbX}
                y={vbY}
                width={vbW}
                height={vbH}
                preserveAspectRatio="xMidYMid slice"
              />
            )}

            {/* 2) 경계선 + 선택 강조 — 같은 폴리곤 d에 stroke를 덧그려 외곽선을 따라간다. */}
            <path
              d={r.d}
              fill="none"
              stroke={selected ? SELECTED_STROKE : BORDER_STROKE}
              strokeWidth={selected ? SELECTED_WIDTH : BORDER_WIDTH}
              strokeLinejoin="round"
            />

            {/* 3) 키보드 포커스 표시 — 사각형 outline 대신 폴리곤 외곽선을 따라간다. */}
            <path
              d={r.d}
              fill="none"
              strokeWidth={2.5}
              strokeLinejoin="round"
              className="stroke-transparent group-focus-visible:stroke-sky-400"
            />

            {/* 4) 지역명 라벨 — 채움 위에 표시. 클릭 방해하지 않도록 pointer-events 제거. */}
            {r.labelX != null && r.labelY != null && (
              <text
                x={r.labelX}
                y={r.labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={labelSize}
                fill="#111111"
                className="pointer-events-none select-none"
              >
                {r.name}
              </text>
            )}
          </g>
        );
      })}

      {/* 5) 지역 위 오버레이(스티커 등) — 모든 폴리곤보다 나중에 그려 앞에 온다. */}
      {overlay}
    </svg>
  );
}
