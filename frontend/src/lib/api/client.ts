import { ApiError, ERROR_CODES, isKnownErrorCode } from "./types";
import type { ApiResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/** 로그인 시 카카오 콜백이 저장하는 키 (app/auth/kakao/callback/page.tsx). */
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/** 액세스 토큰만 만료됐을 때 서버가 주는 코드. 이때만 재발급을 시도한다. */
const EXPIRED_TOKEN_CODE = "AUTH401_3";

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/** 저장된 액세스 토큰. 서버 사이드(localStorage 없음)에서는 null. */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens(accessToken: string, refreshToken: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function getAuthHeader(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** POST /auth/reissue 응답. */
interface TokenResult {
  grantType: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * 진행 중인 재발급. 여러 요청이 동시에 만료를 맞아도 재발급은 한 번만 나가야 한다 —
 * 서버가 refresh 토큰을 회전시키므로, 동시에 두 번 보내면 늦은 쪽이 무효 토큰을 쓰게 된다.
 */
let refreshing: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  refreshing ??= requestReissue().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/**
 * refresh 토큰으로 액세스 토큰을 다시 받는다. 성공하면 새 토큰을 저장하고 true.
 *
 * apiFetch 를 쓰지 않는다 — 이 호출이 401을 맞으면 다시 재발급을 부르는 무한 재귀가 된다.
 */
async function requestReissue(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/auth/reissue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // 네트워크 실패는 토큰이 상했다는 뜻이 아니다 — 지우지 않고 다음 기회를 남긴다.
    return false;
  }

  const data: ApiResponse<TokenResult> | undefined = await readJsonBody(response);
  if (!response.ok || !data?.isSuccess || !data.result?.accessToken) {
    // refresh 토큰까지 만료(AUTH401_3)됐다. 다시 로그인하는 수밖에 없으니 정리한다.
    clearTokens();
    return false;
  }

  setTokens(data.result.accessToken, data.result.refreshToken);
  return true;
}

async function readJsonBody<T>(response: Response): Promise<ApiResponse<T> | undefined> {
  const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
  if (!isJson) return undefined;
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return undefined;
  }
}

/**
 * 공통 fetch 래퍼. 성공 시 result를 T로 반환하고, 실패 시 ApiError를 던집니다.
 *
 * body가 FormData면 multipart 업로드로 보고 JSON 직렬화를 건너뜁니다.
 * (Content-Type을 직접 지정하면 boundary가 빠져 서버가 파싱하지 못하므로 브라우저에 맡깁니다.)
 *
 * 액세스 토큰이 만료돼 있으면 재발급을 한 번 시도하고 같은 요청을 다시 보냅니다.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  return sendRequest<T>(path, options, true);
}

async function sendRequest<T>(
  path: string,
  options: ApiFetchOptions,
  allowRetry: boolean,
): Promise<T> {
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

  const data: ApiResponse<T> | undefined = await readJsonBody<T>(response);

  if (!response.ok || !data || !data.isSuccess) {
    const code = data?.code ?? "COMMON500_1";

    // 만료된 액세스 토큰은 되살릴 수 있다. 재발급에 성공하면 같은 요청을 한 번만 다시 보낸다.
    if (allowRetry && code === EXPIRED_TOKEN_CODE && (await refreshAccessToken())) {
      return sendRequest<T>(path, options, false);
    }

    const fallbackMessage = isKnownErrorCode(code)
      ? ERROR_CODES[code].message
      : "알 수 없는 오류가 발생했습니다.";
    throw new ApiError(code, data?.message ?? fallbackMessage, response.status);
  }

  return data.result;
}
