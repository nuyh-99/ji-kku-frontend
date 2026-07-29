"use client";

// 지도 위 스티커 레이어 (디자인 715:3849).
//
// 지도 SVG 안에 함께 그리므로 좌표/크기가 viewBox 단위다 → 확대·이동해도 지역에 붙어 움직인다.
// 선택된 스티커에는 점선 박스 + 삭제(×) + 크기조절 핸들이 붙는다.
//
// 드래그 중에는 onDragStateChange(true) 로 부모에 알려 지도 패닝을 잠근다.
// 안 그러면 react-zoom-pan-pinch 가 같은 포인터 이벤트로 지도를 같이 끌어버린다.
import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import type { PlacedSticker } from "@/types/map";

const BRAND = "#6ca59c";

interface StickerLayerProps {
  stickers: PlacedSticker[];
  /** 편집 중인 스티커 id. */
  selectedId: string | null;
  /** 스티커 도구 모드일 때만 조작 가능. */
  interactive: boolean;
  /** 좌표 변환 기준 svg. */
  svgRef: RefObject<SVGSVGElement | null>;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, size: number) => void;
  onRemove: (id: string) => void;
  onDragStateChange: (dragging: boolean) => void;
}

/** 화면 좌표 → viewBox 좌표. 지도가 확대/이동돼 있어도 CTM이 알아서 반영한다. */
function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  return new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
}

export default function StickerLayer({
  stickers,
  selectedId,
  interactive,
  svgRef,
  onSelect,
  onMove,
  onResize,
  onRemove,
  onDragStateChange,
}: StickerLayerProps) {
  // 이동: 포인터와 스티커 중심의 간격을 잡아둬야 스티커가 손끝으로 튀지 않는다.
  const moveOffset = useRef<{ dx: number; dy: number } | null>(null);

  const handleStickerPointerDown = (
    event: ReactPointerEvent<SVGImageElement>,
    s: PlacedSticker,
  ) => {
    if (!interactive) return;
    event.stopPropagation();
    const svg = svgRef.current;
    if (!svg) return;
    const p = toSvgPoint(svg, event.clientX, event.clientY);
    if (!p) return;

    onSelect(s.id);
    moveOffset.current = { dx: p.x - s.x, dy: p.y - s.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    onDragStateChange(true);
  };

  const handleStickerPointerMove = (event: ReactPointerEvent<SVGImageElement>, id: string) => {
    const offset = moveOffset.current;
    if (!offset) return;
    const svg = svgRef.current;
    if (!svg) return;
    const p = toSvgPoint(svg, event.clientX, event.clientY);
    if (!p) return;
    onMove(id, p.x - offset.dx, p.y - offset.dy);
  };

  const endMove = (event: ReactPointerEvent<SVGImageElement>) => {
    if (!moveOffset.current) return;
    moveOffset.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    onDragStateChange(false);
  };

  // 크기조절: 핸들이 정사각형의 오른쪽-아래 꼭짓점에 있으므로
  // 중심~포인터 거리 d 와 한 변 size 의 관계는 d = (size/2)·√2 → size = d·√2.
  const resizing = useRef<string | null>(null);

  const handleResizePointerDown = (event: ReactPointerEvent<SVGGElement>, id: string) => {
    event.stopPropagation();
    resizing.current = id;
    event.currentTarget.setPointerCapture(event.pointerId);
    onDragStateChange(true);
  };

  const handleResizePointerMove = (event: ReactPointerEvent<SVGGElement>, s: PlacedSticker) => {
    if (resizing.current !== s.id) return;
    const svg = svgRef.current;
    if (!svg) return;
    const p = toSvgPoint(svg, event.clientX, event.clientY);
    if (!p) return;
    const d = Math.hypot(p.x - s.x, p.y - s.y);
    onResize(s.id, d * Math.SQRT2);
  };

  const endResize = (event: ReactPointerEvent<SVGGElement>) => {
    if (!resizing.current) return;
    resizing.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    onDragStateChange(false);
  };

  return (
    <g>
      {stickers.map((s) => {
        const half = s.size / 2;
        const selected = interactive && s.id === selectedId;
        // 핸들 크기는 스티커가 작아져도 누를 수 있게 하한을 둔다.
        const chip = Math.max(8, s.size * 0.16);

        return (
          <g key={s.id}>
            <image
              href={s.src}
              x={s.x - half}
              y={s.y - half}
              width={s.size}
              height={s.size}
              preserveAspectRatio="xMidYMid meet"
              className={interactive ? "cursor-move" : ""}
              style={{ pointerEvents: interactive ? "auto" : "none", touchAction: "none" }}
              onPointerDown={(event) => handleStickerPointerDown(event, s)}
              onPointerMove={(event) => handleStickerPointerMove(event, s.id)}
              onPointerUp={endMove}
              onPointerCancel={endMove}
            >
              <title>{s.name}</title>
            </image>

            {selected && (
              <>
                {/* 점선 선택 박스 */}
                <rect
                  x={s.x - half}
                  y={s.y - half}
                  width={s.size}
                  height={s.size}
                  fill="none"
                  stroke="#9c9c9c"
                  strokeWidth={1.2}
                  strokeDasharray="4 3"
                  pointerEvents="none"
                />

                {/* 삭제(×) — 오른쪽 위 */}
                <g
                  role="button"
                  aria-label={`${s.name} 스티커 삭제`}
                  className="cursor-pointer"
                  style={{ touchAction: "none" }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    onRemove(s.id);
                  }}
                >
                  <circle
                    cx={s.x + half}
                    cy={s.y - half}
                    r={chip}
                    fill="#ffffff"
                    stroke="#d1d1d6"
                  />
                  <path
                    d={`M${s.x + half - chip * 0.4} ${s.y - half - chip * 0.4}L${s.x + half + chip * 0.4} ${s.y - half + chip * 0.4}M${s.x + half + chip * 0.4} ${s.y - half - chip * 0.4}L${s.x + half - chip * 0.4} ${s.y - half + chip * 0.4}`}
                    stroke="#5f5f5f"
                    strokeWidth={Math.max(1, chip * 0.22)}
                    strokeLinecap="round"
                  />
                </g>

                {/* 크기조절 — 오른쪽 아래 */}
                <g
                  role="button"
                  aria-label={`${s.name} 스티커 크기 조절`}
                  className="cursor-nwse-resize"
                  style={{ touchAction: "none" }}
                  onPointerDown={(event) => handleResizePointerDown(event, s.id)}
                  onPointerMove={(event) => handleResizePointerMove(event, s)}
                  onPointerUp={endResize}
                  onPointerCancel={endResize}
                >
                  <circle
                    cx={s.x + half}
                    cy={s.y + half}
                    r={chip}
                    fill="#ffffff"
                    stroke="#d1d1d6"
                  />
                  <path
                    d={`M${s.x + half - chip * 0.4} ${s.y + half + chip * 0.4}L${s.x + half + chip * 0.4} ${s.y + half - chip * 0.4}`}
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
