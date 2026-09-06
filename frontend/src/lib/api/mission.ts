import { apiFetch } from "./client";
import type { VerifyMissionVisitBody } from "@/types/mission";
import type { GetBadgesResult } from "@/types/mission";
import type { MissionSpotsResult } from "@/types/mission";

export interface MissionSpotItem {
  missionSpotId?: number;
  isCompleted?: boolean;
  contentId: number;
  title: string;
  firstImage?: string | null;
  overview?: string;
  addr1?: string;
  sigunguCd?: number;
  sigunguNm?: string;
  mapX: number | string;
  mapY: number | string;
}

// ❌ getMissionSpotDetail 삭제: 백엔드에 /event-regions/{sigunguCd}/{contentId} 엔드포인트가 없음.
// 상세 정보는 getMissionSpots(sigunguCd) 목록 응답에 이미 다 포함되어 있으므로,
// 상세 페이지에서는 이 함수로 받은 목록을 캐시로 재사용하고 contentId로 find해서 씁니다.

export async function getMissionSpots(sigunguCd: number): Promise<MissionSpotsResult> {
  return apiFetch<MissionSpotsResult>(`/missions/${sigunguCd}`);
}

export function verifyMissionVisit(missionSpotId: number, body: VerifyMissionVisitBody) {
  return apiFetch<{ missionSpotId: number; isCompleted: boolean }>(
    `/missions/verify/${missionSpotId}`,
    { method: "PATCH", body }
  );
}

export async function getBadges(): Promise<GetBadgesResult> {
  return apiFetch<GetBadgesResult>("/badges");
}