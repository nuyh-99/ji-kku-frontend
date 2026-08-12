// data/mock-missionDetail.ts

import type { MissionSpotItem } from "@/lib/api/mission";

// contentId를 key로 하는 상세정보 맵
export const MOCK_MISSION_DETAIL_BY_CONTENT_ID: Record<number, Partial<MissionSpotItem>> = {
  2761729: {
    contentId: 2761729,
    title: "양양 설악 오색약수",
    sigunguCd: 51830,
    sigunguNm: "양양군",
    overview: "양양 설악 산자락에 위치한 오색약수는 탄산과 철분이 함유된 오색약수터로 유명한 양양의 대표 명소입니다.",
    addr1: "강원특별자치도 양양군 서면 약수길 45",
    firstImage: "/event-region/osaek.png",
    mapX: 128.456,
    mapY: 37.123,
  },
  // 다른 contentId들도 여기 추가...
};

// 시군구별 fallback (해당 지역 데이터가 없을 때 기본으로 보여줄 대표 스팟)
export const MOCK_DETAIL_FALLBACK_BY_SIGUNGU: Record<number, number> = {
  51830: 2761729, // 양양군 -> 오색약수 contentId
};