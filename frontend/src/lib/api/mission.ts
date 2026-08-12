import { apiFetch } from "./client";
import type { MissionSpotsResult, VerifyMissionVisitBody, VerifyMissionVisitResult } from "@/types/mission";
import { MOCK_MISSIONS_BY_SIGUNGU } from "@/data/mock-mission";

const USE_MOCK = true;
/** 미션 관광지 목록 조회. TODO: 응답 타입 확정 필요 */
export function getMissionSpots(sigunguCd: number): Promise<MissionSpotsResult> {
  if (USE_MOCK) {
    const found = MOCK_MISSIONS_BY_SIGUNGU[sigunguCd] ?? { completedCount: 0, content: [] };
    return Promise.resolve(found);
  }
  return apiFetch<MissionSpotsResult>(`/missions/${sigunguCd}`);
}

/** 방문 인증. TODO: 요청/응답 타입 확정 필요 */
export function verifyMissionVisit(missionSpotId: number, body: VerifyMissionVisitBody) {
  return apiFetch<VerifyMissionVisitResult>(`/missions/verify/${missionSpotId}`, {
    method: "POST",
    body,
  });
}

/** 습득배지 목록 조회. TODO: 응답 타입 확정 필요 */
export function getBadges() {
  return apiFetch<unknown>("/badges");
}