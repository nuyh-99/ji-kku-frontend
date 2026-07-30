"use client";

// 꾸미기 스토어 selector 훅 — 필요한 조각만 구독한다.
import { useDecorateStore } from "../store/decorateStore";

export const useFabOpen = () => useDecorateStore((state) => state.fabOpen);
export const useDecorateTool = () => useDecorateStore((state) => state.tool);
export const useDecorateFills = () => useDecorateStore((state) => state.fills);

export const useToggleFab = () => useDecorateStore((state) => state.toggleFab);
export const useCloseFab = () => useDecorateStore((state) => state.closeFab);
export const useOpenTool = () => useDecorateStore((state) => state.openTool);
export const useCloseTool = () => useDecorateStore((state) => state.closeTool);
export const useSetFill = () => useDecorateStore((state) => state.setFill);
