"use client";

// 색 추가 바텀시트 — 100색 팔레트 그리드(5열, 스크롤).
// 스와치 탭 → 선택 지역을 그 색으로 채운다. 핸들 탭 → 지역 선택 해제(안내로 복귀).
// 시군구·읍면동 두 단계에서 같은 시트를 쓴다 — 선택된 지역 코드만 다르다.
import { useSelectRegion, useSelectedRegion } from "../hooks/useMapStore";
import { useDecorateFills, useSetFill } from "../hooks/useDecorateStore";
import { PALETTE_COLORS } from "../palette";

export default function ColorPaletteSheet() {
  const selected = useSelectedRegion();
  const selectRegion = useSelectRegion();
  const setFill = useSetFill();
  const fills = useDecorateFills();

  const current = selected ? fills[selected] : undefined;
  const currentColor = current?.type === "color" ? current.value : null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex h-[44dvh] flex-col rounded-t-[14px] bg-white shadow-[0px_-4px_10px_0px_rgba(0,0,0,0.25)]">
      <button
        type="button"
        onClick={() => selectRegion(null)}
        aria-label="닫기"
        className="flex w-full shrink-0 items-center justify-center py-3"
      >
        <span className="h-1 w-9 rounded-full bg-zinc-300" />
      </button>
      <div className="grid flex-1 grid-cols-5 gap-3 overflow-y-auto px-6 pt-2 pb-8">
        {PALETTE_COLORS.map((color, i) => (
          <button
            key={`${color}-${i}`}
            type="button"
            onClick={() => selected && setFill(selected, { type: "color", value: color })}
            aria-label={`색 ${color}`}
            className={`aspect-square rounded-full transition-transform active:scale-95 ${
              currentColor === color ? "ring-2 ring-zinc-800 ring-offset-2" : ""
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
