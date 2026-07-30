"use client";

// 지도 꾸미기 UI 클라이언트 상태 (Zustand).
// - fabOpen: FAB(+) 메뉴 펼침 여부
// - tool: 활성 꾸미기 도구(색/사진). null이면 기본(감상) 모드.
// - fills: 지역별 채움 드래프트(색/사진). 서버 저장 전 로컬 상태.
//   ⚠️ 서버 영속화(mapApi)는 백엔드 확정 후 연결 — 지금은 로컬 드래프트만 유지.
// 선택된 지역(selectedSigungu)은 mapStore를 재사용한다.
import { create } from "zustand";
import type { RegionFill } from "@/types/map";
import type { SigunguCode } from "../types";

/** 꾸미기 도구 = 바텀시트 종류. */
export type DecorateTool = "color" | "photo";

interface DecorateState {
  fabOpen: boolean;
  tool: DecorateTool | null;
  fills: Record<string, RegionFill>;
  /** FAB 메뉴 토글 */
  toggleFab: () => void;
  /** FAB 메뉴 닫기 */
  closeFab: () => void;
  /** 도구 선택 → 해당 모드 진입(메뉴는 닫는다) */
  openTool: (tool: DecorateTool) => void;
  /** 도구 종료 → 기본 모드로 */
  closeTool: () => void;
  /** 지역 채움 설정 */
  setFill: (code: SigunguCode, fill: RegionFill) => void;
}

export const useDecorateStore = create<DecorateState>()((set) => ({
  fabOpen: false,
  tool: null,
  fills: {},
  toggleFab: () => set((state) => ({ fabOpen: !state.fabOpen })),
  closeFab: () => set({ fabOpen: false }),
  openTool: (tool) => set({ tool, fabOpen: false }),
  closeTool: () => set({ tool: null }),
  setFill: (code, fill) => set((state) => ({ fills: { ...state.fills, [code]: fill } })),
}));
