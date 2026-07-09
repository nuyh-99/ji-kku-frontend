// 여행 기록 관련 타입

/** 사용자가 남긴 여행 기록 한 건 */
export interface TravelRecord {
  id: string;
  /** 연결된 관광지 id */
  spotId: string;
  /** 관광지 이름 (조회 편의를 위해 함께 저장) */
  spotName: string;
  title: string;
  content: string;
  /** 방문 일자 (ISO 문자열, 예: 2026-07-01) */
  visitedAt: string;
  /** 첨부 사진 URL 목록 */
  imageUrls: string[];
  /** 별점 (1~5, 선택) */
  rating?: number;
}
