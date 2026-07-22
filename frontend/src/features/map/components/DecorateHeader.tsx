"use client";

// 상단바: 뒤로 · 제목 · 메뉴. (디자인: "나만의 지도를 꾸며보세요")
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, MenuIcon } from "./icons";

export default function DecorateHeader() {
  const router = useRouter();

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-center border-b border-black/5 px-2">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="뒤로"
        className="absolute left-2 grid size-10 place-items-center rounded-full text-zinc-800 hover:bg-black/5"
      >
        <ChevronLeftIcon className="size-6" />
      </button>

      <h1 className="text-base font-medium text-zinc-900">나만의 지도를 꾸며보세요</h1>

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
