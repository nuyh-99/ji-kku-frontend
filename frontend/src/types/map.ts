// 공용 지도 렌더러(GangwonMapSvg)의 프레젠테이션 계약 — 단일 출처.
// map(꾸미기)·home(방문 미리보기) 두 feature가 공유한다.
// features/map/types.ts(도메인 계약: SigunguCode/VisitStatus 등)와는 별개 레이어다.

/**
 * 이미 렌더 가능한 SVG 지역 폴리곤.
 * `d`는 `<path d="...">`에 그대로 넣는 SVG path 문자열이다.
 * (미정인 원본 경계 포맷 `RegionGeometry`와 달리, 여기선 렌더 가능한 형태로 확정한다.)
 */
export interface RegionShape {
  /** 지역 식별자. 추후 features/map의 SigunguCode와 정렬 예정. */
  code: string;
  /** 지역명. a11y 라벨 및 지도 위 텍스트 라벨에 사용. */
  name: string;
  /** SVG path 데이터. */
  d: string;
  /** 지도 위 지역명 라벨 X 좌표(합성 좌표계). 없으면 라벨을 그리지 않는다. */
  labelX?: number;
  /** 지도 위 지역명 라벨 Y 좌표(합성 좌표계). */
  labelY?: number;
}

/**
 * 지역 한 곳의 채움 방식.
 * - empty: 미방문/미채움 (기본 회색)
 * - color: 단색 채움
 * - photo: 폴리곤 안에 사진을 clipPath로 클립해 채움
 */
export type RegionFill =
  { type: "empty" } | { type: "color"; value: string } | { type: "photo"; src: string };
