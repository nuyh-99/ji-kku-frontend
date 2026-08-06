"use client";

// FAB(+) → 펼치면 꾸미기 메뉴. 열림/도구활성 시 ×.
// 메뉴는 지도 단계에 따라 다르다(디자인 464:1978 vs 470:3043):
//   1단계(시군구): 색 · 사진
//   2단계(읍면동): 기록 작성 · 스티커 · 색 · 사진
// 브랜드 색 #6ca59c. 아이콘은 public/icons/map/*.png.
import { useActiveSigungu, useSelectRegion } from "../hooks/useMapStore";
import {
  useCloseFab,
  useCloseTool,
  useDecorateTool,
  useFabOpen,
  useOpenTool,
  useToggleFab,
} from "../hooks/useDecorateStore";
import { PlusIcon } from "./icons";

const BRAND = "#6ca59c";

interface MenuItemProps {
  icon: string;
  label: string;
  onClick: () => void;
}

function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2.5">
      <span className="text-sm" style={{ color: BRAND }}>
        {label}
      </span>
      <span className="grid size-10 place-items-center rounded-full bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25),0px_0px_6px_0px_rgba(0,0,0,0.25)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt="" className="size-6 object-contain" />
      </span>
    </button>
  );
}

export default function DecorateFab() {
  const activeSigungu = useActiveSigungu();
  const selectRegion = useSelectRegion();
  const fabOpen = useFabOpen();
  const tool = useDecorateTool();
  const toggleFab = useToggleFab();
  const closeFab = useCloseFab();
  const openTool = useOpenTool();
  const closeTool = useCloseTool();

  const inEupmyeondong = activeSigungu !== null;
  const isClose = fabOpen || tool !== null;

  const handleFab = () => {
    if (fabOpen) {
      closeFab();
    } else if (tool !== null) {
      // 도구 모드 취소 → 기본(감상) 모드로
      closeTool();
      selectRegion(null);
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
            {inEupmyeondong && (
              <>
                {/*
                  기록 자체는 B 담당(/records) 화면이다. 지도는 "어느 읍·면·동 기록인지"만
                  고르게 하고(record 도구) 그 화면으로 넘긴다 — 폼은 갖지 않는다.
                */}
                <MenuItem
                  icon="/icons/map/edit.png"
                  label="기록 작성하기"
                  onClick={() => openTool("record")}
                />
                <MenuItem
                  icon="/icons/map/sticker.png"
                  label="스티커 추가하기"
                  onClick={() => openTool("sticker")}
                />
              </>
            )}
            <MenuItem
              icon="/icons/map/color-dropper.png"
              label="지도에 색 추가하기"
              onClick={() => openTool("color")}
            />
            <MenuItem
              icon="/icons/map/add-image.png"
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
