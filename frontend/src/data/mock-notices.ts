// 화면 개발용 공지사항 목데이터.
import type { Notice } from "@/types/board";

export const mockNotices: Notice[] = [
  {
    id: "notice-1",
    title: "Ji-kku 서비스 오픈 안내",
    content: "관광데이터 공모전 출품작 Ji-kku 베타 서비스를 시작합니다.",
    createdAt: "2026-07-01",
    pinned: true,
  },
  {
    id: "notice-2",
    title: "지도 방문 기록 기능 업데이트",
    content: "이제 지도에서 방문한 지역이 색으로 표시됩니다.",
    createdAt: "2026-07-05",
  },
  {
    id: "notice-3",
    title: "개인정보 처리방침 안내",
    content: "서비스 이용 시 수집되는 정보에 대한 안내입니다.",
    createdAt: "2026-07-07",
  },
];
