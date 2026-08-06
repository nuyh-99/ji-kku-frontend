"use client";

// 지도 도메인 공개 진입점 — "나만의 지도를 꾸며보세요" 화면.
//
// 지도는 2단계다.
//   1단계 시군구 지도  (디자인 224:1484, 464:1978)
//   2단계 읍면동 지도  (디자인 454:1263, 470:3043, 470:3629, 470:3847, 470:3965, 715:3849)
//
// 지역 탭의 의미는 모드로 가른다. 디자인에 "2단계로 들어가는" 트리거가 따로 없어서,
// 이미 "꾸밀 지역 선택"으로 쓰이는 탭과 충돌하지 않게 이렇게 정했다.
//   - 감상 모드(도구 미선택) + 1단계 : 시군구 탭 = 읍면동 지도로 진입
//   - 도구 모드(색/사진)              : 지역 탭 = 꾸밀 대상 선택
//   - 스티커 모드                     : 지역을 고르지 않는다(스티커는 좌표 기반)
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { GANGWON_REGIONS, GANGWON_VIEW_BOX } from "@/data/regions/gangwon";
import { getEupmyeondongMap, hasEupmyeondongMap } from "@/data/regions/eupmyeondong";
import { takeMapDisplayHandoff } from "@/lib/mapDisplayHandoff";
import ColorPaletteSheet from "./ColorPaletteSheet";
import PhotoCardLayer from "./PhotoCardLayer";
import DecorateFab from "./DecorateFab";
import DecorateHeader from "./DecorateHeader";
import MapCanvas from "./MapCanvas";
import PhotoUploadSheet from "./PhotoUploadSheet";
import RegionSelectPrompt from "./RegionSelectPrompt";
import StickerLayer from "./StickerLayer";
import StickerSheet from "./StickerSheet";
import { SearchIcon } from "./icons";
import {
  useActiveSigungu,
  useEnterSigungu,
  useSelectRegion,
  useSelectedRegion,
} from "../hooks/useMapStore";
import {
  useAddPhotoCard,
  useAddSticker,
  useCloseTool,
  useDecorateFills,
  useDecorateTool,
  useFabOpen,
  useMovePhotoCard,
  useMoveSticker,
  usePhotoCards,
  useRemovePhotoCard,
  useRemoveSticker,
  useResizePhotoCard,
  useResizeSticker,
  useSelectPhotoCard,
  useSelectSticker,
  useSelectedPhotoCardId,
  useSelectedStickerId,
  useStickers,
} from "../hooks/useDecorateStore";

export default function MapView() {
  const router = useRouter();
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // 스티커를 끄는 동안에는 지도 패닝을 잠근다(같은 포인터로 둘 다 움직이는 걸 막는다).
  const [stickerDragging, setStickerDragging] = useState(false);

  const activeSigungu = useActiveSigungu();
  const selectedRegion = useSelectedRegion();
  const selectRegion = useSelectRegion();
  const enterSigungu = useEnterSigungu();

  const tool = useDecorateTool();
  const fabOpen = useFabOpen();
  const fills = useDecorateFills();
  const closeTool = useCloseTool();

  const stickers = useStickers(activeSigungu);
  const selectedStickerId = useSelectedStickerId();
  const addSticker = useAddSticker();
  const moveSticker = useMoveSticker();
  const resizeSticker = useResizeSticker();
  const removeSticker = useRemoveSticker();
  const selectSticker = useSelectSticker();

  const photoCards = usePhotoCards(activeSigungu);
  const selectedPhotoCardId = useSelectedPhotoCardId();
  const addPhotoCard = useAddPhotoCard();
  const movePhotoCard = useMovePhotoCard();
  const resizePhotoCard = useResizePhotoCard();
  const removePhotoCard = useRemovePhotoCard();
  const selectPhotoCard = useSelectPhotoCard();

  // 기록 작성에서 "지도에 표시하기"로 넘어온 건이 있으면 그 지역으로 들어가 카드를 놓는다.
  // takeMapDisplayHandoff 는 꺼내면서 지우므로 지도를 다시 열어도 또 생기지 않는다.
  useEffect(() => {
    const handoff = takeMapDisplayHandoff();
    if (!handoff) return;
    const map = getEupmyeondongMap(handoff.sigunguCd);
    if (!map) return;

    enterSigungu(handoff.sigunguCd);

    // 카드는 그 읍·면·동 라벨 자리에 놓는다. 라벨이 없는 작은 동은 지도 한가운데.
    const region = map.regions.find((r) => r.code === handoff.eupmyeondongCd);
    const [vbX, vbY, vbW, vbH] = map.viewBox.split(/\s+/).map(Number);
    addPhotoCard(handoff.sigunguCd, {
      recordId: handoff.recordId,
      src: handoff.src,
      title: handoff.title,
      x: region?.labelX ?? vbX + vbW / 2,
      y: region?.labelY ?? vbY + vbH / 2,
    });
  }, [enterSigungu, addPhotoCard]);

  const eupmyeondong = getEupmyeondongMap(activeSigungu);
  const inEupmyeondong = eupmyeondong !== null;

  const regions = eupmyeondong ? eupmyeondong.regions : GANGWON_REGIONS;
  const viewBox = eupmyeondong ? eupmyeondong.viewBox : GANGWON_VIEW_BOX;
  const labelSize = eupmyeondong?.labelSize;

  // 지역을 골라 바텀시트를 여는 도구.
  const pickingRegion = tool === "color" || tool === "photo";
  // 기록 작성은 지역만 고르고 화면 밖으로 나간다 — 시트가 없다.
  const pickingForRecord = tool === "record" && inEupmyeondong;
  const inStickerMode = tool === "sticker" && inEupmyeondong;

  // 스티커는 배치하는 순간 시트가 내려가고 도구도 풀린다(decorateStore.addSticker).
  // 그래도 방금 놓은 스티커는 계속 만질 수 있어야 하므로, 선택된 스티커가 있으면 조작을 열어둔다.
  // 지도 빈 곳을 누르면 선택이 풀리면서 편집도 끝난다.
  const stickersEditable = inEupmyeondong && (inStickerMode || selectedStickerId !== null);

  // 사진 카드는 꾸미기 도구를 켜지 않은 동안(감상 모드) 만질 수 있다.
  // 등록 직후가 바로 그 상태라, 방금 올린 카드를 곧장 옮길 수 있다.
  const photoCardsEditable = inEupmyeondong && (tool === null || selectedPhotoCardId !== null);

  const regionSheetOpen = pickingRegion && selectedRegion !== null;
  const sheetOpen = regionSheetOpen || inStickerMode;

  // 지역 탭이 실제로 하는 일이 있을 때만 인터랙티브로 노출한다.
  const regionInteractive = pickingRegion || pickingForRecord || (tool === null && !inEupmyeondong);

  const handleRegionClick = (code: string) => {
    if (pickingForRecord) {
      // 기록 화면은 B 담당(/records)이다. 어느 지역인지만 쿼리로 넘긴다.
      closeTool();
      router.push(`/records/new?sigunguCd=${activeSigungu}&eupmyeondongCd=${code}`);
      return;
    }
    if (pickingRegion) {
      selectRegion(code);
      return;
    }
    // 감상 모드 + 1단계: 읍면동 경계가 있는 시군구만 들어갈 수 있다.
    if (tool === null && !inEupmyeondong && hasEupmyeondongMap(code)) {
      enterSigungu(code);
    }
  };

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-white">
      <DecorateHeader />

      {/* 지도 영역 — 세로 중앙정렬(가로는 stretch 유지) */}
      <div className="relative flex flex-1 flex-col justify-center overflow-hidden">
        {/* FAB 메뉴가 열리면 지도를 흐린다 (디자인 464:1978, 470:3043) */}
        <div
          className={`transition-[filter] duration-200 ${fabOpen ? "blur-[5px]" : ""}`}
          onPointerDown={() => {
            selectSticker(null);
            selectPhotoCard(null);
          }}
        >
          <MapCanvas
            // 단계가 바뀌면 좌표계가 통째로 달라진다 — 리마운트해 확대/이동을 초기화한다.
            key={activeSigungu ?? "gangwon"}
            regions={regions}
            viewBox={viewBox}
            labelSize={labelSize}
            transformRef={transformRef}
            svgRef={svgRef}
            regionStates={fills}
            selectedCode={selectedRegion}
            onRegionClick={regionInteractive ? handleRegionClick : undefined}
            panningDisabled={stickerDragging}
            ariaLabel={inEupmyeondong ? "읍면동 지도" : "강원특별자치도 지도"}
            overlay={
              inEupmyeondong ? (
                <>
                  {/* 사진 카드가 먼저 — 스티커가 카드 위에 오도록(문서 순서 = 그리는 순서) */}
                  <PhotoCardLayer
                    cards={photoCards}
                    selectedId={selectedPhotoCardId}
                    interactive={photoCardsEditable}
                    svgRef={svgRef}
                    onSelect={selectPhotoCard}
                    onMove={(id, x, y) => activeSigungu && movePhotoCard(activeSigungu, id, x, y)}
                    onResize={(id, width) =>
                      activeSigungu && resizePhotoCard(activeSigungu, id, width)
                    }
                    onRemove={(id) => activeSigungu && removePhotoCard(activeSigungu, id)}
                    onDragStateChange={setStickerDragging}
                  />
                  <StickerLayer
                    stickers={stickers}
                    selectedId={selectedStickerId}
                    interactive={stickersEditable}
                    svgRef={svgRef}
                    onSelect={selectSticker}
                    onMove={(id, x, y) => activeSigungu && moveSticker(activeSigungu, id, x, y)}
                    onResize={(id, size) => activeSigungu && resizeSticker(activeSigungu, id, size)}
                    onRemove={(id) => activeSigungu && removeSticker(activeSigungu, id)}
                    onDragStateChange={setStickerDragging}
                  />
                </>
              ) : undefined
            }
          />
        </div>

        {/* 도구를 켰는데 아직 지역을 안 골랐을 때 안내 */}
        {pickingRegion && selectedRegion === null && <RegionSelectPrompt />}
        {pickingForRecord && <RegionSelectPrompt label="기록을 남길 지역을 선택하세요" />}

        {/* 좌측 보조 버튼 + FAB — 바텀시트가 열리면 숨긴다 */}
        {!sheetOpen && (
          <>
            {inEupmyeondong ? (
              <button
                type="button"
                onClick={() => router.push(`/map/${activeSigungu}/posts`)}
                aria-label="이 지역의 기록 목록"
                className="absolute right-[76px] bottom-[34px] z-20 grid size-11 place-items-center rounded-full border border-black/10 bg-white shadow"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/map/list.png" alt="" className="size-6 object-contain" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => transformRef.current?.zoomIn()}
                aria-label="지도 확대"
                className="absolute right-[76px] bottom-[34px] z-20 grid size-11 place-items-center rounded-full border border-black/10 bg-white shadow"
                style={{ color: "#6ca59c" }}
              >
                <SearchIcon className="size-6" />
              </button>
            )}
            <DecorateFab />
          </>
        )}
      </div>

      {/* 바텀 시트 */}
      {regionSheetOpen && tool === "color" && <ColorPaletteSheet />}
      {regionSheetOpen && tool === "photo" && <PhotoUploadSheet />}
      {inStickerMode && (
        <StickerSheet
          viewBox={viewBox}
          placedCount={stickers.length}
          onPick={(sticker) => activeSigungu && addSticker(activeSigungu, sticker)}
          onClose={closeTool}
        />
      )}
    </div>
  );
}
