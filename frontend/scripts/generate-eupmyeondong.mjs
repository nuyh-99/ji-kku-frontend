// 행정동 경계 GeoJSON → 읍·면·동 지도 렌더 데이터(TS) 생성기.
//
//   node scripts/generate-eupmyeondong.mjs [--input <geojson>] [--tolerance 0.8]
//
// 원본은 통계청 SGIS 행정동 경계(공공누리 1유형)를 vuski/admdongkor 가 가공한 것으로,
// 없으면 .cache/ 에 내려받는다(33MB, git 추적 제외). 결과만 커밋한다.
//
// 파이프라인: 강원 필터 → 시군구별 그룹 → 메르카토르 투영 → 캔버스 fit
//             → Douglas-Peucker 단순화 → 작은 섬 제거 → SVG path → 라벨 위치
//
// 의존성 없음(협업 규칙상 lock 충돌을 만들지 않기 위해 devDependency 를 늘리지 않는다).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE_URL =
  "https://raw.githubusercontent.com/vuski/admdongkor/master/ver20260701/HangJeongDong_ver20260701.geojson";
const SOURCE_VERSION = "ver20260701"; // 원본 기준일 — 생성 파일 주석에 남긴다.
const CACHE_PATH = resolve(ROOT, ".cache/HangJeongDong.geojson");
const OUT_DIR = resolve(ROOT, "src/data/regions/eupmyeondong");

/** 강원특별자치도 시도코드. */
const GANGWON_SIDO = "51";

/**
 * 출력 캔버스 폭. 모든 시군구가 같은 폭을 쓰므로 좌표 스케일이 일정하고
 * (렌더러가 `w-full` 로 폭에 맞춰 그린다) 라벨 크기를 지도끼리 비교할 수 있다.
 */
const CANVAS_W = 682;
/**
 * 캔버스 높이는 지역 모양을 따라간다 — 고정하면 홍천(가로로 김)·인제(세로로 김)처럼
 * 비율이 다른 지역이 여백 속에 작게 그려진다.
 * 다만 세로로 긴 지역까지 그대로 두면 화면 밖으로 넘치므로 상한을 둔다
 * (작은 폰 375×667 기준: 폭 375 × 1.3 ≈ 488px, 헤더 뺀 높이 611px 안에 들어온다).
 */
const MAX_ASPECT = 1.3;
/** 그림자·굵은 선택 테두리가 잘리지 않도록 두는 여백(캔버스 단위). */
const PADDING = 12;

/** 좌표 소수점 자리수. 0.1 단위 ≈ 실제 렌더에서 0.06px — 눈에 보이지 않는다. */
const PRECISION = 1;

/**
 * 시군구코드 → 생성 파일명. 기존 `yangyang.ts` 규칙(로마자)을 그대로 이어간다.
 * gangwon.ts 의 18개 코드와 1:1 이며, 스크립트가 실제 데이터와 대조해 검증한다.
 */
const FILE_NAMES = {
  51110: "chuncheon",
  51130: "wonju",
  51150: "gangneung",
  51170: "donghae",
  51190: "taebaek",
  51210: "sokcho",
  51230: "samcheok",
  51720: "hongcheon",
  51730: "hoengseong",
  51750: "yeongwol",
  51760: "pyeongchang",
  51770: "jeongseon",
  51780: "cheorwon",
  51790: "hwacheon",
  51800: "yanggu",
  51810: "inje",
  51820: "goseong",
  51830: "yangyang",
};

// ── 인자 ──────────────────────────────────────────────────────────────────────

/**
 * 단순화 강도(캔버스 단위).
 * 0.8 은 캔버스 폭의 0.12% — 폰 화면(430px)에서 0.5px, 최대 확대(6배)에서도 3px 수준이라
 * 눈에 띄지 않으면서 데이터는 절반 가까이 줄어든다(gzip 77KB → 59KB).
 */
const DEFAULT_TOLERANCE = 0.8;

function parseArgs(argv) {
  const args = { input: null, tolerance: DEFAULT_TOLERANCE };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--input") args.input = argv[++i];
    else if (argv[i] === "--tolerance") args.tolerance = Number(argv[++i]);
  }
  return args;
}

// ── 원본 확보 ─────────────────────────────────────────────────────────────────

async function loadSource(inputPath) {
  const path = inputPath ?? CACHE_PATH;
  if (!existsSync(path)) {
    if (inputPath) throw new Error(`입력 파일을 찾을 수 없습니다: ${inputPath}`);
    console.log(`원본이 없어 내려받습니다 (약 33MB)\n  ${SOURCE_URL}`);
    await mkdir(dirname(CACHE_PATH), { recursive: true });
    const res = await fetch(SOURCE_URL);
    if (!res.ok) throw new Error(`다운로드 실패: ${res.status} ${res.statusText}`);
    await writeFile(CACHE_PATH, Buffer.from(await res.arrayBuffer()));
    console.log(`저장: ${CACHE_PATH}`);
  }
  return JSON.parse(await readFile(path, "utf8"));
}

// ── 지오메트리 유틸 ───────────────────────────────────────────────────────────

const toRadians = (deg) => (deg * Math.PI) / 180;

/** 웹 메르카토르. 시군구 하나 정도의 좁은 범위라 왜곡은 무시할 수준이다. */
const projectLon = (lon) => toRadians(lon);
const projectLat = (lat) => Math.log(Math.tan(Math.PI / 4 + toRadians(lat) / 2));

/** 링의 부호 없는 면적(신발끈 공식). 작은 섬을 걸러낼 때 쓴다. */
function ringArea(ring) {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    sum += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  }
  return Math.abs(sum) / 2;
}

/** 점 p 와 선분 ab 사이 거리의 제곱. */
function pointToSegmentSq(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return (px - cx) ** 2 + (py - cy) ** 2;
}

/**
 * Douglas-Peucker 단순화.
 *
 * ⚠️ 링마다 독립적으로 돌기 때문에 인접 지역이 공유하는 경계가 미세하게 어긋날 수 있다.
 *    tolerance 를 캔버스 폭의 0.1% 이하로 두면 실제 렌더에서 0.3px 미만이라
 *    경계선(stroke 0.7)에 덮여 보이지 않는다. 그래서 위상 보존 단순화(topojson)를
 *    도입하지 않고 의존성 없이 간다.
 */
function simplifyRing(ring, tolerance) {
  if (ring.length <= 4) return ring;
  const toleranceSq = tolerance * tolerance;
  const keep = new Uint8Array(ring.length);
  keep[0] = 1;
  keep[ring.length - 1] = 1;

  const stack = [[0, ring.length - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop();
    let maxDistSq = 0;
    let index = -1;
    for (let i = first + 1; i < last; i += 1) {
      const distSq = pointToSegmentSq(
        ring[i][0],
        ring[i][1],
        ring[first][0],
        ring[first][1],
        ring[last][0],
        ring[last][1],
      );
      if (distSq > maxDistSq) {
        maxDistSq = distSq;
        index = i;
      }
    }
    if (index !== -1 && maxDistSq > toleranceSq) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  const out = ring.filter((_, i) => keep[i] === 1);
  // 폴리곤이 무너지지 않게 최소 3점(+닫는 점)은 남긴다.
  return out.length >= 4 ? out : ring;
}

/** 짝수-홀수 규칙 내부 판정. */
function isInside(x, y, rings) {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

/** 점에서 가장 가까운 경계까지의 거리. */
function distanceToEdges(x, y, rings) {
  let minSq = Infinity;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
      const distSq = pointToSegmentSq(x, y, ring[j][0], ring[j][1], ring[i][0], ring[i][1]);
      if (distSq < minSq) minSq = distSq;
    }
  }
  return Math.sqrt(minSq);
}

/**
 * 라벨 위치 = 내접원 중심(pole of inaccessibility).
 * 무게중심은 초승달·해안선 모양에서 폴리곤 밖으로 튀어나가므로 격자 탐색으로 구한다.
 * 반환값의 radius 는 "이 자리에 글자가 들어갈 공간" 판단에 쓴다.
 */
function poleOfInaccessibility(rings) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of rings[0]) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  let best = { x: (minX + maxX) / 2, y: (minY + maxY) / 2, radius: 0 };
  let [x0, y0, x1, y1] = [minX, minY, maxX, maxY];

  // 성긴 격자 → 최적점 주변으로 좁혀 다시 탐색, 3회 반복이면 충분히 안정적이다.
  for (let pass = 0; pass < 3; pass += 1) {
    const steps = 32;
    const stepX = (x1 - x0) / steps;
    const stepY = (y1 - y0) / steps;
    for (let i = 0; i <= steps; i += 1) {
      for (let j = 0; j <= steps; j += 1) {
        const x = x0 + i * stepX;
        const y = y0 + j * stepY;
        if (!isInside(x, y, rings)) continue;
        const radius = distanceToEdges(x, y, rings);
        if (radius > best.radius) best = { x, y, radius };
      }
    }
    x0 = best.x - stepX * 2;
    x1 = best.x + stepX * 2;
    y0 = best.y - stepY * 2;
    y1 = best.y + stepY * 2;
  }
  return best;
}

// ── 변환 ──────────────────────────────────────────────────────────────────────

const round = (n) => Number(n.toFixed(PRECISION));

function toPath(polygons) {
  return polygons
    .map(
      (rings) =>
        rings
          .map((ring) => {
            // 마지막 점은 시작점과 같으므로 Z 로 닫고 생략한다.
            const points = ring.slice(0, -1);
            const head = `M${round(points[0][0])} ${round(points[0][1])}`;
            const tail = points
              .slice(1)
              .map((p) => `L${round(p[0])} ${round(p[1])}`)
              .join("");
            return `${head}${tail}Z`;
          })
          .join(""),
      // 한 지역이 여러 폴리곤(본토+섬)이면 subpath 로 이어 붙인다.
    )
    .join("");
}

/** 한 시군구의 행정동 feature 들을 렌더 데이터로 변환한다. */
function buildSigungu(features, tolerance) {
  // 1) 투영 — 시군구 전체를 한 좌표계에 놓아야 지역끼리 어긋나지 않는다.
  const projected = features.map((f) =>
    f.geometry.coordinates.map((polygon) =>
      polygon.map((ring) => ring.map(([lon, lat]) => [projectLon(lon), projectLat(lat)])),
    ),
  );

  // 2) 전체 bbox → 캔버스에 비율 유지로 맞춘다.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const polygons of projected) {
    for (const rings of polygons) {
      for (const ring of rings) {
        for (const [x, y] of ring) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }
  // 캔버스 높이는 지역 비율을 따라가되, 세로로 긴 지역은 상한에서 자르고 좌우 여백을 준다.
  const aspect = Math.min((maxY - minY) / (maxX - minX), MAX_ASPECT);
  const canvasH = Math.round(CANVAS_W * aspect);
  const scale = Math.min(
    (CANVAS_W - PADDING * 2) / (maxX - minX),
    (canvasH - PADDING * 2) / (maxY - minY),
  );
  const offsetX = (CANVAS_W - (maxX - minX) * scale) / 2;
  const offsetY = (canvasH - (maxY - minY) * scale) / 2;
  // y 는 위아래를 뒤집는다(위도는 위로 증가, SVG y 는 아래로 증가).
  const place = ([x, y]) => [(x - minX) * scale + offsetX, (maxY - y) * scale + offsetY];

  // 3) 캔버스 좌표에서 단순화 + 작은 섬 제거 (tolerance 를 출력 단위로 다루기 위해).
  const regions = features.map((feature, index) => {
    const placed = projected[index].map((rings) => rings.map((ring) => ring.map(place)));

    const areas = placed.map((rings) => ringArea(rings[0]));
    const maxArea = Math.max(...areas);
    // 본토 대비 0.2% 미만인 섬은 렌더에서 점 하나로 보이므로 뺀다.
    const kept = placed.filter((_, i) => areas[i] >= maxArea * 0.002);

    const simplified = kept.map((rings) => rings.map((ring) => simplifyRing(ring, tolerance)));
    const mainIndex = areas.indexOf(maxArea);
    const label = poleOfInaccessibility(placed[mainIndex]);

    return {
      code: feature.properties.adm_cd2,
      // "강원특별자치도 양양군 양양읍" → "양양읍"
      name: feature.properties.adm_nm.split(" ").at(-1),
      label,
      d: toPath(simplified),
      pointCount: simplified.reduce((sum, rings) => sum + rings[0].length, 0),
    };
  });

  return { regions, viewBox: `0 0 ${CANVAS_W} ${canvasH}` };
}

/**
 * 지도 하나의 라벨 크기.
 * 행정동이 25개인 시(춘천·원주)와 5개인 군(화천·양구)이 같은 캔버스를 쓰므로,
 * 지역들이 실제로 품을 수 있는 크기(내접원 반지름의 중앙값)에 맞춰 줄인다.
 */
function pickLabelSize(regions) {
  const radii = regions.map((r) => r.label.radius).sort((a, b) => a - b);
  const median = radii[Math.floor(radii.length / 2)];
  const size = Math.round(median * 0.42);
  return Math.max(8, Math.min(14, size));
}

/** 글자가 들어갈 자리가 없는 지역은 라벨을 생략한다(렌더러가 알아서 건너뛴다). */
function labelFits(region, labelSize) {
  const halfWidth = (region.name.length * labelSize * 0.55) / 2;
  const halfHeight = labelSize / 2;
  return region.label.radius >= Math.hypot(halfWidth, halfHeight) * 0.62;
}

// ── 파일 출력 ─────────────────────────────────────────────────────────────────

const ATTRIBUTION = [
  "// 출처: 통계청 통계지리정보서비스(SGIS, https://sgis.kostat.go.kr) 행정동 경계 —",
  "//       공공누리 제1유형(출처표시). 가공: vuski/admdongkor(CC BY 4.0),",
  `//       https://github.com/vuski/admdongkor — ${SOURCE_VERSION}.`,
].join("\n");

function renderRegionFile({ sigunguCd, sigunguName, constPrefix, regions, labelSize, viewBox }) {
  const body = regions
    .map((r) => {
      const label = labelFits(r, labelSize)
        ? `\n    labelX: ${round(r.label.x)},\n    labelY: ${round(r.label.y)},`
        : "\n    // 라벨 생략 — 폴리곤이 작아 글자가 들어가지 않는다.";
      return `  {\n    code: "${r.code}",\n    name: "${r.name}",${label}\n    d: "${r.d}",\n  },`;
    })
    .join("\n");

  return `// ${sigunguName}(${sigunguCd}) 읍·면·동 렌더 데이터 (실제 행정동 경계).
//
// ⚠️ scripts/generate-eupmyeondong.mjs 로 생성된 파일입니다. 직접 고치지 마세요.
${ATTRIBUTION}
//
// code = 행정동코드 10자리(adm_cd2), name = 행정동명.
import type { RegionShape } from "@/types/map";

/** ${sigunguName} 읍·면·동 지도 viewBox. 폭은 지도끼리 같고, 높이는 지역 비율을 따른다. */
export const ${constPrefix}_VIEW_BOX = "${viewBox}";

/** 지도 위 지역명 라벨 크기(viewBox 단위). 행정동 크기에 맞춰 자동 산출. */
export const ${constPrefix}_LABEL_SIZE = ${labelSize};

export const ${constPrefix}_REGIONS: RegionShape[] = [
${body}
];
`;
}

function renderIndexFile(entries) {
  const imports = entries
    .map(
      (e) =>
        `import {\n  ${e.constPrefix}_LABEL_SIZE,\n  ${e.constPrefix}_REGIONS,\n  ${e.constPrefix}_VIEW_BOX,\n} from "./${e.fileName}";`,
    )
    .join("\n");

  const table = entries
    .map(
      (e) =>
        `  // ${e.sigunguName} (${e.regionCount}개 동)\n  "${e.sigunguCd}": {\n    viewBox: ${e.constPrefix}_VIEW_BOX,\n    labelSize: ${e.constPrefix}_LABEL_SIZE,\n    regions: ${e.constPrefix}_REGIONS,\n  },`,
    )
    .join("\n");

  return `// 시·군·구 → 읍·면·동 지도 색인.
// 지도 2단계(시군구를 탭해 들어간 화면)가 이 표에서 렌더 데이터를 찾는다.
//
// ⚠️ scripts/generate-eupmyeondong.mjs 로 생성된 파일입니다. 직접 고치지 마세요.
${ATTRIBUTION}
import type { RegionShape } from "@/types/map";
${imports}

/** 읍·면·동 지도 한 벌 (경계 + 좌표계). */
export interface EupmyeondongMap {
  /** 이 지도 전용 viewBox. 시군구 지도와 좌표계가 다르다. */
  viewBox: string;
  /** 지역명 라벨 크기(viewBox 단위). */
  labelSize: number;
  regions: RegionShape[];
}

/** 강원특별자치도 18개 시·군 전체의 읍·면·동 지도. */
export const EUPMYEONDONG_BY_SIGUNGU: Record<string, EupmyeondongMap> = {
${table}
};

/** 해당 시군구의 읍·면·동 지도. 데이터가 없으면 null(→ 2단계로 못 들어간다). */
export function getEupmyeondongMap(sigunguCd: string | null | undefined): EupmyeondongMap | null {
  if (!sigunguCd) return null;
  return EUPMYEONDONG_BY_SIGUNGU[sigunguCd] ?? null;
}

/** 읍·면·동 지도를 가진 시군구인지. 1단계에서 드릴다운 가능 여부 판단에 쓴다. */
export function hasEupmyeondongMap(sigunguCd: string | null | undefined): boolean {
  return getEupmyeondongMap(sigunguCd) !== null;
}
`;
}

// ── 메인 ──────────────────────────────────────────────────────────────────────

async function main() {
  const { input, tolerance } = parseArgs(process.argv.slice(2));
  const geojson = await loadSource(input);

  const gangwon = geojson.features.filter((f) => f.properties.sido === GANGWON_SIDO);
  if (gangwon.length === 0) throw new Error("강원특별자치도(sido=51) feature 를 찾지 못했습니다.");

  const bySigungu = new Map();
  for (const feature of gangwon) {
    const code = feature.properties.sgg;
    if (!bySigungu.has(code)) bySigungu.set(code, []);
    bySigungu.get(code).push(feature);
  }

  // 파일명 표와 실제 데이터가 어긋나면(코드 개편 등) 조용히 넘어가지 않는다.
  const expected = Object.keys(FILE_NAMES).sort();
  const actual = [...bySigungu.keys()].sort();
  const missing = expected.filter((c) => !actual.includes(c));
  const extra = actual.filter((c) => !expected.includes(c));
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `시군구 코드가 맞지 않습니다. 원본에 없음: [${missing}] / 표에 없음: [${extra}]`,
    );
  }

  await mkdir(OUT_DIR, { recursive: true });

  const entries = [];
  let totalPoints = 0;
  let totalBytes = 0;

  for (const sigunguCd of expected) {
    const features = bySigungu
      .get(sigunguCd)
      .sort((a, b) => a.properties.adm_cd2.localeCompare(b.properties.adm_cd2));
    const sigunguName = features[0].properties.sggnm;
    const fileName = FILE_NAMES[sigunguCd];
    const constPrefix = fileName.toUpperCase();

    const { regions, viewBox } = buildSigungu(features, tolerance);
    const labelSize = pickLabelSize(regions);
    const contents = renderRegionFile({
      sigunguCd,
      sigunguName,
      constPrefix,
      regions,
      labelSize,
      viewBox,
    });
    await writeFile(resolve(OUT_DIR, `${fileName}.ts`), contents, "utf8");

    const points = regions.reduce((sum, r) => sum + r.pointCount, 0);
    const dropped = regions.filter((r) => !labelFits(r, labelSize)).length;
    totalPoints += points;
    totalBytes += Buffer.byteLength(contents);
    entries.push({
      sigunguCd,
      sigunguName,
      fileName,
      constPrefix,
      regionCount: regions.length,
    });

    console.log(
      `${sigunguCd} ${sigunguName.padEnd(5)} ${String(regions.length).padStart(2)}개 동 ` +
        `· ${String(points).padStart(5)}점 · ${viewBox} · 라벨 ${labelSize}px` +
        (dropped > 0 ? ` (${dropped}개 생략)` : ""),
    );
  }

  await writeFile(resolve(OUT_DIR, "index.ts"), renderIndexFile(entries), "utf8");

  console.log(
    `\n완료 — 18개 시군구 / ${gangwon.length}개 동 / ${totalPoints}점 / ` +
      `${(totalBytes / 1024).toFixed(0)}KB (tolerance ${tolerance})`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
