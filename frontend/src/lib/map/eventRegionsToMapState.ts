import type { RegionFill } from "@/types/map";
import type { EventRegionItem } from "@/types/eventRegion";

export const NON_EVENT_FILL_COLOR = "#EEEEEE"; // 추가: 비이벤트 지역 배경

export function getEventRegionCodes(items: EventRegionItem[]): string[] {
  return items.map((item) => String(item.sigunguCd));
}

// 변경: 전체 지역 code 목록을 받아서, 이벤트/비이벤트 모두 명시적으로 채운다.
export function getEventRegionStates(
  items: EventRegionItem[],
  allRegionCodes: string[]
): Record<string, RegionFill> {
  const eventCodes = new Set(getEventRegionCodes(items));

  return Object.fromEntries(
    allRegionCodes.map((code) => [
      code,
      eventCodes.has(code)
        ? ({ type: "event" } satisfies RegionFill)
        : ({ type: "color", value: NON_EVENT_FILL_COLOR } satisfies RegionFill),
    ])
  );
}