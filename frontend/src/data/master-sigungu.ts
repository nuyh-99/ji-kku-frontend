// src/data/master-sigungu.ts

export interface MasterSigungu {
  /** 데이터 매칭용 내부 키 (예: "강원-철원군") */
  sigunguCd: number;
  /** 화면 표시용 이름 (예: "철원군") */
  sigunguNm: string;
}

/** 강원특별자치도 전체 시군구 마스터 리스트 (정적 데이터) */
export const masterSigunguList: MasterSigungu[] = [
  { sigunguCd: 51110, sigunguNm: "춘천시" },
  { sigunguCd: 51130, sigunguNm: "원주시" },
  { sigunguCd: 51150, sigunguNm: "강릉시" },
  { sigunguCd: 51170, sigunguNm: "동해시" },
  { sigunguCd: 51190, sigunguNm: "태백시" },
  { sigunguCd: 51210, sigunguNm: "속초시" },
  { sigunguCd: 51230, sigunguNm: "삼척시" },
  { sigunguCd: 51720, sigunguNm: "홍천군" },
  { sigunguCd: 51730, sigunguNm: "횡성군" },
  { sigunguCd: 51750, sigunguNm: "영월군" },
  { sigunguCd: 51760, sigunguNm: "평창군" },
  { sigunguCd: 51770, sigunguNm: "정선군" },
  { sigunguCd: 51780, sigunguNm: "철원군" },
  { sigunguCd: 51790, sigunguNm: "화천군" },
  { sigunguCd: 51800, sigunguNm: "양구군" },
  { sigunguCd: 51810, sigunguNm: "인제군" },
  { sigunguCd: 51820, sigunguNm: "고성군" },
  { sigunguCd: 51830, sigunguNm: "양양군" },
];