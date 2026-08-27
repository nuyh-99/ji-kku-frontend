// 지도(map) 도메인 백엔드 API.
// - map-design(색칠/스티커/지도 사진)은 map 소유 → 여기서 관리.
// - 관광지(spot) API는 최종 담당이 달라 lib/api/spot에 두고 필요한 것만 import해서 재노출한다.
//
// 경로·스키마 출처: https://jikku-backend.fly.dev/swagger-ui/index.html (2026-08-27 기준)
// ⚠️ 전 엔드포인트 인증 필수 — 토큰이 없으면 AUTH401_1 이 떨어진다.
import { apiFetch } from "@/lib/api/client";
import { getSpotDetail } from "@/lib/api/spot";
import type {
  EmdFillRequest,
  EmdFillResponse,
  EmdFillUpdateRequest,
  ListResult,
  MapStickerRequest,
  MapStickerResponse,
  MapTravelPostRequest,
  MapTravelPostResponse,
  SigunguFillRequest,
  SigunguFillResponse,
  StickerResponse,
} from "../types";

/** 서버는 시군구를 숫자로 받는다. 화면이 들고 있는 문자열 코드를 여기서만 바꾼다. */
function toSigunguParam(sigunguCd: string): number {
  return Number(sigunguCd);
}

// ─── 채우기(fill) ─────────────────────────────────────────────────────────

/** 1단계(시군구) 색칠 지도 조회. */
export function getSigunguMapDesign() {
  return apiFetch<ListResult<SigunguFillResponse>>("/map-design");
}

/** 2단계(읍면동) 색칠 지도 조회. */
export function getEupmyeondongMapDesign(sigunguCd: string) {
  return apiFetch<ListResult<EmdFillResponse>>(`/map-design/${toSigunguParam(sigunguCd)}`);
}

/** 시군구 채우기(신규). */
export function fillSigunguMap(body: SigunguFillRequest) {
  return apiFetch<SigunguFillResponse>("/map-design", { method: "POST", body });
}

/** 시군구 채우기 수정. */
export function updateSigunguMapFill(fillMapId: number, body: SigunguFillRequest) {
  return apiFetch<SigunguFillResponse>(`/map-design/update/${fillMapId}`, {
    method: "PATCH",
    body,
  });
}

/** 읍면동 채우기(신규). */
export function fillEupmyeondongMap(sigunguCd: string, body: EmdFillRequest) {
  return apiFetch<EmdFillResponse>(`/map-design/${toSigunguParam(sigunguCd)}`, {
    method: "POST",
    body,
  });
}

/** 읍면동 채우기 수정. */
export function updateEupmyeondongMapFill(
  sigunguCd: string,
  fillMapId: number,
  body: EmdFillUpdateRequest,
) {
  return apiFetch<EmdFillResponse>(
    `/map-design/${toSigunguParam(sigunguCd)}/update/${fillMapId}`,
    { method: "PATCH", body },
  );
}

// ─── 스티커 ───────────────────────────────────────────────────────────────

/** 스티커 카탈로그 조회. */
export function getStickers() {
  return apiFetch<ListResult<StickerResponse>>("/stickers");
}

/** 읍면동 지도에 놓인 스티커 조회. */
export function getEupmyeondongMapStickers(sigunguCd: string) {
  return apiFetch<ListResult<MapStickerResponse>>(
    `/map-design/${toSigunguParam(sigunguCd)}/stickers`,
  );
}

/** 읍면동 지도에 스티커 배치. */
export function addEupmyeondongMapSticker(sigunguCd: string, body: MapStickerRequest) {
  return apiFetch<MapStickerResponse>(`/map-design/${toSigunguParam(sigunguCd)}/stickers`, {
    method: "POST",
    body,
  });
}

// ─── 지도 위 사진 카드(여행기록) ───────────────────────────────────────────

/** 읍면동 지도에 놓인 사진 카드 조회. */
export function getEupmyeondongMapTravelPosts(sigunguCd: string) {
  return apiFetch<ListResult<MapTravelPostResponse>>(
    `/map-design/${toSigunguParam(sigunguCd)}/travel-post`,
  );
}

/** 읍면동 지도에 사진 카드 배치. */
export function addEupmyeondongMapTravelPost(sigunguCd: string, body: MapTravelPostRequest) {
  return apiFetch<MapTravelPostResponse>(
    `/map-design/${toSigunguParam(sigunguCd)}/travel-post`,
    { method: "POST", body },
  );
}

// ─── 관광지 API 재노출 (lib/api/spot 재사용, 이관하지 않음) ─────────────────
// 관광지 API 최종 담당은 별도이므로 lib에 두고, 지도에서 필요한 것만 여기서 다시 내보낸다.
export { getSpotDetail };
