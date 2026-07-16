"use client";

// 지도 UI 클라이언트 상태 (Zustand).
// 서버 상태(방문/채움)는 여기 두지 않는다 — useRegionStatus(Query)에서 직접 읽는다.
// (상태 경계 규칙: 계획 §8 "Query 단일 출처")
import { create } from "zustand";
import type { SigunguCode } from "../types";

interface MapState {
  /** 현재 선택된 시·군 (없으면 null) */
  selectedSigungu: SigunguCode | null;
  /** 시·군 선택/해제 */
  selectSigungu: (code: SigunguCode | null) => void;
  /** 초기 상태로 되돌리기 */
  reset: () => void;
}

export const useMapStore = create<MapState>()((set) => ({
  selectedSigungu: null,
  selectSigungu: (code) => set({ selectedSigungu: code }),
  reset: () => set({ selectedSigungu: null }),
}));
