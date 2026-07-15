"use client";

// 강원도 SVG 지도.
// TODO: 경계 데이터(src/data/regions)로 각 지역 path를 렌더하고 상태별로 색칠한다.
//       각 지역 path의 onClick에서 selectSigungu(code)를 호출한다.
import { useSelectSigungu } from "../hooks/useMapStore";

export default function GangwonMapSvg() {
  const selectSigungu = useSelectSigungu();

  return (
    <div className="relative aspect-square w-full rounded-lg border border-black/10 dark:border-white/10">
      {/* TODO: <svg> 강원 시·군 path 렌더 → 각 path onClick={() => selectSigungu(code)} */}
      <button
        type="button"
        onClick={() => selectSigungu(null)}
        className="absolute inset-0 grid place-items-center text-sm text-zinc-500"
      >
        지도 SVG 자리 (구현 예정)
      </button>
    </div>
  );
}
