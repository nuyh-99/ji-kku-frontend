// 읍·면·동 목록 (GET /emds/{sigunguCd}).
// 지도 채우기(features/map)와 기록 작성(features/records)이 둘 다 쓰므로 lib 에 둔다.
import { apiFetch } from "./client";

/**
 * 서버가 주는 읍·면·동 한 개.
 * ⚠️ 이름만 오고 **행정동코드가 없다** — 로컬 지도 데이터와는 이름으로 맞춰야 한다
 * (lib/hooks/useEmds 가 그 일을 한다).
 */
export interface EmdResponse {
  emdId: number;
  emdNm: string;
}

/** 목록 응답 공통 껍데기 — 서버가 배열을 항상 { content } 로 감싼다. */
export interface EmdListResult {
  content: EmdResponse[];
}

/** 서버는 시군구를 숫자로 받는다. 화면이 들고 있는 문자열 코드를 여기서만 바꾼다. */
export function getEmds(sigunguCd: string): Promise<EmdListResult> {
  return apiFetch<EmdListResult>(`/emds/${Number(sigunguCd)}`);
}
