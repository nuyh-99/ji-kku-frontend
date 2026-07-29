"use client";

// 지도 꾸미기 UI 클라이언트 상태 (Zustand).
// - fabOpen: FAB(+) 메뉴 펼침 여부
// - tool: 활성 꾸미기 도구(색/사진/스티커). null이면 기본(감상) 모드.
// - fills: 지역별 채움 드래프트(색/사진). 시군구·읍면동 코드가 서로 달라 한 맵에 같이 둔다.
// - stickersBySigungu: 시군구별로 지도 위에 놓인 스티커. 좌표 기반이라 fills와 분리한다.
//   ⚠️ 서버 영속화(mapApi)는 백엔드 확정 후 연결 — 지금은 로컬 드래프트만 유지.
// 선택된 지역(selectedRegion)·드릴다운(activeSigungu)은 mapStore가 들고 있다.
import { create } from "zustand";
import type { PlacedSticker, RegionFill } from "@/types/map";
import type { SigunguCode } from "../types";

/** 꾸미기 도구 = 바텀시트 종류. */
export type DecorateTool = "color" | "photo" | "sticker";

/** 새 스티커의 기본 한 변 길이(viewBox 단위). 디자인 51px. */
export const DEFAULT_STICKER_SIZE = 51;

/** 스티커 최소/최대 크기(viewBox 단위) — 줄이다 사라지거나 화면을 덮는 걸 막는다. */
const MIN_STICKER_SIZE = 16;
const MAX_STICKER_SIZE = 260;

interface DecorateState {
  fabOpen: boolean;
  tool: DecorateTool | null;
  fills: Record<string, RegionFill>;
  stickersBySigungu: Record<string, PlacedSticker[]>;
  /** 편집 중(점선 박스 표시) 스티커. */
  selectedStickerId: string | null;
  /** 스티커 인스턴스 id 채번용 — 렌더마다 값이 흔들리지 않게 스토어가 센다. */
  stickerSeq: number;

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
}

export const useDecorateStore = create<DecorateState>()((set) => ({
  fabOpen: false,
  tool: null,
  fills: {},
  stickersBySigungu: {},
  selectedStickerId: null,
  stickerSeq: 0,

  toggleFab: () => set((state) => ({ fabOpen: !state.fabOpen })),
  closeFab: () => set({ fabOpen: false }),
  openTool: (tool) => set({ tool, fabOpen: false, selectedStickerId: null }),
  closeTool: () => set({ tool: null, selectedStickerId: null }),
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
}));
