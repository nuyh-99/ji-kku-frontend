// 화면 개발용 여행 기록 목데이터.
import type { TravelRecord } from "@/types/record";

export const mockRecords: TravelRecord[] = [
  {
    id: "record-1",
    spotId: "spot-1",
    spotName: "속초 청초호",
    title: "저녁 산책하기 좋았던 청초호",
    content: "노을 질 때 호수 반영이 예뻤다. 다음엔 자전거도 타보고 싶다.",
    visitedAt: "2026-06-14",
    imageUrls: [],
    rating: 5,
  },
  {
    id: "record-2",
    spotId: "spot-2",
    spotName: "강릉 안목해변 커피거리",
    title: "바다뷰 카페 투어",
    content: "커피 한 잔 들고 백사장 산책. 사람은 많지만 분위기 최고.",
    visitedAt: "2026-06-15",
    imageUrls: [],
    rating: 4,
  },
];
