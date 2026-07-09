// 하단 탭 네비게이션 (선택적으로 사용, 모바일 웹앱용).
// 모든 페이지에 강제 적용되어 있지 않으며, 필요할 때 레이아웃/페이지에서 불러 쓰세요.
import Link from "next/link";

const tabs = [
  { href: "/home", label: "홈", icon: "🏠" },
  { href: "/map", label: "지도", icon: "🗺️" },
  { href: "/records", label: "기록", icon: "📓" },
  { href: "/achievements", label: "업적", icon: "🏅" },
  { href: "/mypage", label: "MY", icon: "👤" },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex h-16 items-center justify-around border-t border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-black/70">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className="flex flex-col items-center gap-0.5 text-xs text-zinc-600 hover:text-foreground dark:text-zinc-300"
        >
          <span className="text-lg" aria-hidden>
            {tab.icon}
          </span>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
