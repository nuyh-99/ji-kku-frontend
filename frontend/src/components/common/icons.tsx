// 화면 여러 곳에서 쓰는 공용 아이콘 (인라인 SVG, currentColor).
// 한 feature 안에서만 쓰는 아이콘은 그 feature 폴더에 둔다
// (feature 끼리는 import 할 수 없으므로, 둘 이상이 쓰면 여기로 올린다).
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** 뒤로(‹). */
export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 다음(›). */
export function ChevronRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 햄버거 메뉴(≡). */
export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
