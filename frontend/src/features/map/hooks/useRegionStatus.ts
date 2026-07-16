"use client";

// 선택된 지역의 방문/채움 상태를 조회하는 훅.
// 방문/채움 상태의 '단일 출처' — 컴포넌트는 스토어가 아니라 이 훅에서 읽는다 (계획 §8).
import { useQuery } from "@tanstack/react-query";
import { getEupmyeondongMapDesign } from "../api/mapApi";
import { mapKeys } from "./queryKeys";
import type { SigunguCode } from "../types";

/**
 * 시·군이 선택됐을 때만 해당 지역 상태를 조회한다.
 * TODO: 응답 타입 확정 후 select로 RegionStatus[] 형태로 매핑.
 */
export function useRegionStatus(sigunguCd: SigunguCode | null) {
  return useQuery({
    queryKey: sigunguCd ? mapKeys.regionStatus(sigunguCd) : mapKeys.all,
    queryFn: () => getEupmyeondongMapDesign(sigunguCd as string),
    enabled: sigunguCd !== null,
  });
}
