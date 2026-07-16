// TanStack Query QueryClient 팩토리.
// 앱 전체의 캐싱/리페치 기본 동작을 여기 한 곳에서 고정한다.
import { QueryClient } from "@tanstack/react-query";

/**
 * 공용 QueryClient를 생성한다.
 * 보수적 기본값: 재시도 1회, 창 포커스 시 자동 리페치 끔, 1분간 fresh 유지.
 * ⚠️ 이 설정은 앱 전역 쿼리 동작에 영향을 준다.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
      },
    },
  });
}
