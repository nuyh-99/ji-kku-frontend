// 관광지 관련 타입
// 실제 API 연동 시 필드는 자유롭게 수정하세요.

/** 관광지 카테고리 예시 */
export type SpotCategory = "자연" | "문화" | "먹거리" | "체험" | "기타";

/** 관광지 한 곳을 나타내는 타입 */
export interface TouristSpot {
  id: string;
  /** 관광지 이름 (예: 속초 청초호) */
  name: string;
  /** 지역 (예: 강원 속초시) */
  region: string;
  category: SpotCategory;
  /** 한 줄 소개 */
  description: string;
  address: string;
  /** 위도 */
  lat: number;
  /** 경도 */
  lng: number;
  /** 대표 이미지 URL (없을 수 있음) */
  imageUrl?: string;
  /** 방문 여부 (지도 방문 상태 표시에 사용) */
  visited: boolean;
}

// types/tourism.ts
export interface TodaySpotItem {
  spot_id: number;
  content_id: number;
  first_image: string;
  title: string;
  overview: string;
}