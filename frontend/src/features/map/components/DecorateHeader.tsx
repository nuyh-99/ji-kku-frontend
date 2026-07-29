"use client";

// 상단바: 뒤로 · 제목 · 메뉴. (디자인: "나만의 지도를 꾸며보세요")
// 뒤로가기는 지도 단계에 따라 갈린다 — 2단계(읍면동)면 시군구 지도로 올라가고,
// 1단계면 이전 페이지로 나간다.
import { useRouter } from "next/navigation";
import { useActiveSigungu, useLeaveSigungu } from "../hooks/useMapStore";
import { useCloseTool } from "../hooks/useDecorateStore";
import { ChevronLeftIcon, MenuIcon } from "./icons";

export default function DecorateHeader() {
  const router = useRouter();
  const activeSigungu = useActiveSigungu();
  const leaveSigungu = useLeaveSigungu();
  const closeTool = useCloseTool();

  const handleBack = () => {
    if (activeSigungu) {
      closeTool();
      leaveSigungu();
      return;
    }
    router.back();
  };

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-center border-b border-black/5 px-2">
      <button
        type="button"
        onClick={handleBack}
        aria-label={activeSigungu ? "시군구 지도로" : "뒤로"}
        className="absolute left-2 grid size-10 place-items-center rounded-full text-zinc-800 hover:bg-black/5"
      >
        <ChevronLeftIcon className="size-6" />
      </button>

      <h1 className="text-base font-medium text-zinc-900">나만의 지도를 꾸며보세요</h1>

      {/* 메뉴 내용이 디자인에 없어 아직 열지 않는다. */}
      <button
        type="button"
        aria-label="메뉴"
        className="absolute right-2 grid size-10 place-items-center rounded-full text-zinc-800 hover:bg-black/5"
      >
        <MenuIcon className="size-6" />
      </button>
    </header>
  );
}
