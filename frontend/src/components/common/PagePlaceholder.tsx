// 각 페이지의 임시(placeholder) 화면.
// 담당자는 이 컴포넌트를 걷어내고 실제 화면을 구현하면 됩니다.
import Link from "next/link";
import type { ReactNode } from "react";

interface PagePlaceholderProps {
  /** 페이지 제목 */
  title: string;
  /** 담당 영역 설명 (예: "A 담당 · 지도 핵심 기능") */
  owner: string;
  /** 이 페이지가 하는 일 한 줄 설명 */
  description: string;
  /** 추후 구현할 TODO 목록 */
  todos?: string[];
  /** 추가로 넣고 싶은 내용 */
  children?: ReactNode;
}

export default function PagePlaceholder({
  title,
  owner,
  description,
  todos = [],
  children,
}: PagePlaceholderProps) {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-12">
      <p className="mb-2 inline-block rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
        {owner}
      </p>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{description}</p>

      {todos.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-zinc-500">추후 구현 TODO</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            {todos.map((todo) => (
              <li key={todo}>{todo}</li>
            ))}
          </ul>
        </section>
      )}

      {children}

      <div className="mt-10 border-t border-black/10 pt-4 dark:border-white/10">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← 홈으로
        </Link>
      </div>
    </main>
  );
}
