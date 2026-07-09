// 화면 개발용 업적(배지) 목데이터.
import type { Achievement } from "@/types/achievement";

export const mockAchievements: Achievement[] = [
  {
    id: "ach-1",
    title: "강원 첫 발자국",
    description: "강원 지역 관광지를 처음으로 방문했어요.",
    iconEmoji: "👣",
    condition: "관광지 1곳 방문",
    achieved: true,
    achievedAt: "2026-06-14",
    progress: 100,
  },
  {
    id: "ach-2",
    title: "바다 탐험가",
    description: "동해안 해변 명소를 여러 곳 방문했어요.",
    iconEmoji: "🌊",
    condition: "해변 관광지 3곳 방문",
    achieved: false,
    progress: 33,
  },
  {
    id: "ach-3",
    title: "기록의 달인",
    description: "여행 기록을 꾸준히 남겼어요.",
    iconEmoji: "📓",
    condition: "여행 기록 10건 작성",
    achieved: false,
    progress: 20,
  },
];
