"use client";

// GangwonMapSvg(공용, 팀장 소유) 위에 얹는 오버레이.
// event 지역의 teal 테두리 + glow는 공용 컴포넌트가 지원하지 않으므로,
// 같은 viewBox와 regions[].d(폴리곤 path)를 그대로 재사용해 픽셀 단위로
// 겹치는 투명 SVG를 별도로 그린다. 공용 파일은 절대 수정하지 않는다.
//
// 주의: glow 레이어(흰색 채움 + blur)가 원본 SVG가 이미 그려놓은 라벨 위를
// 완전히 덮어버리므로, 이 오버레이 맨 위에 라벨을 다시 한 번 그려서
// 이벤트 지역의 글씨가 보이도록 한다 (팀장 버전의 "라벨을 맨 마지막에
// 그린다" 순서와 동일한 이유).
import type { RegionShape } from "@/types/map";

interface EventRegionGlowOverlayProps {
  /** GangwonMapSvg에 넘긴 것과 동일한 regions 배열을 그대로 전달해야 좌표가 일치한다. */
  regions: RegionShape[];
  /** glow를 씌울 지역 code 목록 (event 상태인 지역들). */
  eventCodes: string[];
  /** GangwonMapSvg에 넘긴 것과 동일한 viewBox 문자열을 그대로 전달해야 한다. */
  viewBox: string;
}

const EVENT_STROKE = "#6CA59C";
const EVENT_FILL = "#FFFFFF";
const EVENT_BORDER_WIDTH = 1;
const EVENT_GLOW =
  "drop-shadow(0px 0px 5px #6CA59C) drop-shadow(0px 0px 20px #6CA59CCC) drop-shadow(0px 0px 10px #6CA59C80)";
const LABEL_SIZE = 7.5; // 원본 GangwonMapSvg의 LABEL_SIZE와 동일하게 맞춤
const LABEL_FILL = "#111111"; // 원본과 동일 색

export default function EventRegionGlowOverlay({
  regions,
  eventCodes,
  viewBox,
}: EventRegionGlowOverlayProps) {
  const eventRegions = regions.filter((r) => eventCodes.includes(r.code));

  if (eventRegions.length === 0) return null;

  return (
    <svg
      viewBox={viewBox}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {/* 1) glow — 먼저 그려서 아래 깔리고, 위에 얇은 teal 라인이 선명하게 보이도록 */}
      <g>
        {eventRegions.map((r) => (
          <path key={`glow-${r.code}`} d={r.d} fill={EVENT_FILL} style={{ filter: EVENT_GLOW }} />
        ))}
      </g>

      {/* 2) teal 테두리 */}
      <g>
        {eventRegions.map((r) => (
          <path
            key={`stroke-${r.code}`}
            d={r.d}
            fill="none"
            stroke={EVENT_STROKE}
            strokeWidth={EVENT_BORDER_WIDTH}
            strokeLinejoin="round"
          />
        ))}
      </g>

      {/* 3) 라벨 — glow가 원본 라벨을 덮어버리므로 맨 위에 다시 그려서 보이게 함 */}
      <g>
        {eventRegions
          .filter((r) => r.labelX != null && r.labelY != null)
          .map((r) => (
            <text
              key={`label-${r.code}`}
              x={r.labelX}
              y={r.labelY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={LABEL_SIZE}
              fill={LABEL_FILL}
              className="pointer-events-none select-none"
            >
              {r.name}
            </text>
          ))}
      </g>
    </svg>
  );
}