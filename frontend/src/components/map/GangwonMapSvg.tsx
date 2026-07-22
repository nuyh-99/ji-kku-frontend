"use client";

// 공용 강원도 지도 렌더러 (presentational).
// 자기 상태(store/query) 없이 폴리곤을 그리고, 지역별 채움을 props로 받아 칠한다.
// 클릭은 onRegionClick(code)로 위임한다 → map(꾸미기)·home(방문 미리보기)이 함께 재사용.
// 경계 규칙: 공용 leaf이므로 @/features/* 를 import하지 않는다 (lib/types/data 방향만 허용).
import type { KeyboardEvent } from "react";
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
  className?: string;
  /** 지도 전체 a11y 라벨. */
  ariaLabel?: string;
}

const DEFAULT_VIEW_BOX = "0 0 100 100";
const EMPTY_FILL = "#ffffff"; // 미채움 지역: 흰색 (디자인)
const BORDER_STROKE = "#9c9c9c"; // 지역 경계선 (디자인)
const BORDER_WIDTH = 0.7;
const SELECTED_STROKE = "#111827"; // 선택 강조: 굵은 다크 테두리 (디자인)
const SELECTED_WIDTH = 2.4;
const LABEL_SIZE = 7.5; // 지역명 라벨 크기 (디자인 ≈7.48)

export default function GangwonMapSvg({
  regions,
  regionStates,
  selectedCode = null,
  onRegionClick,
  viewBox = DEFAULT_VIEW_BOX,
  className = "",
  ariaLabel = "강원도 지도",
}: GangwonMapSvgProps) {
  // 사진 채움 지역만 clipPath 정의가 필요하다.
  const photoRegions = regions.filter((r) => regionStates?.[r.code]?.type === "photo");

  // 이미지를 뷰박스 전체에 깔고 폴리곤으로 클립하기 위해 좌표를 파싱한다.
  const [vbX, vbY, vbW, vbH] = viewBox.split(/\s+/).map(Number);

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
      viewBox={viewBox}
      role="img"
      aria-label={ariaLabel}
      // 전체 실루엣에 부드러운 그림자 1개 — 지역별 필터(느림) 대신 성능 위해 단일 처리.
      // 지역 간 경계감은 아래 stroke(#9c9c9c)가 담당한다.
      className={`h-auto w-full drop-shadow-[0px_3px_2px_rgba(0,0,0,0.28)] ${className}`}
    >
      <defs>
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
            {/* 1) 채움 레이어 */}
            {fill.type === "photo" ? (
              <image
                href={fill.src}
                clipPath={`url(#gw-clip-${r.code})`}
                x={vbX}
                y={vbY}
                width={vbW}
                height={vbH}
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <path d={r.d} fill={fill.type === "color" ? fill.value : EMPTY_FILL} />
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
                fontSize={LABEL_SIZE}
                fill="#111111"
                className="pointer-events-none select-none"
              >
                {r.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
