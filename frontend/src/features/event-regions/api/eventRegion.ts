import { getUnderservedRegions } from "@/lib/api/spot";
import { MOCK_EVENT_REGIONS } from "@/data/mock-eventregions";
import type { EventRegionsResult } from "@/types/eventRegion";
const USE_MOCK = false;
export async function getEventRegions(): Promise<EventRegionsResult> {
  if (USE_MOCK) {
    return MOCK_EVENT_REGIONS;
  }
  return getUnderservedRegions();
}