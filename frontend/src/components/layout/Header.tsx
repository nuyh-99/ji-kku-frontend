// 상단 헤더 (선택적으로 사용).
// 모든 페이지에 강제 적용되어 있지 않으며, 필요할 때 레이아웃/페이지에서 불러 쓰세요.
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-black/10 bg-white/80 px-4 backdrop-blur dark:border-white/10 dark:bg-black/60">
      <Link href="/" className="text-lg font-bold tracking-tight">
        Ji-kku
      </Link>
      <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300">
        <Link href="/map" className="hover:underline">
          지도
        </Link>
        <Link href="/records" className="hover:underline">
          기록
        </Link>
        <Link href="/mypage" className="hover:underline">
          MY
        </Link>
      </nav>
    </header>
  );
}
