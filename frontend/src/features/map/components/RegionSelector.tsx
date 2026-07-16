"use client";

// 시·군 선택 UI. 스토어의 selectedSigungu와 동기화한다.
// TODO: 옵션을 실제 강원 시·군 목록으로 교체.
import { useSelectedSigungu, useSelectSigungu } from "../hooks/useMapStore";

export default function RegionSelector() {
  const selected = useSelectedSigungu();
  const selectSigungu = useSelectSigungu();

  return (
    <select
      aria-label="시·군 선택"
      className="rounded border border-black/10 px-2 py-1 text-sm dark:border-white/10"
      value={selected ?? ""}
      onChange={(event) => selectSigungu(event.target.value || null)}
    >
      <option value="">시·군 선택</option>
      {/* TODO: 강원 시·군 목록 옵션 렌더 */}
    </select>
  );
}
