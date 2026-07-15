// 지도(map) 도메인 타입 정의 — 지도 feature 내부 계약의 단일 출처.

/** 시·군·구 코드 (예: "51110" 강원 춘천시) */
export type SigunguCode = string;

/** 지역 방문 상태 */
export type VisitStatus = "unvisited" | "visited";

/**
 * 지역 경계 지오메트리.
 * TODO: 강원도 읍·면·동 경계 데이터 형식 확정 후 타입 확정(GeoJSON/TopoJSON/좌표배열 미정).
 * @see src/data/regions/README.md
 */
export type RegionGeometry = unknown;

/**
 * 지역별 방문/채움 상태 (서버 조회 결과 형태).
 * TODO: 백엔드 응답 확정 시 실제 필드로 교체.
 */
export interface RegionStatus {
  sigunguCd: SigunguCode;
  visitStatus: VisitStatus;
  /** 사진(여행기록)이 등록되어 '채워진' 지역인지 */
  filled: boolean;
}
