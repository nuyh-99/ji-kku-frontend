// 화면 개발용 관광지 목데이터.
// 실제 관광 API(TourAPI 등)가 연결되면 이 파일을 대체하세요.
// ⚠️ 실제 좌표는 대략값이며, API 키/민감정보는 넣지 않습니다.

// 화면 개발용 관광지 목데이터.
// 실제 관광 API(TourAPI 등)가 연결되면 이 파일을 대체하세요.
// ⚠️ 실제 좌표는 대략값이며, API 키/민감정보는 넣지 않습니다.
import type { SpotDetailItem } from "@/types/tourism";

export const mockSpots: SpotDetailItem[] = [
  {
    spotId: 1,
    contentId: 10001,
    firstImage: "",
    title: "속초 청초호",
    addr1: "강원특별자치도 속초시 청초호반로",
    mapX: 128.59,
    mapY: 38.2,
    description: "속초 도심 속 석호. 산책로와 야경 명소.",
  },
  {
    spotId: 2,
    contentId: 10002,
    firstImage: "",
    title: "강릉 안목해변 커피거리",
    addr1: "강원특별자치도 강릉시 창해로14번길",
    mapX: 128.95,
    mapY: 37.77,
    description: "바다를 보며 커피를 즐기는 카페 거리.",
  },
  {
    spotId: 3,
    contentId: 10003,
    firstImage: "",
    title: "평창 대관령 양떼목장",
    addr1: "강원특별자치도 평창군 대관령면 대관령마루길",
    mapX: 128.75,
    mapY: 37.68,
    description: "능선을 따라 걷는 초원 산책과 양 먹이주기 체험.",
  },
];
// import type { TouristSpot } from "@/types/tourism";

// export const mockSpots: TouristSpot[] = [
//   {
//     id: "spot-1",
//     name: "속초 청초호",
//     region: "강원 속초시",
//     category: "자연",
//     description: "속초 도심 속 석호. 산책로와 야경 명소.",
//     address: "강원특별자치도 속초시 청초호반로",
//     lat: 38.2,
//     lng: 128.59,
//     imageUrl: "",
//     visited: true,
//   },
//   {
//     id: "spot-2",
//     name: "강릉 안목해변 커피거리",
//     region: "강원 강릉시",
//     category: "먹거리",
//     description: "바다를 보며 커피를 즐기는 카페 거리.",
//     address: "강원특별자치도 강릉시 창해로14번길",
//     lat: 37.77,
//     lng: 128.95,
//     imageUrl: "",
//     visited: false,
//   },
//   {
//     id: "spot-3",
//     name: "평창 대관령 양떼목장",
//     region: "강원 평창군",
//     category: "체험",
//     description: "능선을 따라 걷는 초원 산책과 양 먹이주기 체험.",
//     address: "강원특별자치도 평창군 대관령면 대관령마루길",
//     lat: 37.68,
//     lng: 128.75,
//     imageUrl: "",
//     visited: false,
//   },
// ];
