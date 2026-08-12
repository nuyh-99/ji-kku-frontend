// 화면 개발용 배지 목데이터. 실제 GET /badges 응답의 result 구조를 그대로 흉내냅니다.
import type { GetBadgesResult } from "@/types/mission";

export const mockBadgesResult: GetBadgesResult = {
  content: [
    { badgeId: 1, badgeType: "REGION", badgeNo: "R001" },
    { badgeId: 2, badgeType: "REGION", badgeNo: "R002" },
    { badgeId: 3, badgeType: "ETC", badgeNo: "WELC" },
    { badgeId: 4, badgeType: "FESTIVAL", badgeNo: "F001" },
  ],
};