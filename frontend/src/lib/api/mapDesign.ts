import { apiFetch } from "./client";

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
