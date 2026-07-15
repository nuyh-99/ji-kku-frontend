"use client";

// 앱 전역 TanStack Query Provider.
// makeQueryClient()로 클라이언트를 만들고 Devtools를 함께 마운트한다.
import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { makeQueryClient } from "./queryClient";

export default function QueryProvider({ children }: { children: ReactNode }) {
  // 요청/렌더 간 클라이언트가 재생성되지 않도록 lazy 초기화.
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
