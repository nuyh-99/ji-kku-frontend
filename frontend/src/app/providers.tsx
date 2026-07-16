// 앱 전역 Provider 조합 지점. 현재는 TanStack Query만 사용한다.
// 추가 Provider(테마·인증 등)가 생기면 여기서 중첩한다.
// QueryClient/Devtools 설정은 lib/query로 분리했다.
import type { ReactNode } from "react";
import QueryProvider from "@/lib/query/QueryProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
