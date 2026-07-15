import { apiFetch } from "./client";

/** 카카오 소셜 로그인. TODO: 요청/응답 타입 확정 필요 */
export function loginWithKakao(body: unknown) {
  return apiFetch<unknown>("/auth/login/kakao", {
    method: "POST",
    body,
  });
}

/** 로그아웃. TODO: 응답 타입 확정 필요 */
export function logout() {
  return apiFetch<unknown>("/auth/logout", {
    method: "POST",
  });
}
