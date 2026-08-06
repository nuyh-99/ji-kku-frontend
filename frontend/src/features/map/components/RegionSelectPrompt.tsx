"use client";

// 도구를 켠 뒤 아직 지역이 선택되지 않았을 때 상단 안내.
// (디자인 470:3787 — 좌상단 "꾸밀 지역을 선택하세요 >", 브랜드 초록)
//
// 화살표(>)는 눌렀을 때 뭐가 나오는지 디자인에 없어 지금은 장식이다.
const BRAND = "#6ca59c";

interface RegionSelectPromptProps {
  /** 무엇을 하려고 고르는지. 기록 작성처럼 꾸미기가 아닌 도구도 이 안내를 쓴다. */
  label?: string;
}

export default function RegionSelectPrompt({
  label = "꾸밀 지역을 선택하세요",
}: RegionSelectPromptProps) {
  return (
    <p className="absolute top-3 left-4 z-10 text-sm font-semibold" style={{ color: BRAND }}>
      {label} &gt;
    </p>
  );
}
