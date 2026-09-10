export interface MissionSpotItem {
  missionSpotId?: number;
  isCompleted?: boolean;
  contentId: number;
  title: string;
  firstImage?: string | null; // 💡 string | null | undefined 모두 허용
  overview?: string;
  addr1?: string;
  sigunguCd?: number;
  sigunguNm?: string;
  mapX: string | number;
  mapY: string | number;
}

export interface MissionSpotsResult {
  completedCount: number;
  content: MissionSpotItem[];
}

/** mapX/mapY(위경도) → 지도 이미지 위 픽셀 좌표 변환이 아직 없어서,
 *  missionSpotId 기준으로 픽셀 위치를 임시로 하드코딩합니다.
 *  실제 투영 로직이 정해지면 이 타입/데이터는 통째로 걷어내면 됩니다. */
export interface MissionSpotPixelPosition {
  missionSpotId: number;
  top: number;
  left: number;
  width: number;
  height: number;
}

/** 지도 위에 표시되는 면/읍 단위 라벨 박스 (API와 무관, 프론트 전용 레이아웃) */
export interface RegionAreaLayout {
  name: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface CountyMapConfig {
  sigunguCd: number;
  sigunguNm: string;
  backgroundImage: string;
  mapImage?: string;
  mapWidth: number;
  mapHeight: number;
  regions: RegionAreaLayout[];
}

// @/types/mission.ts

// 1. 방문 인증 요청 시 보낼 Body 타입
// 서버가 @NotNull로 강제하는 필수 필드 — 관광지 좌표를 mapX(경도)/mapY(위도)로 부르는 것과
// 같은 규칙으로, 방문자 본인의 현재 좌표를 userX(경도)/userY(위도)로 받는다.
export interface VerifyMissionVisitBody {
  userX: number;
  userY: number;
}

// 2. 인증 성공 시 백엔드가 주는 result 데이터 타입
export interface VerifyMissionVisitData {
  missionSpotId: number;
  isCompleted: boolean;
}

// 3. 백엔드 전체 API 응답 구조 타입
export interface VerifyMissionVisitResult {
  isSuccess: boolean;
  code: string;
  message: string;
  result: VerifyMissionVisitData;
}
// 4. 배지 조회 API 응답 타입
export type BadgeType = "REGION" | "ETC" | "FESTIVAL";

export interface BadgeItem {
  badgeId: number;
  badgeType: BadgeType;
  badgeNo: string;
}

export interface GetBadgesResult {
  content: BadgeItem[];
}

export interface GetBadgesResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: GetBadgesResult;
}