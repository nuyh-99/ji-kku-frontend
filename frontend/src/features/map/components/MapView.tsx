"use client";

// 지도 도메인 공개 진입점. app/map/page.tsx는 이 컴포넌트만 소비한다.
// 내부에서 지역 선택 UI + SVG 지도 + 상태 범례를 조합한다.
import GangwonMapSvg from "./GangwonMapSvg";
import RegionSelector from "./RegionSelector";
import VisitStatusLayer from "./VisitStatusLayer";

export default function MapView() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-5 py-8">
      <RegionSelector />
      <GangwonMapSvg />
      <VisitStatusLayer />
    </section>
  );
}
