"use client";

// 지도 위 사진 카드 레이어 (디자인 566:2034 "등록 완료", 카드 566:2010).
//
// 기록을 "지도에 표시하기"로 등록하면 생기는 폴라로이드 카드다.
// 스티커와 같은 조작(끌어 옮기기 · 모서리로 크기조절 · × 로 삭제)을 쓰되,
// 정사각형이 아니라 세로로 긴 카드라 크기는 **폭**으로만 다룬다(높이는 비율로 따라온다).
import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import type { PlacedPhotoCard } from "@/types/map";
import { PHOTO_CARD_ASPECT, PHOTO_CARD_RATIO } from "@/types/map";
import { toSvgPoint } from "../svgPoint";

const BRAND = "#6ca59c";
/** 디자인 카드 그림자 0 0 2.554 rgba(0,0,0,0.5) — 폭 90.67 기준 비율. */
const SHADOW_BLUR_RATIO = 2.554 / 90.67 / 2;

interface PhotoCardLayerProps {
  cards: PlacedPhotoCard[];
  /** 편집 중인 카드 id. */
  selectedId: string | null;
  /** 조작 가능 여부. */
  interactive: boolean;
  /** 좌표 변환 기준 svg. */
  svgRef: RefObject<SVGSVGElement | null>;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number) => void;
  onRemove: (id: string) => void;
  onDragStateChange: (dragging: boolean) => void;
}

export default function PhotoCardLayer({
  cards,
  selectedId,
  interactive,
  svgRef,
  onSelect,
  onMove,
  onResize,
  onRemove,
  onDragStateChange,
}: PhotoCardLayerProps) {
  // 포인터와 카드 중심의 간격. 안 잡아두면 카드가 손끝으로 튄다.
  const moveOffset = useRef<{ dx: number; dy: number } | null>(null);
  const resizing = useRef<string | null>(null);

  const handleCardPointerDown = (event: ReactPointerEvent<SVGGElement>, card: PlacedPhotoCard) => {
    if (!interactive) return;
    event.stopPropagation();
    const svg = svgRef.current;
    if (!svg) return;
    const p = toSvgPoint(svg, event.clientX, event.clientY);
    if (!p) return;

    onSelect(card.id);
    moveOffset.current = { dx: p.x - card.x, dy: p.y - card.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    onDragStateChange(true);
  };

  const handleCardPointerMove = (event: ReactPointerEvent<SVGGElement>, id: string) => {
    const offset = moveOffset.current;
    if (!offset) return;
    const svg = svgRef.current;
    if (!svg) return;
    const p = toSvgPoint(svg, event.clientX, event.clientY);
    if (!p) return;
    onMove(id, p.x - offset.dx, p.y - offset.dy);
  };

  const endMove = (event: ReactPointerEvent<SVGGElement>) => {
    if (!moveOffset.current) return;
    moveOffset.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    onDragStateChange(false);
  };

  const handleResizePointerDown = (event: ReactPointerEvent<SVGGElement>, id: string) => {
    event.stopPropagation();
    resizing.current = id;
    event.currentTarget.setPointerCapture(event.pointerId);
    onDragStateChange(true);
  };

  // 핸들이 오른쪽-아래 모서리에 있으므로 중심~포인터의 가로 거리 × 2 가 곧 새 폭이다.
  // (세로는 비율로 따라오므로 가로만 보면 된다 — 대각선 거리를 쓰면 비율에 따라 튄다.)
  const handleResizePointerMove = (
    event: ReactPointerEvent<SVGGElement>,
    card: PlacedPhotoCard,
  ) => {
    if (resizing.current !== card.id) return;
    const svg = svgRef.current;
    if (!svg) return;
    const p = toSvgPoint(svg, event.clientX, event.clientY);
    if (!p) return;
    onResize(card.id, Math.abs(p.x - card.x) * 2);
  };

  const endResize = (event: ReactPointerEvent<SVGGElement>) => {
    if (!resizing.current) return;
    resizing.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    onDragStateChange(false);
  };

  return (
    <g>
      <defs>
        {/*
          카드마다 크기가 달라 번짐도 폭에 비례해야 한다 → 카드별로 정의한다.
          (지역 그림자처럼 하나를 공유하면 큰 카드에서 그림자가 상대적으로 얇아진다.)
        */}
        {cards.map((card) => (
          <filter
            key={card.id}
            id={`pc-shadow-${card.id}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx={0}
              dy={0}
              stdDeviation={card.width * SHADOW_BLUR_RATIO}
              floodColor="#000000"
              floodOpacity={0.5}
            />
          </filter>
        ))}
      </defs>

      {cards.map((card) => {
        const w = card.width;
        const h = w * PHOTO_CARD_ASPECT;
        const left = card.x - w / 2;
        const top = card.y - h / 2;
        const pad = w * PHOTO_CARD_RATIO.padding;
        const selected = interactive && card.id === selectedId;
        // 핸들은 카드가 작아져도 누를 수 있게 하한을 둔다.
        const chip = Math.max(8, w * 0.12);

        return (
          <g key={card.id}>
            <g
              className={interactive ? "cursor-move" : ""}
              style={{ pointerEvents: interactive ? "auto" : "none", touchAction: "none" }}
              onPointerDown={(event) => handleCardPointerDown(event, card)}
              onPointerMove={(event) => handleCardPointerMove(event, card.id)}
              onPointerUp={endMove}
              onPointerCancel={endMove}
            >
              <title>{card.title}</title>

              {/* 카드 바탕 */}
              <rect
                x={left}
                y={top}
                width={w}
                height={h}
                fill="#ffffff"
                filter={`url(#pc-shadow-${card.id})`}
              />

              {/* 사진 — 없으면(첨부 안 한 기록) 회색 자리로 둔다. */}
              {card.src ? (
                <image
                  href={card.src}
                  x={left + pad}
                  y={top + pad}
                  width={w * PHOTO_CARD_RATIO.imageWidth}
                  height={w * PHOTO_CARD_RATIO.imageHeight}
                  preserveAspectRatio="xMidYMid slice"
                />
              ) : (
                <rect
                  x={left + pad}
                  y={top + pad}
                  width={w * PHOTO_CARD_RATIO.imageWidth}
                  height={w * PHOTO_CARD_RATIO.imageHeight}
                  fill="#e8e8e8"
                />
              )}

              {/* 캡션(기록 제목) */}
              <text
                x={left + pad}
                y={top + w * PHOTO_CARD_RATIO.captionTop}
                dominantBaseline="hanging"
                fontSize={w * PHOTO_CARD_RATIO.captionSize}
                fill="#515151"
                className="pointer-events-none select-none"
              >
                {card.title}
              </text>
            </g>

            {selected && (
              <>
                {/* 점선 선택 박스 */}
                <rect
                  x={left}
                  y={top}
                  width={w}
                  height={h}
                  fill="none"
                  stroke="#9c9c9c"
                  strokeWidth={1.2}
                  strokeDasharray="4 3"
                  pointerEvents="none"
                />

                {/* 삭제(×) — 오른쪽 위 */}
                <g
                  role="button"
                  aria-label={`${card.title} 카드 삭제`}
                  className="cursor-pointer"
                  style={{ touchAction: "none" }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    onRemove(card.id);
                  }}
                >
                  <circle cx={left + w} cy={top} r={chip} fill="#ffffff" stroke="#d1d1d6" />
                  <path
                    d={`M${left + w - chip * 0.4} ${top - chip * 0.4}L${left + w + chip * 0.4} ${top + chip * 0.4}M${left + w + chip * 0.4} ${top - chip * 0.4}L${left + w - chip * 0.4} ${top + chip * 0.4}`}
                    stroke="#5f5f5f"
                    strokeWidth={Math.max(1, chip * 0.22)}
                    strokeLinecap="round"
                  />
                </g>

                {/* 크기조절 — 오른쪽 아래 */}
                <g
                  role="button"
                  aria-label={`${card.title} 카드 크기 조절`}
                  className="cursor-nwse-resize"
                  style={{ touchAction: "none" }}
                  onPointerDown={(event) => handleResizePointerDown(event, card.id)}
                  onPointerMove={(event) => handleResizePointerMove(event, card)}
                  onPointerUp={endResize}
                  onPointerCancel={endResize}
                >
                  <circle cx={left + w} cy={top + h} r={chip} fill="#ffffff" stroke="#d1d1d6" />
                  <path
                    d={`M${left + w - chip * 0.4} ${top + h + chip * 0.4}L${left + w + chip * 0.4} ${top + h - chip * 0.4}`}
                    stroke={BRAND}
                    strokeWidth={Math.max(1, chip * 0.22)}
                    strokeLinecap="round"
                  />
                </g>
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}
