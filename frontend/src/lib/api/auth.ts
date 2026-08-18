import { apiFetch } from "./client";

type KakaoLoginResult = {
  grantType: string;
  accessToken: string;
  refreshToken: string;
};

/** 카카오 소셜 로그인 */
export function loginWithKakao(body: unknown) {
  return apiFetch<KakaoLoginResult>("/auth/login/kakao", {
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