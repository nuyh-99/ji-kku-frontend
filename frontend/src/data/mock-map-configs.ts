import type { CountyMapConfig } from "@/types/mission";
/** 6개 면 bounding box 기준 실측: 가로 최대 ~624px, 세로 최대 ~463px.
 *  화면(max-width 393px)보다 크므로 가로 스크롤이 필요합니다. */
export const YANGYANG_MAP_CONFIG: CountyMapConfig = {
  sigunguCd: 51830,
  sigunguNm: "양양군",
  backgroundImage: "/event-region/event-background.png",
  mapWidth: 650,
  mapHeight: 480,
  regions: [
    { name: "강현면", top: 7.92, left: 104.56, width: 253.43, height: 88.13 },
    { name: "현남면", top: 266.69, left: 442.38, width: 181.58, height: 149.0 },
    { name: "현북면", top: 196.48, left: 255.91, width: 266.92, height: 266.32 },
    { name: "손양면", top: 92.49, left: 323.06, width: 140.78, height: 158.95 },
    { name: "서면", top: 69.76, left: 8.47, width: 330.81, height: 372.96 },
    { name: "양양읍", top: 77.56, left: 195.14, width: 179.12, height: 101.26 },
  ],
};

/** 시군구코드 → 지도 설정. 아직 안 만든 지역은 그냥 이 맵에 없으면 됩니다. */
export const COUNTY_MAP_CONFIGS: Record<number, CountyMapConfig> = {
  [YANGYANG_MAP_CONFIG.sigunguCd]: YANGYANG_MAP_CONFIG,
};