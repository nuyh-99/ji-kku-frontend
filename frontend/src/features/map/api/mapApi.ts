// 지도(map) 도메인 백엔드 API.
// - map-design(색칠/스티커/지도 사진)은 map 소유 → 여기서 관리 (기존 lib/api/mapDesign.ts 이관).
// - 관광지(spot) API는 최종 담당이 달라 lib/api/spot에 두고 필요한 것만 import해서 재노출한다.
import { apiFetch } from "@/lib/api/client";
import { getSpotDetail } from "@/lib/api/spot";

// ─── map-design (map 소유) ────────────────────────────────────────────────

/** 시군구 색칠 지도 조회. TODO: 응답 타입 확정 필요 */
export function getSigunguMapDesign() {
  return apiFetch<unknown>("/map-design");
}

/** 읍면동 색칠 지도 조회. TODO: 응답 타입 확정 필요 */
export function getEupmyeondongMapDesign(sigunguCd: string) {
  return apiFetch<unknown>(`/map-design/${encodeURIComponent(sigunguCd)}`);
}

/** 시군구 채우기. TODO: 요청/응답 타입 확정 필요 */
export function fillSigunguMap(body: unknown) {
  return apiFetch<unknown>("/map-design", {
    method: "POST",
    body,
  });
}

/** 읍면동 채우기. TODO: 요청/응답 타입 확정 필요 */
export function fillEupmyeondongMap(sigunguCd: string, body: unknown) {
  return apiFetch<unknown>(`/map-design/${encodeURIComponent(sigunguCd)}`, {
    method: "POST",
    body,
  });
}

/** 스티커 목록 조회. TODO: 응답 타입 확정 필요 */
export function getStickers() {
  return apiFetch<unknown>("/stickers");
}

/** 읍면동 지도 스티커 조회. TODO: 응답 타입 확정 필요 */
export function getEupmyeondongMapStickers(sigunguCd: string) {
  return apiFetch<unknown>(`/map-design/${encodeURIComponent(sigunguCd)}/stickers`);
}

/** 읍면동 지도 스티커 추가. TODO: 요청/응답 타입 확정 필요 */
export function addEupmyeondongMapSticker(sigunguCd: string, body: unknown) {
  return apiFetch<unknown>(`/map-design/${encodeURIComponent(sigunguCd)}/stickers`, {
    method: "POST",
    body,
  });
}

/** 읍면동 지도 사진(포스트) 조회. TODO: 응답 타입 확정 필요 */
export function getEupmyeondongMapTravelPosts(sigunguCd: string) {
  return apiFetch<unknown>(`/map-design/${encodeURIComponent(sigunguCd)}/travel-post`);
}

/** 읍면동 지도 사진(포스트) 추가. TODO: 요청/응답 타입 확정 필요 */
export function addEupmyeondongMapTravelPost(sigunguCd: string, body: unknown) {
  return apiFetch<unknown>(`/map-design/${encodeURIComponent(sigunguCd)}/travel-post`, {
    method: "POST",
    body,
  });
}

/** 읍면동 채우기 업데이트 (없으면 생성). TODO: 요청/응답 타입 확정 필요 */
export function upsertMapFill(fillMapId: string, body: unknown) {
  return apiFetch<unknown>(`/map-design/${encodeURIComponent(fillMapId)}`, {
    method: "PATCH",
    body,
  });
}

// ─── 관광지 API 재노출 (lib/api/spot 재사용, 이관하지 않음) ─────────────────
// 관광지 API 최종 담당은 별도이므로 lib에 두고, 지도에서 필요한 것만 여기서 다시 내보낸다.
export { getSpotDetail };
