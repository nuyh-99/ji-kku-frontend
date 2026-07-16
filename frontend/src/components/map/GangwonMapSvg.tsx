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
const EMPTY_FILL = "var(--gw-empty, #e5e7eb)";
const BORDER_STROKE = "#94a3b8";
const SELECTED_STROKE = "#2563eb"; // 선택 강조 색 — 일단 눈에 띄는 값.

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
      className={`h-auto w-full ${className}`}
    >
      <defs>
        {photoRegions.map((r) => (
          <clipPath key={r.code} id={`gw-clip-${r.code}`}>
            <path d={r.d} />
          </clipPath>
        ))}
      </defs>

      {regions.map((r) => {
        const fill: RegionFill = regionStates?.[r.code] ?? { type: "empty" };
        const selected = r.code === selectedCode;
        return (
          <g
            key={r.code}
            role="button"
            tabIndex={0}
            aria-label={r.name}
            aria-pressed={selected}
            onClick={() => onRegionClick?.(r.code)}
            onKeyDown={(event) => handleKeyDown(event, r.code)}
            // group + outline-none: 브라우저 기본 사각형(bounding box) 포커스 링을 없애고,
            // 아래 포커스 path로 폴리곤 외곽선을 따라 표시한다.
            className="group cursor-pointer outline-none"
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
              strokeWidth={selected ? 3 : 1}
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
          </g>
        );
      })}
    </svg>
  );
}
