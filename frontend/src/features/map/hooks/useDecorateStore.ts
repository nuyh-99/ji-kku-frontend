"use client";

// 꾸미기 스토어 selector 훅 — 필요한 조각만 구독한다.
import type { PlacedSticker } from "@/types/map";
import { useDecorateStore } from "../store/decorateStore";

const EMPTY_STICKERS: PlacedSticker[] = [];

export const useFabOpen = () => useDecorateStore((state) => state.fabOpen);
export const useDecorateTool = () => useDecorateStore((state) => state.tool);
export const useDecorateFills = () => useDecorateStore((state) => state.fills);

export const useToggleFab = () => useDecorateStore((state) => state.toggleFab);
export const useCloseFab = () => useDecorateStore((state) => state.closeFab);
export const useOpenTool = () => useDecorateStore((state) => state.openTool);
export const useCloseTool = () => useDecorateStore((state) => state.closeTool);
export const useSetFill = () => useDecorateStore((state) => state.setFill);

/**
 * 해당 시군구에 놓인 스티커 목록.
 * 없을 때 매번 `[]` 리터럴을 만들면 참조가 달라져 무한 리렌더가 나므로 상수를 돌려준다.
 */
export const useStickers = (sigunguCd: string | null) =>
  useDecorateStore((state) =>
    sigunguCd ? (state.stickersBySigungu[sigunguCd] ?? EMPTY_STICKERS) : EMPTY_STICKERS,
  );

export const useSelectedStickerId = () => useDecorateStore((state) => state.selectedStickerId);

export const useAddSticker = () => useDecorateStore((state) => state.addSticker);
export const useMoveSticker = () => useDecorateStore((state) => state.moveSticker);
export const useResizeSticker = () => useDecorateStore((state) => state.resizeSticker);
export const useRemoveSticker = () => useDecorateStore((state) => state.removeSticker);
export const useSelectSticker = () => useDecorateStore((state) => state.selectSticker);
