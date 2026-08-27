"use client";

// 스티커 추가 바텀시트 — 4열 그리드(디자인 470:3965).
// 스티커 탭 → 지도 중앙에 배치되고 바로 편집(점선 박스) 상태가 된다.
// 여러 번 눌러도 정확히 겹치지 않도록 배치할 때마다 조금씩 어긋나게 놓는다.
//
// 목록은 서버 카탈로그(GET /stickers)다. 배치할 때 서버가 stickerId(숫자)를 요구해서,
// public/stickers 의 로컬 이미지는 이름을 되찾는 용도로만 남는다(stickerNameByUrl).
import { useStickerCatalog } from "../hooks/useMapDesign";
import { stickerNameByUrl } from "../stickers";

interface StickerSheetProps {
  /** 지도 좌표계 — 배치 기준점(중앙)을 여기서 구한다. */
  viewBox: string;
  /** 이미 놓인 스티커 수. 겹침 방지 오프셋 계산에 쓴다. */
  placedCount: number;
  onPick: (sticker: { stickerId: number; name: string; src: string; x: number; y: number }) => void;
  onClose: () => void;
}

/** 겹침 방지: 배치할 때마다 대각선으로 조금씩 밀되, 5개 주기로 되돌아온다. */
const CASCADE_STEP = 14;
const CASCADE_PERIOD = 5;

export default function StickerSheet({ viewBox, placedCount, onPick, onClose }: StickerSheetProps) {
  const { data: catalog, isLoading, isError } = useStickerCatalog();

  const [vbX, vbY, vbW, vbH] = viewBox.split(/\s+/).map(Number);
  const offset = (placedCount % CASCADE_PERIOD) * CASCADE_STEP;
  const centerX = vbX + vbW / 2 + offset;
  const centerY = vbY + vbH / 2 + offset;

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex h-[38dvh] flex-col rounded-t-[14px] bg-white shadow-[0px_-4px_10px_0px_rgba(0,0,0,0.25)]">
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="flex w-full shrink-0 items-center justify-center py-3"
      >
        <span className="h-1 w-9 rounded-full bg-zinc-300" />
      </button>

      {isLoading || isError || catalog.length === 0 ? (
        <p className="grid flex-1 place-items-center px-6 text-center text-sm text-zinc-500">
          {isLoading ? "스티커를 불러오는 중…" : "스티커를 불러오지 못했어요."}
        </p>
      ) : (
        <div className="grid flex-1 grid-cols-4 gap-x-6 gap-y-5 overflow-y-auto px-7 pt-2 pb-8">
          {catalog.map((sticker) => {
            const name = stickerNameByUrl(sticker.stickerUrl);
            return (
              <button
                key={sticker.stickerId}
                type="button"
                onClick={() =>
                  onPick({
                    stickerId: sticker.stickerId,
                    name,
                    src: sticker.stickerUrl,
                    x: centerX,
                    y: centerY,
                  })
                }
                aria-label={`${name} 스티커 추가`}
                className="grid aspect-square place-items-center transition-transform active:scale-95"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sticker.stickerUrl} alt="" className="size-full object-contain" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
