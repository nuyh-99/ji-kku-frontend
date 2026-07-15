import { apiFetch } from "./client";

/** 내 정보 조회. TODO: 응답 타입 확정 필요 */
export function getMyPage() {
  return apiFetch<unknown>("/my-page");
}
