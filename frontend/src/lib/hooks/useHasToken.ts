"use client";

import { useSyncExternalStore } from "react";
import { getAccessToken } from "../api/client";

const NO_SUBSCRIBE = () => () => {};

/**
 * 토큰 보유 여부. 인증이 필요한 조회를 비로그인 상태에서 401 로 반복해 던지지 않도록
 * 쿼리를 꺼두는 데 쓴다. localStorage 는 서버 렌더에 없어서, 서버에서는 비로그인으로 본다.
 */
export function useHasToken(): boolean {
  return useSyncExternalStore(
    // 토큰이 바뀌는 순간(로그인/로그아웃)은 페이지 이동을 동반하므로 따로 구독하지 않는다.
    NO_SUBSCRIBE,
    () => getAccessToken() !== null,
    // 서버 스냅샷 — localStorage 가 없으니 항상 비로그인으로 본다.
    () => false,
  );
}
