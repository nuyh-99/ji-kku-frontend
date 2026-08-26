export interface EventRegionItem {
  sigunguCd: number;
  sigunguNm: string;
  rankAsc: number;
}

export interface EventRegionsResult {
  month: number;
  content: EventRegionItem[];
}