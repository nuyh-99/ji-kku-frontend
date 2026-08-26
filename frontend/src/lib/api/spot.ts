import { apiFetch } from "./client";
import type { TodaySpotItem, SpotDetailItem } from "@/types/tourism";
import { mockSpots } from "@/data/mock-spots"; // 실제 경로 확인 필요
import { MOCK_FESTIVALS } from "@/data/mock-festivals";
import type { EventRegionsResult } from "@/types/eventRegion";
import type { RawFestivalListItem, RawFestivalDetail } from "@/types/festival";

const USE_MOCK = false;

interface TodaySpotsResult {
  content: TodaySpotItem[];
}

/** 오늘의 관광지 추천. TODO: 응답 타입 확정 필요 */
export function getTodaySpots() {
  return apiFetch<TodaySpotsResult>("/spots/today");
}

/** 관광지 세부 조회. TODO: 응답 타입 확정 필요 */
export function getSpotDetail(spotId: string): Promise<SpotDetailItem> {
  return apiFetch<SpotDetailItem>(`/spots/${encodeURIComponent(spotId)}`);
}

/** 관광소외지역 조회. TODO: 응답 타입 확정 필요 */
export function getUnderservedRegions() {
  return apiFetch<EventRegionsResult>("/regions/underserved");
}

/** 축제 목록 조회 */
export function getFestivals() {
  return apiFetch<{ content: RawFestivalListItem[] }>("/festivals");
}

/** 축제 세부 조회 */
export function getFestivalDetail(festivalId: string) {
  return apiFetch<RawFestivalDetail>(`/festivals/${encodeURIComponent(festivalId)}`);
}