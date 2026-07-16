"use client";

// 지도 스토어 selector 훅 — 필요한 조각만 구독해 불필요한 리렌더를 줄인다.
import { useMapStore } from "../store/mapStore";

/** 현재 선택된 시·군 */
export const useSelectedSigungu = () => useMapStore((state) => state.selectedSigungu);

/** 시·군 선택/해제 액션 */
export const useSelectSigungu = () => useMapStore((state) => state.selectSigungu);
