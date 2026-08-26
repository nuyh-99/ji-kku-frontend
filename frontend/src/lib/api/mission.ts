import { apiFetch } from "./client";
import type { VerifyMissionVisitBody } from "@/types/mission";
import type { GetBadgesResult } from "@/types/mission";

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

export async function getMissionSpotDetail(
  sigunguCd: number,
  contentId: number
): Promise<MissionSpotItem> {
  return apiFetch<MissionSpotItem>(`/event-regions/${sigunguCd}/${contentId}`);
}

export async function getMissionSpots(sigunguCd: number) {
  return apiFetch<MissionSpotItem[]>(`/missions/${sigunguCd}`);
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