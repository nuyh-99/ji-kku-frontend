"use client";

// 행정동코드 ↔ 서버 emdId 대응. 지도 채우기와 기록 작성이 둘 다 필요로 해서 lib 에 둔다.
//
// 서버 목록(GET /emds/{sigunguCd})은 { emdId, emdNm } 만 준다 — 행정동코드가 없다.
// 그래서 로컬 지도 데이터(data/regions/eupmyeondong)의 **이름**으로 코드에 잇는다.
// 2026-09-07 18개 시군구 전수 대조 결과: 지도에 그려지는 193개 동 중 이름이 어긋나는 건 0개.
// (서버에만 있는 철원 근동·원남·원동·임남면, 고성 수동면은 민통선 안이라 지도에 도형이 없다.
//  고를 수 없는 동이므로 대응표에서 빼고, 표에 없는 코드는 null 로 떨어뜨린다.)
//
// emdId 는 DB 자동 증가 id 라(2026-09-07 기준 1~193, 시군구 순 × 가나다 순) 재시딩하면 통째로
// 밀린다. 그래서 표로 박아두지 않고 조회한다 — 대신 사용자와 무관하고 잘 바뀌지 않아 오래 캐시한다.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEupmyeondongMap } from "@/data/regions/eupmyeondong";
import { getEmds } from "../api/emd";
import type { EmdListResult } from "../api/emd";
import { useHasToken } from "./useHasToken";

export const emdKeys = {
  all: ["emds"] as const,
  list: (sigunguCd: string) => [...emdKeys.all, sigunguCd] as const,
};

/** 대응표가 아직 없을 때(조회 전·실패) 사용자에게 보여줄 문구. */
export const EMD_UNRESOLVED_MESSAGE =
  "지역 정보를 아직 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";

export interface EmdLookup {
  /** 행정동코드 → 서버 emdId. 대응이 없으면 null. */
  emdIdOfCode: (emdCode: string) => number | null;
  /** 서버 emdId → 행정동코드. 대응이 없으면 null. */
  codeOfEmdId: (emdId: number) => string | null;
  /** 대응표가 만들어졌는지. 거짓이면 emdId 를 요구하는 요청을 보내면 안 된다. */
  isReady: boolean;
}

export function useEmds(sigunguCd: string | null): EmdLookup {
  const hasToken = useHasToken();

  const { data } = useQuery({
    queryKey: emdKeys.list(sigunguCd ?? ""),
    queryFn: () => getEmds(sigunguCd as string),
    enabled: hasToken && sigunguCd !== null,
    // 카탈로그성 데이터다 — 한 세션에서 시군구당 한 번이면 충분하다.
    staleTime: 30 * 60_000,
    select: (result: EmdListResult) => result.content ?? [],
  });

  return useMemo(() => {
    const idByCode = new Map<string, number>();
    const codeById = new Map<number, string>();

    const regions = getEupmyeondongMap(sigunguCd)?.regions ?? [];
    const codeByName = new Map(regions.map((region) => [region.name, region.code]));

    for (const { emdId, emdNm } of data ?? []) {
      const code = codeByName.get(emdNm);
      if (code === undefined) continue; // 지도에 도형이 없는 동 — 고를 수 없으니 뺀다.
      idByCode.set(code, emdId);
      codeById.set(emdId, code);
    }

    return {
      emdIdOfCode: (emdCode: string) => idByCode.get(emdCode) ?? null,
      codeOfEmdId: (emdId: number) => codeById.get(emdId) ?? null,
      isReady: idByCode.size > 0,
    };
  }, [sigunguCd, data]);
}
