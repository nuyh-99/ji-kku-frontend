import { apiFetch } from "./client";

/** 미션 관광지 목록 조회. TODO: 응답 타입 확정 필요 */
export function getMissionSpots(sigunguCd: string) {
  return apiFetch<unknown>(`/missions/${encodeURIComponent(sigunguCd)}`);
}

/** 방문 인증. TODO: 요청/응답 타입 확정 필요 */
export function verifyMissionVisit(missionSpotId: string, body: unknown) {
  return apiFetch<unknown>(`/missions/verify/${encodeURIComponent(missionSpotId)}`, {
    method: "POST",
    body,
  });
}

/** 습득배지 목록 조회. TODO: 응답 타입 확정 필요 */
export function getBadges() {
  return apiFetch<unknown>("/badges");
}
