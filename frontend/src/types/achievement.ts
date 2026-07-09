// 업적(배지) 관련 타입

/** 업적/배지 한 개 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** 아이콘 대체용 이모지 (예: 🏔️) */
  iconEmoji: string;
  /** 달성 조건 설명 (예: 강원 시/군 5곳 방문) */
  condition: string;
  /** 달성 여부 */
  achieved: boolean;
  /** 달성 일자 (ISO 문자열, 달성했을 때만) */
  achievedAt?: string;
  /** 진행도 0~100 (선택) */
  progress?: number;
}
