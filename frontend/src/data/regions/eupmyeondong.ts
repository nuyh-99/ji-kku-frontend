// 시·군·구 → 읍·면·동 지도 색인.
// 지도 2단계(시군구를 탭해 들어간 화면)가 이 표에서 렌더 데이터를 찾는다.
import type { RegionShape } from "@/types/map";
import { YANGYANG_LABEL_SIZE, YANGYANG_REGIONS, YANGYANG_VIEW_BOX } from "./yangyang";

/** 읍·면·동 지도 한 벌 (경계 + 좌표계). */
export interface EupmyeondongMap {
  /** 이 지도 전용 viewBox. 시군구 지도와 좌표계가 다르다. */
  viewBox: string;
  /** 지역명 라벨 크기(viewBox 단위). */
  labelSize: number;
  regions: RegionShape[];
}

/**
 * 읍·면·동 경계를 가진 시군구만 들어 있다.
 *
 * ⚠️ 지금은 **양양군(51830) 하나뿐**이다. 디자인에 양양군만 그려져 있어서 다른 17개
 * 시군구는 경계 SVG 를 뽑을 곳이 없다. 경계가 들어오는 대로 여기에 추가하면
 * 화면 코드는 손대지 않아도 된다.
 */
export const EUPMYEONDONG_BY_SIGUNGU: Record<string, EupmyeondongMap> = {
  "51830": {
    viewBox: YANGYANG_VIEW_BOX,
    labelSize: YANGYANG_LABEL_SIZE,
    regions: YANGYANG_REGIONS,
  },
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
