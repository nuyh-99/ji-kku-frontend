import { ApiError, ERROR_CODES, isKnownErrorCode } from "./types";
import type { ApiResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/** 로그인 시 카카오 콜백이 저장하는 키 (app/auth/kakao/callback/page.tsx). */
const ACCESS_TOKEN_KEY = "accessToken";

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/** 저장된 액세스 토큰. 서버 사이드(localStorage 없음)에서는 null. */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getAuthHeader(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * 공통 fetch 래퍼. 성공 시 result를 T로 반환하고, 실패 시 ApiError를 던집니다.
 *
 * body가 FormData면 multipart 업로드로 보고 JSON 직렬화를 건너뜁니다.
 * (Content-Type을 직접 지정하면 boundary가 빠져 서버가 파싱하지 못하므로 브라우저에 맡깁니다.)
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const isMultipart = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(isMultipart ? {} : { "Content-Type": "application/json" }),
      ...getAuthHeader(),
      ...headers,
    },
    body: isMultipart ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
  const data: ApiResponse<T> | undefined = isJson ? await response.json() : undefined;

  if (!response.ok || !data || !data.isSuccess) {
    const code = data?.code ?? "COMMON500_1";
    const fallbackMessage = isKnownErrorCode(code)
      ? ERROR_CODES[code].message
      : "알 수 없는 오류가 발생했습니다.";
    throw new ApiError(code, data?.message ?? fallbackMessage, response.status);
  }

  return data.result;
}
