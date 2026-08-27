"use client";

// 꾸미기 스토어 selector 훅 — 필요한 조각만 구독한다.
// 여기 있는 건 전부 UI 상태다. 채움/스티커/사진 카드(서버 상태)는 useMapDesign 에서 읽는다.
import { useDecorateStore } from "../store/decorateStore";

export const useFabOpen = () => useDecorateStore((state) => state.fabOpen);
export const useDecorateTool = () => useDecorateStore((state) => state.tool);

export const useToggleFab = () => useDecorateStore((state) => state.toggleFab);
export const useCloseFab = () => useDecorateStore((state) => state.closeFab);
export const useOpenTool = () => useDecorateStore((state) => state.openTool);
export const useCloseTool = () => useDecorateStore((state) => state.closeTool);

export const useSelectedStickerId = () => useDecorateStore((state) => state.selectedStickerId);
export const useSelectSticker = () => useDecorateStore((state) => state.selectSticker);

export const useSelectedPhotoCardId = () => useDecorateStore((state) => state.selectedPhotoCardId);
export const useSelectPhotoCard = () => useDecorateStore((state) => state.selectPhotoCard);
