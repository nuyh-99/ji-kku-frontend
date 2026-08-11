// SVG path(d)의 절대좌표를 파싱해 지정한 지역들의 bounding box를 구하고,
// GangwonMapSvg의 viewBox prop 형식("x y width height")으로 변환한다.
//
// 전제: gangwon-regions.ts의 d 값은 전부 절대좌표 명령(대문자)만 사용한다.
// 지원 명령: M, L, C, V, H, Z. 상대좌표 명령(소문자)이나 S/Q/A 등은 다루지 않는다
// — 필요해지면 확장.
import type { RegionShape } from "@/types/map";

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// 명령별 파라미터 개수. C는 (x1 y1 x2 y2 x y) 6개지만, 결과적으로 훑는
// 좌표점(제어점 포함)은 3쌍(=6개 숫자)이라 아래 로직에서 2개씩 묶어 처리한다.
// V/H만 예외적으로 숫자 1개(좌표 1개 축)를 받는다.
const SINGLE_VALUE_COMMANDS = new Set(["V", "H"]);

/**
 * 절대좌표 path(d)에서 모든 (x, y) 좌표점을 추출한다.
 * V(수직선)는 y만, H(수평선)는 x만 바뀌므로 현재 위치를 추적하며 채운다.
 */
function extractPointsFromPath(d: string): Array<[number, number]> {
  const tokens = d.match(/[MLCVHZ]|-?\d*\.?\d+/g);
  if (!tokens) return [];

  const points: Array<[number, number]> = [];
  let currentX = 0;
  let currentY = 0;
  let i = 0;

  while (i < tokens.length) {
    const command = tokens[i];
    i += 1;

    if (command === "Z") continue;

    if (SINGLE_VALUE_COMMANDS.has(command)) {
      const value = Number(tokens[i]);
      i += 1;
      if (command === "V") currentY = value;
      else currentX = value;
      points.push([currentX, currentY]);
      continue;
    }

    // M / L / C: (x y) 쌍 단위. C는 제어점 2개 + 끝점 1개 = 3쌍.
    const pairCount = command === "C" ? 3 : 1;
    for (let p = 0; p < pairCount; p += 1) {
      currentX = Number(tokens[i]);
      currentY = Number(tokens[i + 1]);
      i += 2;
      points.push([currentX, currentY]);
    }
  }

  return points;
}

function getPathBoundingBox(d: string): BoundingBox | null {
  const points = extractPointsFromPath(d);
  if (points.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of points) {
    if (Number.isNaN(x) || Number.isNaN(y)) continue;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  if (!isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

/**
 * 주어진 code들에 해당하는 지역들을 모두 포함하는 최소 bounding box를 구해
 * GangwonMapSvg에 바로 넘길 수 있는 viewBox 문자열로 반환한다.
 *
 * @param regions 전체 지역 목록 (예: GANGWON_REGIONS)
 * @param codes   확대해서 보여줄 지역 code 목록 (예: 백엔드가 내려준 이벤트 지역)
 * @param padding bounding box 주변 여백(합성 좌표 단위). 기본값 12.
 * @returns "x y width height" 형태의 viewBox 문자열. codes가 비어있거나
 *          매칭되는 지역이 없으면 null을 반환한다 — 호출부에서 전체 지도
 *          기본 viewBox로 폴백해야 한다.
 */
export function getRegionsBoundingBox(
  regions: RegionShape[],
  codes: string[],
  padding = 12
): string | null {
  if (codes.length === 0) return null;

  const codeSet = new Set(codes);
  const targetRegions = regions.filter((r) => codeSet.has(r.code));
  if (targetRegions.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const region of targetRegions) {
    const box = getPathBoundingBox(region.d);
    if (!box) continue;
    minX = Math.min(minX, box.minX);
    minY = Math.min(minY, box.minY);
    maxX = Math.max(maxX, box.maxX);
    maxY = Math.max(maxY, box.maxY);
  }

  if (!isFinite(minX)) return null;

  const x = minX - padding;
  const y = minY - padding;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  return `${x} ${y} ${width} ${height}`;
}