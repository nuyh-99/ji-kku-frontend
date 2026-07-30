"use client";

// FAB(+) → 펼치면 "색 추가 / 사진 추가" 메뉴. 열림/도구활성 시 ×.
// 브랜드 색 #6ca59c. 아이콘은 public/icons/map/*.png.
import { useSelectSigungu } from "../hooks/useMapStore";
import {
  useCloseTool,
  useDecorateTool,
  useFabOpen,
  useOpenTool,
  useToggleFab,
  useCloseFab,
} from "../hooks/useDecorateStore";
import { PlusIcon } from "./icons";

const BRAND = "#6ca59c";

interface MenuItemProps {
  icon: string;
  alt: string;
  label: string;
  onClick: () => void;
}

function MenuItem({ icon, alt, label, onClick }: MenuItemProps) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5">
      <span className="text-sm" style={{ color: BRAND }}>
        {label}
      </span>
      <span className="grid size-10 place-items-center rounded-full bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25),0px_0px_6px_0px_rgba(0,0,0,0.25)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt={alt} className="size-6 object-contain" />
      </span>
    </button>
  );
}

export default function DecorateFab() {
  const fabOpen = useFabOpen();
  const tool = useDecorateTool();
  const toggleFab = useToggleFab();
  const closeFab = useCloseFab();
  const openTool = useOpenTool();
  const closeTool = useCloseTool();
  const selectSigungu = useSelectSigungu();

  const isClose = fabOpen || tool !== null;

  const handleFab = () => {
    if (fabOpen) {
      closeFab();
    } else if (tool !== null) {
      // 도구 모드 취소 → 기본 모드로
      closeTool();
      selectSigungu(null);
    } else {
      toggleFab();
    }
  };

  return (
    <>
      {fabOpen && (
        <button
          type="button"
          aria-label="메뉴 닫기"
          onClick={closeFab}
          className="absolute inset-0 z-10 cursor-default bg-black/10"
        />
      )}

      <div className="absolute right-5 bottom-[30px] z-20 flex flex-col items-end gap-3">
        {fabOpen && (
          <>
            <MenuItem
              icon="/icons/map/color-dropper.png"
              alt="색"
              label="지도에 색 추가하기"
              onClick={() => openTool("color")}
            />
            <MenuItem
              icon="/icons/map/add-image.png"
              alt="사진"
              label="지도에 사진 추가하기"
              onClick={() => openTool("photo")}
            />
          </>
        )}

        <button
          type="button"
          onClick={handleFab}
          aria-label={isClose ? "닫기" : "꾸미기 메뉴 열기"}
          className="grid size-11 place-items-center rounded-full text-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25),0px_0px_10px_0px_rgba(0,0,0,0.25)] transition-transform"
          style={{ backgroundColor: BRAND }}
        >
          <PlusIcon className={`size-6 transition-transform ${isClose ? "-rotate-45" : ""}`} />
        </button>
      </div>
    </>
  );
}
