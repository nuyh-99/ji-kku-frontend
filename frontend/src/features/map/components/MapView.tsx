"use client";

// 지도 도메인 공개 진입점 — "나만의 지도를 꾸며보세요" 화면.
// 상단바 + zoom/pan 지도 + 확대 버튼 + FAB(색/사진) + 안내/바텀시트를 조합한다.
// 흐름: FAB → 도구 선택(색/사진) → 지역 탭 선택 → 색/사진으로 채움.
import { useRef } from "react";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import ColorPaletteSheet from "./ColorPaletteSheet";
import DecorateFab from "./DecorateFab";
import DecorateHeader from "./DecorateHeader";
import MapCanvas from "./MapCanvas";
import PhotoUploadSheet from "./PhotoUploadSheet";
import RegionSelectPrompt from "./RegionSelectPrompt";
import { SearchIcon } from "./icons";
import { useSelectSigungu, useSelectedSigungu } from "../hooks/useMapStore";
import { useDecorateFills, useDecorateTool } from "../hooks/useDecorateStore";

export default function MapView() {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const selected = useSelectedSigungu();
  const selectSigungu = useSelectSigungu();
  const tool = useDecorateTool();
  const fills = useDecorateFills();

  const inToolMode = tool !== null;
  const sheetOpen = inToolMode && selected !== null;

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-white">
      <DecorateHeader />

      {/* 지도 영역 — 세로 중앙정렬(가로는 stretch 유지) */}
      <div className="relative flex flex-1 flex-col justify-center overflow-hidden">
        <MapCanvas
          transformRef={transformRef}
          regionStates={fills}
          selectedCode={selected}
          onRegionClick={inToolMode ? selectSigungu : undefined}
        />

        {/* 도구 선택 후, 지역 미선택 시 안내 */}
        {inToolMode && selected === null && <RegionSelectPrompt />}

        {/* 확대 버튼 + FAB — 바텀시트가 열리면 숨긴다 */}
        {!sheetOpen && (
          <>
            <button
              type="button"
              onClick={() => transformRef.current?.zoomIn()}
              aria-label="지도 확대"
              className="absolute right-[76px] bottom-[34px] z-20 grid size-11 place-items-center rounded-full border border-black/10 bg-white shadow"
              style={{ color: "#6ca59c" }}
            >
              <SearchIcon className="size-6" />
            </button>
            <DecorateFab />
          </>
        )}
      </div>

      {/* 바텀 시트 */}
      {sheetOpen && tool === "color" && <ColorPaletteSheet />}
      {sheetOpen && tool === "photo" && <PhotoUploadSheet />}
    </div>
  );
}
