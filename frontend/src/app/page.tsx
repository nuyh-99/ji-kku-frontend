// 루트(/) 페이지 — 초기 세팅용 라우트 허브.
// 팀원이 각 화면으로 이동해 자기 담당 페이지를 바로 열어볼 수 있게 만든 임시 화면입니다.
// C 김수빈(기본 서비스 페이지)이 실제 랜딩/스플래시로 교체하세요.
import Link from "next/link";

const groups = [
  {
    owner: "A 박태현 · 지도 핵심 기능",
    routes: [
      { href: "/map", label: "/map · 지도" },
      { href: "/spots/spot-1", label: "/spots/[spotId] · 관광지 상세(지도→상세 이동)" },
    ],
  },
  {
    owner: "B 강수연 · 관광지 · 기록 · 업적",
    routes: [
      { href: "/event-regions", label: "/event-regions · 추천/이벤트 지역" },
      { href: "/spots/1", label: "/spots/[spotId] · 관광지 상세" },
      { href: "/records", label: "/records · 여행 기록" },
      { href: "/achievements", label: "/achievements · 업적" },
    ],
  },
  {
    owner: "C 김수빈 · 기본 서비스 · 커뮤니티",
    routes: [
      { href: "/login", label: "/login · 로그인" },
      { href: "/home", label: "/home · 홈" },
      { href: "/mypage", label: "/mypage · 마이페이지" },
      { href: "/notices", label: "/notices · 공지사항" },
      { href: "/contact", label: "/contact · 문의" },
      { href: "/events", label: "/events · 이벤트" },
    ],
  },
];

export default function RootHub() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Ji-kku · 초기 세팅</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        관광데이터 공모전 프론트엔드입니다. 아래에서 각 화면으로 이동해 담당 페이지를 작업하세요. 이
        허브 화면은 임시이며, 실제 서비스에 맞게 자유롭게 교체하면 됩니다.
      </p>

      <div className="mt-8 space-y-6">
        {groups.map((group) => (
          <section key={group.owner}>
            <h2 className="text-sm font-semibold text-zinc-500">{group.owner}</h2>
            <ul className="mt-2 space-y-1">
              {group.routes.map((route) => (
                <li key={route.label}>
                  <Link
                    href={route.href}
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
