// 지도(map) 도메인 타입 정의 — 지도 feature 내부 계약의 단일 출처.
// 아래 절반은 백엔드 계약(스웨거 https://jikku-backend.fly.dev/swagger-ui/index.html)을 그대로 옮긴 것이고,
// 화면이 쓰는 표현형(RegionFill/PlacedSticker/PlacedPhotoCard)은 @/types/map 에 있다.
// 둘 사이 변환은 hooks/useMapDesign.ts 의 매퍼가 전담한다.

/** 시·군·구 코드 (예: "51110" 강원 춘천시). 화면에서는 문자열, 서버로는 숫자로 보낸다. */
export type SigunguCode = string;

/** 읍·면·동 코드 = 행정동코드 10자리(adm_cd2, 예: "5111025000"). */
export type EupmyeondongCode = string;

// ─── 서버 계약: 채우기(fill) ──────────────────────────────────────────────

/** 채움 방식. 서버는 색과 이미지 둘만 구분한다(비움 = 레코드 없음). */
export type FillType = "COLOR" | "IMAGE";

/** 시군구 채움 한 건. */
export interface SigunguFillResponse {
  fillMapId: number;
  sigunguCd: number;
  sigunguNm: string;
  mapType: string;
  fillType: FillType;
  color: string | null;
  imgUrl: string | null;
}

/** 읍면동 채움 한 건. 어느 동인지는 emdId 로만 온다(이름·코드 없음). */
export interface EmdFillResponse {
  fillMapId: number;
  sigunguCd: number;
  emdId: number;
  mapType: string;
  fillType: FillType;
  color: string | null;
  imgUrl: string | null;
}

export interface SigunguFillRequest {
  sigunguCd: number;
  fillType: FillType;
  color?: string | null;
  imgUrl?: string | null;
}

export interface EmdFillRequest {
  emdId: number;
  fillType: FillType;
  color?: string | null;
  imgUrl?: string | null;
}

/** 읍면동 채움 수정 — 대상은 경로(fillMapId)로 지정하므로 본문에 emdId 가 없다. */
export interface EmdFillUpdateRequest {
  fillType: FillType;
  color?: string | null;
  imgUrl?: string | null;
}

// ─── 서버 계약: 스티커 ────────────────────────────────────────────────────

/** 스티커 카탈로그 한 종 (GET /stickers). */
export interface StickerResponse {
  stickerId: number;
  stickerUrl: string;
}

export interface MapStickerRequest {
  stickerId: number;
  posX: number;
  posY: number;
  scale: number;
  zIndex: number;
}

/**
 * 지도에 놓인 스티커 한 개.
 * 스티커와 사진 카드가 같은 테이블을 쓰므로 stickerType 으로 갈린다 — 스티커면 travelPostId 가,
 * 사진 카드면 stickerId/stickerUrl 이 비어 온다.
 */
export interface MapStickerResponse {
  mapStickerId: number;
  stickerType: string;
  travelPostId: number | null;
  stickerId: number | null;
  stickerUrl: string | null;
  posX: number;
  posY: number;
  scale: number;
  zIndex: number;
}

// ─── 서버 계약: 지도 위 사진 카드(여행기록) ────────────────────────────────

export interface MapTravelPostRequest {
  travelPostId: number;
  posX: number;
  posY: number;
  scale: number;
  zIndex: number;
}

export interface MapTravelPostResponse {
  mapStickerId: number;
  stickerType: string;
  travelPostId: number;
  firstImage: string | null;
  title: string;
  posX: number;
  posY: number;
  scale: number;
  zIndex: number;
}

/** 목록 응답 공통 껍데기 — 서버가 배열을 항상 { content } 로 감싼다. */
export interface ListResult<T> {
  content: T[];
}
