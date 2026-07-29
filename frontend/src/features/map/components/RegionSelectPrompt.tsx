"use client";

// 꾸미기 도구 선택 후, 아직 지역이 선택되지 않았을 때 상단 안내.
// (디자인 470:3787 — 좌상단 "꾸밀 지역을 선택하세요 >", 브랜드 초록)
//
// 화살표(>)는 눌렀을 때 뭐가 나오는지 디자인에 없어 지금은 장식이다.
const BRAND = "#6ca59c";

export default function RegionSelectPrompt() {
  return (
    <p className="absolute top-3 left-4 z-10 text-sm font-semibold" style={{ color: BRAND }}>
      꾸밀 지역을 선택하세요 &gt;
    </p>
  );
}
