export interface MissionSpotItem {
  missionSpotId: number;
  isCompleted: boolean;
  contentId: number;
  title: string;
  firstImage: string | null;
  mapX: number; // 경도
  mapY: number; // 위도
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

export interface VerifyMissionVisitBody {
  // TODO: 명세 확정 필요
}

export interface VerifyMissionVisitResult {
  // TODO: 명세 확정 필요
}