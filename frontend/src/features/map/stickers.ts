// 스티커 카탈로그 — Figma 디자인(스티커 추가, node 481:4199)의 12칸.
// 이미지는 public/stickers/*.png (디자인에서 원본 그대로 내려받음).
//
// 디자인 그리드는 4열 3행 = 12칸인데 원본 이미지는 11종이다.
// "파라솔"이 2행 2열과 3행 4열에 두 번 들어가 있어서, 카탈로그도 그대로 두 번 노출한다.

/** 시트에 노출되는 스티커 한 종. */
export interface StickerAsset {
  /** 카탈로그 id. 같은 이미지가 두 칸에 나오므로 칸마다 고유하게 둔다. */
  id: string;
  /** a11y 라벨 및 배치된 스티커 이름. */
  name: string;
  src: string;
}

export const STICKERS: StickerAsset[] = [
  { id: "travel-case", name: "여행 가방", src: "/stickers/travel-case.png" },
  { id: "travel-map", name: "여행 지도", src: "/stickers/travel-map.png" },
  { id: "street-food", name: "길거리 음식", src: "/stickers/street-food.png" },
  { id: "food-bar", name: "분식", src: "/stickers/food-bar.png" },
  { id: "beach", name: "야자수 해변", src: "/stickers/beach.png" },
  { id: "beach-umbrella", name: "파라솔", src: "/stickers/beach-umbrella.png" },
  { id: "beach-chair-ball", name: "파라솔과 비치 의자", src: "/stickers/beach-chair-ball.png" },
  { id: "beach-ball", name: "비치볼", src: "/stickers/beach-ball.png" },
  { id: "vacation-chair", name: "해변 의자", src: "/stickers/vacation-chair.png" },
  { id: "beach-ball-color", name: "컬러 비치볼", src: "/stickers/beach-ball-color.png" },
  { id: "train", name: "기차", src: "/stickers/train.png" },
  // 디자인 3행 4열 — 2행 2열과 같은 파라솔 이미지가 한 번 더 놓여 있다.
  { id: "beach-umbrella-2", name: "파라솔", src: "/stickers/beach-umbrella.png" },
];

/**
 * 서버 스티커 URL에서 표시명을 되찾는다.
 * `GET /stickers` 는 id와 url만 주고 이름을 주지 않아서, 파일명이 같으면 위 카탈로그의
 * 한글 이름을 붙여 a11y 라벨로 쓴다. 못 찾으면 "스티커" 로 떨어진다(렌더에는 지장 없음).
 */
export function stickerNameByUrl(url: string): string {
  const file = url.split("/").pop()?.split("?")[0];
  if (!file) return "스티커";
  return STICKERS.find((s) => s.src.endsWith(`/${file}`))?.name ?? "스티커";
}
