// 지도 도메인 전용 query key 팩토리.
// 다른 도메인과 키가 겹치지 않도록 ["map", ...] 스코프로 격리한다.
import type { SigunguCode } from "../types";

export const mapKeys = {
  all: ["map"] as const,
  /** 1단계 시군구 채움 (GET /map-design) */
  sigunguFills: () => [...mapKeys.all, "fills", "sigungu"] as const,
  /** 2단계 읍면동 채움 (GET /map-design/{sigunguCd}) */
  emdFills: (sigunguCd: SigunguCode) => [...mapKeys.all, "fills", "emd", sigunguCd] as const,
  /** 스티커 카탈로그 (GET /stickers) — 사용자와 무관해 시군구 스코프가 없다. */
  stickerCatalog: () => [...mapKeys.all, "sticker-catalog"] as const,
  /** 지도에 놓인 스티커 (GET /map-design/{sigunguCd}/stickers) */
  stickers: (sigunguCd: SigunguCode) => [...mapKeys.all, "stickers", sigunguCd] as const,
  /** 지도에 놓인 사진 카드 (GET /map-design/{sigunguCd}/travel-post) */
  photoCards: (sigunguCd: SigunguCode) => [...mapKeys.all, "photo-cards", sigunguCd] as const,
  /**
   * 지역별 기록 목록 (GET /travel-posts/{sigunguCd}).
   * 날짜 필터는 서버가 받으므로 키에 포함한다 — 날짜가 바뀌면 다른 목록이다.
   */
  regionPosts: (sigunguCd: SigunguCode, date?: string) =>
    [...mapKeys.all, "region-posts", sigunguCd, date ?? "all"] as const,
} as const;
