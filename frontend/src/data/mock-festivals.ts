import type { RawFestivalDetail } from "@/types/festival";

// 백엔드 연동 전 임시 목업 데이터.
// 실제 API 연동되면 이 파일과 useFestivalCards의 USE_MOCK_FESTIVALS 분기를 제거하면 됨.
export const MOCK_FESTIVALS: RawFestivalDetail[] = [
  {
    contentId: 1,
    title: "동강 뗏목 축제",
    overview: "고유의 뗏목 문화를 보전, 계승하는 대표 문화관광축제",
    firstImage: "/festivals/festival1.png",
    addr1: "강원특별자치도 영월군 동강로",
    eventStartDate: "20260710",
    eventEndDate: "20260712",
    sigunguCd: 3,
    sigunguNm: "영월군",
    mapX: 128.4617,
    mapY: 37.1834,
  },
  {
    contentId: 2,
    title: "평창 더위사냥 축제",
    overview: "냉천수가 흐르는 곳에서 열리는 물놀이 축제",
    firstImage: "/festivals/festival2.png",
    addr1: "강원특별자치도 평창군 진부면",
    eventStartDate: "20260801",
    eventEndDate: "20260803",
    sigunguCd: 5,
    sigunguNm: "평창군",
    mapX: 128.3904,
    mapY: 37.6568,
  },
  {
    contentId: 3,
    title: "홍천 찰옥수수 축제",
    overview: "홍천찰옥수수만의 깊은 맛과 식감을 맛볼 수 있는 축제",
    firstImage: "/festivals/festival3.png",
    addr1: "강원특별자치도 홍천군 홍천읍",
    eventStartDate: "20260815",
    eventEndDate: "20260817",
    sigunguCd: 2,
    sigunguNm: "홍천군",
    mapX: 127.8887,
    mapY: 37.6971,
  },
];