export interface RegionBadge {
  id: string; // public/badge/{id}.png 파일명
  name: string;
  badgeNo: string; // 백엔드 REGION 타입 badgeNo와 매칭되는 코드
}

export const regionBadges: RegionBadge[] = [
  { id: "cheolwon", name: "철원군", badgeNo: "R001" },
  { id: "hwacheon", name: "화천군", badgeNo: "R002" },
  { id: "yangu", name: "양구군", badgeNo: "R003" },
  { id: "chuncheon", name: "춘천시", badgeNo: "R004" },
  { id: "inje", name: "인제군", badgeNo: "R005" },
  { id: "hongcheon", name: "홍천군", badgeNo: "R006" },
  { id: "goseong", name: "고성군", badgeNo: "R007" },
  { id: "sokcho", name: "속초시", badgeNo: "R008" },
  { id: "yangyang", name: "양양군", badgeNo: "R009" },
  { id: "hoengseong", name: "횡성군", badgeNo: "R010" },
  { id: "wonju", name: "원주시", badgeNo: "R011" },
  { id: "pyeongchang", name: "평창군", badgeNo: "R012" },
  { id: "yeongwol", name: "영월군", badgeNo: "R013" },
  { id: "jeongseon", name: "정선군", badgeNo: "R014" },
  { id: "taebaek", name: "태백시", badgeNo: "R015" },
  { id: "samcheok", name: "삼척시", badgeNo: "R016" },
  { id: "donhae", name: "동해시", badgeNo: "R017" },
  { id: "gangneung", name: "강릉시", badgeNo: "R018" },
];