"use client";

// 꾸미기 도구 선택 후, 아직 지역이 선택되지 않았을 때 상단 안내.
// (디자인: 좌상단 "꾸밀 지역을 선택하세요 >")
export default function RegionSelectPrompt() {
  return (
    <p className="absolute top-3 left-4 z-10 text-sm font-semibold" style={{ color: "#3b5bd9" }}>
      꾸밀 지역을 선택하세요 &gt;
    </p>
  );
}
