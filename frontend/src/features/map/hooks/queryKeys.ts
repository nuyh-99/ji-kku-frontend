// 지도 도메인 전용 query key 팩토리.
// 다른 도메인과 키가 겹치지 않도록 ["map", ...] 스코프로 격리한다.
import type { SigunguCode } from "../types";

export const mapKeys = {
  all: ["map"] as const,
  regionStatus: (sigunguCd: SigunguCode) => [...mapKeys.all, "region-status", sigunguCd] as const,
  mapDesign: (sigunguCd: SigunguCode) => [...mapKeys.all, "map-design", sigunguCd] as const,
} as const;
