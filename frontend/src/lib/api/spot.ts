import { apiFetch } from "./client";

/** 오늘의 관광지 추천. TODO: 응답 타입 확정 필요 */
export function getTodaySpots() {
  return apiFetch<unknown>("/spots/today");
}

/** 관광지 세부 조회. TODO: 응답 타입 확정 필요 */
export function getSpotDetail(spotId: string) {
  return apiFetch<unknown>(`/spots/${encodeURIComponent(spotId)}`);
}

/** 관광소외지역 조회. TODO: 응답 타입 확정 필요 */
export function getUnderservedRegions() {
  return apiFetch<unknown>("/regions/underserved");
}

/** 축제 목록 조회. TODO: 응답 타입 확정 필요 */
export function getFestivals() {
  return apiFetch<unknown>("/spots/festivals");
}

/** 축제 세부 조회. TODO: 응답 타입 확정 필요 */
export function getFestivalDetail(festivalId: string) {
  return apiFetch<unknown>(`/spots/festivals/${encodeURIComponent(festivalId)}`);
}
