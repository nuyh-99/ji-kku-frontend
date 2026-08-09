"use client";

// 지도 UI 클라이언트 상태 (Zustand).
// 서버 상태(방문/채움)는 여기 두지 않는다 — useRegionStatus(Query)에서 직접 읽는다.
// (상태 경계 규칙: README §4 "Query 단일 출처")
//
// 지도는 2단계다.
//   1단계: 강원 시·군·구 지도            → activeSigungu === null
//   2단계: 특정 시군구의 읍·면·동 지도    → activeSigungu === "51830"
// 지역 탭의 의미가 모드에 따라 갈린다(디자인에 전환 트리거가 없어 이렇게 정했다):
//   - 감상 모드(도구 미선택): 시군구 탭 = 2단계로 들어가기
//   - 도구 모드(색/사진/스티커): 지역 탭 = 꾸밀 대상 선택
import { create } from "zustand";
import type { SigunguCode } from "../types";

interface MapState {
  /** 드릴다운해 들어간 시군구. null이면 1단계(시군구 지도). */
  activeSigungu: SigunguCode | null;
  /** 현재 선택된 지역 코드. 1단계면 시군구 코드, 2단계면 읍·면·동 코드. */
  selectedRegion: string | null;
  /** 2단계 진입. 선택은 초기화한다(레벨이 바뀌면 코드 체계가 달라지므로). */
  enterSigungu: (code: SigunguCode) => void;
  /** 1단계로 복귀. */
  leaveSigungu: () => void;
  /** 지역 선택/해제. */
  selectRegion: (code: string | null) => void;
  /** 초기 상태로 되돌리기. */
  reset: () => void;
}

export const useMapStore = create<MapState>()((set) => ({
  activeSigungu: null,
  selectedRegion: null,
  enterSigungu: (code) => set({ activeSigungu: code, selectedRegion: null }),
  leaveSigungu: () => set({ activeSigungu: null, selectedRegion: null }),
  selectRegion: (code) => set({ selectedRegion: code }),
  reset: () => set({ activeSigungu: null, selectedRegion: null }),
}));
