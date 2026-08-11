// 시·군·구 → 읍·면·동 지도 색인.
// 지도 2단계(시군구를 탭해 들어간 화면)가 이 표에서 렌더 데이터를 찾는다.
//
// ⚠️ scripts/generate-eupmyeondong.mjs 로 생성된 파일입니다. 직접 고치지 마세요.
// 출처: 통계청 통계지리정보서비스(SGIS, https://sgis.kostat.go.kr) 행정동 경계 —
//       공공누리 제1유형(출처표시). 가공: vuski/admdongkor(CC BY 4.0),
//       https://github.com/vuski/admdongkor — ver20260701.
import type { RegionShape } from "@/types/map";
import { CHUNCHEON_LABEL_SIZE, CHUNCHEON_REGIONS, CHUNCHEON_VIEW_BOX } from "./chuncheon";
import { WONJU_LABEL_SIZE, WONJU_REGIONS, WONJU_VIEW_BOX } from "./wonju";
import { GANGNEUNG_LABEL_SIZE, GANGNEUNG_REGIONS, GANGNEUNG_VIEW_BOX } from "./gangneung";
import { DONGHAE_LABEL_SIZE, DONGHAE_REGIONS, DONGHAE_VIEW_BOX } from "./donghae";
import { TAEBAEK_LABEL_SIZE, TAEBAEK_REGIONS, TAEBAEK_VIEW_BOX } from "./taebaek";
import { SOKCHO_LABEL_SIZE, SOKCHO_REGIONS, SOKCHO_VIEW_BOX } from "./sokcho";
import { SAMCHEOK_LABEL_SIZE, SAMCHEOK_REGIONS, SAMCHEOK_VIEW_BOX } from "./samcheok";
import { HONGCHEON_LABEL_SIZE, HONGCHEON_REGIONS, HONGCHEON_VIEW_BOX } from "./hongcheon";
import { HOENGSEONG_LABEL_SIZE, HOENGSEONG_REGIONS, HOENGSEONG_VIEW_BOX } from "./hoengseong";
import { YEONGWOL_LABEL_SIZE, YEONGWOL_REGIONS, YEONGWOL_VIEW_BOX } from "./yeongwol";
import { PYEONGCHANG_LABEL_SIZE, PYEONGCHANG_REGIONS, PYEONGCHANG_VIEW_BOX } from "./pyeongchang";
import { JEONGSEON_LABEL_SIZE, JEONGSEON_REGIONS, JEONGSEON_VIEW_BOX } from "./jeongseon";
import { CHEORWON_LABEL_SIZE, CHEORWON_REGIONS, CHEORWON_VIEW_BOX } from "./cheorwon";
import { HWACHEON_LABEL_SIZE, HWACHEON_REGIONS, HWACHEON_VIEW_BOX } from "./hwacheon";
import { YANGGU_LABEL_SIZE, YANGGU_REGIONS, YANGGU_VIEW_BOX } from "./yanggu";
import { INJE_LABEL_SIZE, INJE_REGIONS, INJE_VIEW_BOX } from "./inje";
import { GOSEONG_LABEL_SIZE, GOSEONG_REGIONS, GOSEONG_VIEW_BOX } from "./goseong";
import { YANGYANG_LABEL_SIZE, YANGYANG_REGIONS, YANGYANG_VIEW_BOX } from "./yangyang";

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
  // 춘천시 (25개 동)
  "51110": {
    viewBox: CHUNCHEON_VIEW_BOX,
    labelSize: CHUNCHEON_LABEL_SIZE,
    regions: CHUNCHEON_REGIONS,
  },
  // 원주시 (25개 동)
  "51130": {
    viewBox: WONJU_VIEW_BOX,
    labelSize: WONJU_LABEL_SIZE,
    regions: WONJU_REGIONS,
  },
  // 강릉시 (21개 동)
  "51150": {
    viewBox: GANGNEUNG_VIEW_BOX,
    labelSize: GANGNEUNG_LABEL_SIZE,
    regions: GANGNEUNG_REGIONS,
  },
  // 동해시 (10개 동)
  "51170": {
    viewBox: DONGHAE_VIEW_BOX,
    labelSize: DONGHAE_LABEL_SIZE,
    regions: DONGHAE_REGIONS,
  },
  // 태백시 (8개 동)
  "51190": {
    viewBox: TAEBAEK_VIEW_BOX,
    labelSize: TAEBAEK_LABEL_SIZE,
    regions: TAEBAEK_REGIONS,
  },
  // 속초시 (8개 동)
  "51210": {
    viewBox: SOKCHO_VIEW_BOX,
    labelSize: SOKCHO_LABEL_SIZE,
    regions: SOKCHO_REGIONS,
  },
  // 삼척시 (12개 동)
  "51230": {
    viewBox: SAMCHEOK_VIEW_BOX,
    labelSize: SAMCHEOK_LABEL_SIZE,
    regions: SAMCHEOK_REGIONS,
  },
  // 홍천군 (10개 동)
  "51720": {
    viewBox: HONGCHEON_VIEW_BOX,
    labelSize: HONGCHEON_LABEL_SIZE,
    regions: HONGCHEON_REGIONS,
  },
  // 횡성군 (9개 동)
  "51730": {
    viewBox: HOENGSEONG_VIEW_BOX,
    labelSize: HOENGSEONG_LABEL_SIZE,
    regions: HOENGSEONG_REGIONS,
  },
  // 영월군 (9개 동)
  "51750": {
    viewBox: YEONGWOL_VIEW_BOX,
    labelSize: YEONGWOL_LABEL_SIZE,
    regions: YEONGWOL_REGIONS,
  },
  // 평창군 (8개 동)
  "51760": {
    viewBox: PYEONGCHANG_VIEW_BOX,
    labelSize: PYEONGCHANG_LABEL_SIZE,
    regions: PYEONGCHANG_REGIONS,
  },
  // 정선군 (9개 동)
  "51770": {
    viewBox: JEONGSEON_VIEW_BOX,
    labelSize: JEONGSEON_LABEL_SIZE,
    regions: JEONGSEON_REGIONS,
  },
  // 철원군 (7개 동)
  "51780": {
    viewBox: CHEORWON_VIEW_BOX,
    labelSize: CHEORWON_LABEL_SIZE,
    regions: CHEORWON_REGIONS,
  },
  // 화천군 (5개 동)
  "51790": {
    viewBox: HWACHEON_VIEW_BOX,
    labelSize: HWACHEON_LABEL_SIZE,
    regions: HWACHEON_REGIONS,
  },
  // 양구군 (5개 동)
  "51800": {
    viewBox: YANGGU_VIEW_BOX,
    labelSize: YANGGU_LABEL_SIZE,
    regions: YANGGU_REGIONS,
  },
  // 인제군 (6개 동)
  "51810": {
    viewBox: INJE_VIEW_BOX,
    labelSize: INJE_LABEL_SIZE,
    regions: INJE_REGIONS,
  },
  // 고성군 (5개 동)
  "51820": {
    viewBox: GOSEONG_VIEW_BOX,
    labelSize: GOSEONG_LABEL_SIZE,
    regions: GOSEONG_REGIONS,
  },
  // 양양군 (6개 동)
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
