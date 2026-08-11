import { apiFetch } from "./client";
import type { TodaySpotItem, SpotDetailItem } from "@/types/tourism";
import { mockSpots } from "@/data/mock-spots"; // 실제 경로 확인 필요
import { MOCK_FESTIVALS } from "@/data/mock-festivals";
import type { EventRegionsResult } from "@/types/eventRegion";
import type { RawFestivalListItem, RawFestivalDetail } from "@/types/festival";

const USE_MOCK = true;

interface TodaySpotsResult {
  content: TodaySpotItem[];
}

/** 오늘의 관광지 추천. TODO: 응답 타입 확정 필요 */
export function getTodaySpots() {
  return apiFetch<TodaySpotsResult>("/spots/today");
}

/** 관광지 세부 조회. TODO: 응답 타입 확정 필요 */
export function getSpotDetail(spotId: string): Promise<SpotDetailItem> {
  if (USE_MOCK) {
    const found = mockSpots.find((s) => String(s.spotId) === spotId) ?? mockSpots[0];
    return Promise.resolve(found);
  }
  return apiFetch<SpotDetailItem>(`/spots/${encodeURIComponent(spotId)}`);
}

/** 관광소외지역 조회. TODO: 응답 타입 확정 필요 */
export function getUnderservedRegions() {
  return apiFetch<EventRegionsResult>("/regions/underserved");
}

/** 축제 목록 조회 */
export function getFestivals() {
  if (USE_MOCK) {
    const content: RawFestivalListItem[] = MOCK_FESTIVALS.map((f) => ({
      contentId: f.contentId,
      title: f.title,
      firstImage: f.firstImage,
      eventStartDate: f.eventStartDate,
      eventEndDate: f.eventEndDate,
      sigunguCd: f.sigunguCd,
      sigunguNm: f.sigunguNm,
    }));
    return Promise.resolve({ content });
  }
  return apiFetch<{ content: RawFestivalListItem[] }>("/spots/festivals");
}

/** 축제 세부 조회 */
export function getFestivalDetail(festivalId: string) {
  if (USE_MOCK) {
    const found =
      MOCK_FESTIVALS.find((f) => String(f.contentId) === festivalId) ?? MOCK_FESTIVALS[0];
    return Promise.resolve(found);
  }
  return apiFetch<RawFestivalDetail>(`/spots/festivals/${encodeURIComponent(festivalId)}`);
}