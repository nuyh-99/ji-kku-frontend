"use client";

// 지도 꾸미기 UI 클라이언트 상태 (Zustand).
// - fabOpen: FAB(+) 메뉴 펼침 여부
// - tool: 활성 꾸미기 도구(색/사진/스티커). null이면 기본(감상) 모드.
// - fills: 지역별 채움 드래프트(색/사진). 시군구·읍면동 코드가 서로 달라 한 맵에 같이 둔다.
// - stickersBySigungu: 시군구별로 지도 위에 놓인 스티커. 좌표 기반이라 fills와 분리한다.
//   ⚠️ 서버 영속화(mapApi)는 백엔드 확정 후 연결 — 지금은 로컬 드래프트만 유지.
// 선택된 지역(selectedRegion)·드릴다운(activeSigungu)은 mapStore가 들고 있다.
import { create } from "zustand";
import type { PlacedPhotoCard, PlacedSticker, RegionFill } from "@/types/map";
import type { SigunguCode } from "../types";

/**
 * 지도에서 켤 수 있는 도구.
 * - color/photo: 지역을 고르면 바텀시트가 뜬다.
 * - sticker: 지역을 고르지 않는다(좌표에 놓는다).
 * - record: 지역을 고르면 기록 작성 화면으로 나간다(시트 없음).
 */
export type DecorateTool = "color" | "photo" | "sticker" | "record";

/** 새 스티커의 기본 한 변 길이(viewBox 단위). 디자인 51px. */
export const DEFAULT_STICKER_SIZE = 51;

/** 스티커 최소/최대 크기(viewBox 단위) — 줄이다 사라지거나 화면을 덮는 걸 막는다. */
const MIN_STICKER_SIZE = 16;
const MAX_STICKER_SIZE = 260;

/**
 * 새 사진 카드의 기본 폭(viewBox 단위).
 * 디자인(566:2034)에서 카드 90.67 / 지도 프레임 794.26 → 우리 지도 폭 682 기준 ≈ 78.
 */
export const DEFAULT_PHOTO_CARD_WIDTH = 78;

/** 사진 카드 최소/최대 폭(viewBox 단위). */
const MIN_PHOTO_CARD_WIDTH = 30;
const MAX_PHOTO_CARD_WIDTH = 320;

interface DecorateState {
  fabOpen: boolean;
  tool: DecorateTool | null;
  fills: Record<string, RegionFill>;
  stickersBySigungu: Record<string, PlacedSticker[]>;
  /** 시군구별로 지도 위에 놓인 사진 카드(기록을 "지도에 표시하기" 한 결과). */
  photoCardsBySigungu: Record<string, PlacedPhotoCard[]>;
  /** 편집 중(점선 박스 표시) 스티커. */
  selectedStickerId: string | null;
  /** 편집 중(점선 박스 표시) 사진 카드. */
  selectedPhotoCardId: string | null;
  /** 스티커 인스턴스 id 채번용 — 렌더마다 값이 흔들리지 않게 스토어가 센다. */
  stickerSeq: number;
  /** 사진 카드 인스턴스 id 채번용. */
  photoCardSeq: number;

  /** FAB 메뉴 토글 */
  toggleFab: () => void;
  /** FAB 메뉴 닫기 */
  closeFab: () => void;
  /** 도구 선택 → 해당 모드 진입(메뉴는 닫는다) */
  openTool: (tool: DecorateTool) => void;
  /** 도구 종료 → 기본 모드로 */
  closeTool: () => void;
  /** 지역 채움 설정 */
  setFill: (code: string, fill: RegionFill) => void;

  /**
   * 스티커 배치. 배치와 동시에 시트를 내리고(tool 해제) 방금 놓은 스티커를 편집 상태로 만든다.
   * 시트가 하단을 덮고 있으면 배치된 스티커가 안 보여서, 놓자마자 지도를 내준다.
   */
  addSticker: (
    sigunguCd: SigunguCode,
    sticker: Omit<PlacedSticker, "id" | "size"> & { size?: number },
  ) => void;
  /** 스티커 중심 좌표 이동 */
  moveSticker: (sigunguCd: SigunguCode, id: string, x: number, y: number) => void;
  /** 스티커 한 변 길이 변경 */
  resizeSticker: (sigunguCd: SigunguCode, id: string, size: number) => void;
  /** 스티커 삭제 */
  removeSticker: (sigunguCd: SigunguCode, id: string) => void;
  /** 편집 대상 지정/해제 */
  selectSticker: (id: string | null) => void;

  /** 사진 카드 배치. 놓자마자 편집 상태로 만들어 바로 옮길 수 있게 한다. */
  addPhotoCard: (
    sigunguCd: SigunguCode,
    card: Omit<PlacedPhotoCard, "id" | "width"> & { width?: number },
  ) => void;
  /** 사진 카드 중심 좌표 이동 */
  movePhotoCard: (sigunguCd: SigunguCode, id: string, x: number, y: number) => void;
  /** 사진 카드 폭 변경(높이는 비율로 따라온다) */
  resizePhotoCard: (sigunguCd: SigunguCode, id: string, width: number) => void;
  /** 사진 카드 삭제 */
  removePhotoCard: (sigunguCd: SigunguCode, id: string) => void;
  /** 편집 대상 지정/해제 */
  selectPhotoCard: (id: string | null) => void;
}

export const useDecorateStore = create<DecorateState>()((set) => ({
  fabOpen: false,
  tool: null,
  fills: {},
  stickersBySigungu: {},
  photoCardsBySigungu: {},
  selectedStickerId: null,
  selectedPhotoCardId: null,
  stickerSeq: 0,
  photoCardSeq: 0,

  toggleFab: () => set((state) => ({ fabOpen: !state.fabOpen })),
  closeFab: () => set({ fabOpen: false }),
  openTool: (tool) =>
    set({ tool, fabOpen: false, selectedStickerId: null, selectedPhotoCardId: null }),
  closeTool: () => set({ tool: null, selectedStickerId: null, selectedPhotoCardId: null }),
  setFill: (code, fill) => set((state) => ({ fills: { ...state.fills, [code]: fill } })),

  addSticker: (sigunguCd, sticker) =>
    set((state) => {
      const seq = state.stickerSeq + 1;
      const placed: PlacedSticker = {
        ...sticker,
        id: `st-${seq}`,
        size: sticker.size ?? DEFAULT_STICKER_SIZE,
      };
      const current = state.stickersBySigungu[sigunguCd] ?? [];
      return {
        stickerSeq: seq,
        tool: null,
        selectedStickerId: placed.id,
        stickersBySigungu: { ...state.stickersBySigungu, [sigunguCd]: [...current, placed] },
      };
    }),

  moveSticker: (sigunguCd, id, x, y) =>
    set((state) => {
      const current = state.stickersBySigungu[sigunguCd];
      if (!current) return state;
      return {
        stickersBySigungu: {
          ...state.stickersBySigungu,
          [sigunguCd]: current.map((s) => (s.id === id ? { ...s, x, y } : s)),
        },
      };
    }),

  resizeSticker: (sigunguCd, id, size) =>
    set((state) => {
      const current = state.stickersBySigungu[sigunguCd];
      if (!current) return state;
      const clamped = Math.min(MAX_STICKER_SIZE, Math.max(MIN_STICKER_SIZE, size));
      return {
        stickersBySigungu: {
          ...state.stickersBySigungu,
          [sigunguCd]: current.map((s) => (s.id === id ? { ...s, size: clamped } : s)),
        },
      };
    }),

  removeSticker: (sigunguCd, id) =>
    set((state) => {
      const current = state.stickersBySigungu[sigunguCd];
      if (!current) return state;
      return {
        selectedStickerId: state.selectedStickerId === id ? null : state.selectedStickerId,
        stickersBySigungu: {
          ...state.stickersBySigungu,
          [sigunguCd]: current.filter((s) => s.id !== id),
        },
      };
    }),

  selectSticker: (id) => set({ selectedStickerId: id }),

  addPhotoCard: (sigunguCd, card) =>
    set((state) => {
      const seq = state.photoCardSeq + 1;
      const placed: PlacedPhotoCard = {
        ...card,
        id: `pc-${seq}`,
        width: card.width ?? DEFAULT_PHOTO_CARD_WIDTH,
      };
      const current = state.photoCardsBySigungu[sigunguCd] ?? [];
      return {
        photoCardSeq: seq,
        selectedPhotoCardId: placed.id,
        photoCardsBySigungu: {
          ...state.photoCardsBySigungu,
          [sigunguCd]: [...current, placed],
        },
      };
    }),

  movePhotoCard: (sigunguCd, id, x, y) =>
    set((state) => {
      const current = state.photoCardsBySigungu[sigunguCd];
      if (!current) return state;
      return {
        photoCardsBySigungu: {
          ...state.photoCardsBySigungu,
          [sigunguCd]: current.map((c) => (c.id === id ? { ...c, x, y } : c)),
        },
      };
    }),

  resizePhotoCard: (sigunguCd, id, width) =>
    set((state) => {
      const current = state.photoCardsBySigungu[sigunguCd];
      if (!current) return state;
      const clamped = Math.min(MAX_PHOTO_CARD_WIDTH, Math.max(MIN_PHOTO_CARD_WIDTH, width));
      return {
        photoCardsBySigungu: {
          ...state.photoCardsBySigungu,
          [sigunguCd]: current.map((c) => (c.id === id ? { ...c, width: clamped } : c)),
        },
      };
    }),

  removePhotoCard: (sigunguCd, id) =>
    set((state) => {
      const current = state.photoCardsBySigungu[sigunguCd];
      if (!current) return state;
      return {
        selectedPhotoCardId: state.selectedPhotoCardId === id ? null : state.selectedPhotoCardId,
        photoCardsBySigungu: {
          ...state.photoCardsBySigungu,
          [sigunguCd]: current.filter((c) => c.id !== id),
        },
      };
    }),

  selectPhotoCard: (id) => set({ selectedPhotoCardId: id }),
}));
