import { ApiError, ERROR_CODES, isKnownErrorCode } from "./types";
import type { ApiResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

// TODO: 토큰 저장/조회 로직이 확정되면 여기서 실제 토큰을 읽어와 Authorization 헤더에 실어주세요.
function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {}; // 서버 사이드 방어
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** 공통 fetch 래퍼. 성공 시 result를 T로 반환하고, 실패 시 ApiError를 던집니다. */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
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
