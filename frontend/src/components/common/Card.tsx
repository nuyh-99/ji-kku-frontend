// 공통 카드 컨테이너 컴포넌트 (기본형).
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/15 dark:bg-zinc-900 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
