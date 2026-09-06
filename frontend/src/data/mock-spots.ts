// 화면 개발용 관광지 목데이터.
// 실제 관광 API(TourAPI 등)가 연결되면 이 파일을 대체하세요.
// ⚠️ 실제 좌표는 대략값이며, API 키/민감정보는 넣지 않습니다.

// 화면 개발용 관광지 목데이터.
// 실제 관광 API(TourAPI 등)가 연결되면 이 파일을 대체하세요.
// ⚠️ 실제 좌표는 대략값이며, API 키/민감정보는 넣지 않습니다.
import type { SpotDetailItem } from "@/types/tourism";

export const mockSpots: SpotDetailItem[] = [
  {
    contentId: 10001,
    firstImage: "",
    title: "속초 청초호",
    addr1: "강원특별자치도 속초시 청초호반로",
    sigunguCd: 11,
    sigunguNm: "속초시",
    mapX: 128.59,
    mapY: 38.2,
    overview: "속초 도심 속 석호. 산책로와 야경 명소.",
  },
  {
    contentId: 10002,
    firstImage: "",
    title: "강릉 안목해변 커피거리",
    addr1: "강원특별자치도 강릉시 창해로14번길",
    sigunguCd: 12,
    sigunguNm: "강릉시",
    mapX: 128.95,
    mapY: 37.77,
    overview: "바다를 보며 커피를 즐기는 카페 거리.",
  },
  {
    contentId: 10003,
    firstImage: "",
    title: "평창 대관령 양떼목장",
    addr1: "강원특별자치도 평창군 대관령면 대관령마루길",
    sigunguCd: 13,
    sigunguNm: "평창군",
    mapX: 128.75,
    mapY: 37.68,
    overview: "능선을 따라 걷는 초원 산책과 양 먹이주기 체험.",
  },
];