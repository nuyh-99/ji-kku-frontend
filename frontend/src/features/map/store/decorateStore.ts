"use client";

// 지도 꾸미기 **UI 상태**만 담는 스토어 (Zustand).
// - fabOpen: FAB(+) 메뉴 펼침 여부
// - tool: 활성 꾸미기 도구(색/사진/스티커/기록). null이면 기본(감상) 모드.
// - selectedStickerId / selectedPhotoCardId: 편집 중(점선 박스) 대상
//
// 채움·스티커·사진 카드 같은 **서버 상태는 여기 두지 않는다** — hooks/useMapDesign.ts(Query)가
// 단일 출처다. 선택된 지역(selectedRegion)·드릴다운(activeSigungu)은 mapStore 가 들고 있다.
import { create } from "zustand";

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

/** 크기 조절 결과를 허용 범위 안으로 잘라준다. 서버 값이 튀어도 화면이 깨지지 않게. */
export function clampStickerSize(size: number): number {
  return Math.min(MAX_STICKER_SIZE, Math.max(MIN_STICKER_SIZE, size));
}

export function clampPhotoCardWidth(width: number): number {
  return Math.min(MAX_PHOTO_CARD_WIDTH, Math.max(MIN_PHOTO_CARD_WIDTH, width));
}

interface DecorateState {
  fabOpen: boolean;
  tool: DecorateTool | null;
  /** 편집 중(점선 박스 표시) 스티커. */
  selectedStickerId: string | null;
  /** 편집 중(점선 박스 표시) 사진 카드. */
  selectedPhotoCardId: string | null;

  /** FAB 메뉴 토글 */
  toggleFab: () => void;
  /** FAB 메뉴 닫기 */
  closeFab: () => void;
  /** 도구 선택 → 해당 모드 진입(메뉴는 닫는다) */
  openTool: (tool: DecorateTool) => void;
  /** 도구 종료 → 기본 모드로 */
  closeTool: () => void;
  /** 편집 대상 지정/해제 */
  selectSticker: (id: string | null) => void;
  selectPhotoCard: (id: string | null) => void;
}

export const useDecorateStore = create<DecorateState>()((set) => ({
  fabOpen: false,
  tool: null,
  selectedStickerId: null,
  selectedPhotoCardId: null,

  toggleFab: () => set((state) => ({ fabOpen: !state.fabOpen })),
  closeFab: () => set({ fabOpen: false }),
  openTool: (tool) =>
    set({ tool, fabOpen: false, selectedStickerId: null, selectedPhotoCardId: null }),
  closeTool: () => set({ tool: null, selectedStickerId: null, selectedPhotoCardId: null }),
  selectSticker: (id) => set({ selectedStickerId: id }),
  selectPhotoCard: (id) => set({ selectedPhotoCardId: id }),
}));
