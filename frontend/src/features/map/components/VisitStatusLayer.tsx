"use client";

// 방문/채움 상태 시각화·범례.
// 상태 원본은 스토어가 아니라 useRegionStatus(Query)에서 읽는다 (계획 §8).
import { useSelectedSigungu } from "../hooks/useMapStore";
import { useRegionStatus } from "../hooks/useRegionStatus";

export default function VisitStatusLayer() {
  const selected = useSelectedSigungu();
  const { data, isLoading } = useRegionStatus(selected);

  return (
    <div className="text-sm text-zinc-600 dark:text-zinc-400">
      {/* TODO: 방문 / 미방문 / 채움 범례 + data 기반 시각화 */}
      {selected === null
        ? "시·군을 선택하세요."
        : isLoading
          ? "불러오는 중…"
          : `선택: ${selected} (상태 데이터 ${data ? "있음" : "없음"})`}
    </div>
  );
}
