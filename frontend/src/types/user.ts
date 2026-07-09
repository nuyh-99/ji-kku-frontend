// 사용자 관련 타입
// 실제 인증/프로필 API 연동 시 필드를 맞춰 수정하세요.

/** 서비스 사용자 */
export interface User {
  id: string;
  nickname: string;
  email: string;
  profileImageUrl?: string;
  /** 방문한 관광지 id 목록 */
  visitedSpotIds: string[];
  /** 달성한 업적 id 목록 */
  achievementIds: string[];
}
