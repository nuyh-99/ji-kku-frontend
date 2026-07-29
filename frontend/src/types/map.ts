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

/**
 * 지도 위에 놓인 스티커 한 개.
 *
 * 색·사진과 달리 스티커는 **지역 단위가 아니라 좌표 단위**다(디자인 715:3849 — 스티커가
 * 폴리곤 경계를 넘어 걸쳐 있다). 좌표/크기는 지도 SVG viewBox 단위라서 확대·이동해도
 * 지역과 같은 자리에 붙어 움직인다.
 */
export interface PlacedSticker {
  /** 배치 인스턴스 id. 같은 스티커를 여러 번 놓을 수 있어 카탈로그 id와 분리한다. */
  id: string;
  /** 스티커 카탈로그 id. */
  stickerId: string;
  /** 이미지 경로. */
  src: string;
  /** 표시명(a11y 라벨). */
  name: string;
  /** 중심 X (viewBox 단위). */
  x: number;
  /** 중심 Y (viewBox 단위). */
  y: number;
  /** 한 변 길이 (viewBox 단위). 정사각형으로 다룬다. */
  size: number;
}

/**
 * 지역별 포스트 목록의 카드 한 장 (디자인 566:2096).
 * `data/mock-region-posts.ts` 가 함께 쓰는 타입이라 여기(types/)에 둔다.
 */
export interface RegionPost {
  id: string;
  /** 소속 읍·면·동 코드. */
  eupmyeondongCd: string;
  /** 카드에 표시할 읍·면·동 이름. */
  eupmyeondongName: string;
  /** 대표 사진 URL. */
  imageUrl: string;
  /** 본문 미리보기(카드에서 2줄로 잘림). */
  content: string;
  /** 표시용 날짜 문자열(디자인: "26.07.02"). */
  displayDate: string;
}
