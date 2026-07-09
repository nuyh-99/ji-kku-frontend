// 화면 개발용 이벤트 게시글 목데이터.
import type { EventPost } from "@/types/board";

export const mockEvents: EventPost[] = [
  {
    id: "event-1",
    title: "여름 강원 여행 인증 이벤트",
    summary: "여름철 강원 관광지 방문 기록을 남기면 추첨 경품 증정!",
    content: "기간 내 여행 기록을 3건 이상 남긴 분들 중 추첨하여 굿즈를 드립니다.",
    imageUrl: "",
    startsAt: "2026-07-01",
    endsAt: "2026-08-31",
    region: "강원",
  },
  {
    id: "event-2",
    title: "가을 단풍 명소 스탬프 랠리",
    summary: "지정 단풍 명소를 방문하고 스탬프를 모아보세요.",
    content: "지도에서 단풍 명소를 방문 처리하면 스탬프가 적립됩니다.",
    imageUrl: "",
    startsAt: "2026-09-15",
    endsAt: "2026-11-15",
    region: "강원",
  },
];
