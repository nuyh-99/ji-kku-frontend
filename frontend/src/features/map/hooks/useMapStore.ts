"use client";

// 지도 스토어 selector 훅 — 필요한 조각만 구독해 불필요한 리렌더를 줄인다.
import { useMapStore } from "../store/mapStore";

/** 드릴다운해 들어간 시군구 (null이면 1단계). */
export const useActiveSigungu = () => useMapStore((state) => state.activeSigungu);

/** 현재 선택된 지역 코드 (1단계면 시군구, 2단계면 읍·면·동). */
export const useSelectedRegion = () => useMapStore((state) => state.selectedRegion);

/** 2단계 진입 액션. */
export const useEnterSigungu = () => useMapStore((state) => state.enterSigungu);

/** 1단계 복귀 액션. */
export const useLeaveSigungu = () => useMapStore((state) => state.leaveSigungu);

/** 지역 선택/해제 액션. */
export const useSelectRegion = () => useMapStore((state) => state.selectRegion);
