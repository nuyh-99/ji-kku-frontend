// 여행 기록 관련 타입

/** 사용자가 남긴 여행 기록 한 건 */

//app/records/page.tsx에서 사용됨
export interface TravelRecord {
  id: string;
  /** 연결된 관광지 id */
  spotId: string;
  /** 관광지 이름 (조회 편의를 위해 함께 저장) */
  spotName: string;
  sigunguCd: number;
  emdCd: string;
  title: string;
  content: string;
  /** 방문 일자 (ISO 문자열, 예: 2026-07-01) */
  visitedAt: string;
  /** 첨부 사진 URL 목록 */
  imageUrls: string[];
}
//app/records/[sigunguId]/page.tsx에서 사용됨
export interface TravelPost {
  travelPostId: number;
  sigunguNm: string;
  emdCd: string;
  emdNm: string; //읍면동 각각에 많은 post가 있을 수 있기 때문에 id마냥 둠.
  title: string;
  firstImage: string | null;
  logDate: string; // "2026-07-02"
}

export interface TravelPostsBySigunguResponse {
  sigunguCd: number;
  sigunguNm: string;
  posts: TravelPost[];
}
/** 여행 기록 상세 블록 */
export interface TravelLogBlock {
  travelLogBlockId: number;
  blockType: "IMAGE" | "TEXT";
  sortOrder: number;
  textContent: string | null;
  imgUrl: string | null;
}
/** 여행 기록 상세 조회 result */
export interface TravelPostDetail {
  travelPostId: number;
  emdNm: string;
  logDate: string;
  title: string;
  blocks: TravelLogBlock[];
}

/** 여행 기록 상세 조회 API response */
export interface TravelPostDetailResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: TravelPostDetail;
}