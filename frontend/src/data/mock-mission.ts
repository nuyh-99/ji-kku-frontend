import type { MissionSpotItem, MissionSpotsResult, MissionSpotPixelPosition } from "@/types/mission";

const YANGYANG_MISSION_SPOTS: MissionSpotItem[] = [
  {
    missionSpotId: 123,
    isCompleted: true,
    contentId: 2761729,
    title: "양양 설악 오색약수",
    firstImage: "/event-region/osaek.png",
    mapX: 128.456,
    mapY: 37.123,
  },
];

/** sigunguCd별 mock 미션 목록. completedCount는 content 중 isCompleted=true 개수와 일치시켜야 합니다. */
export const MOCK_MISSIONS_BY_SIGUNGU: Record<number, MissionSpotsResult> = {
  51830: {
    completedCount: YANGYANG_MISSION_SPOTS.filter((s) => s.isCompleted).length,
    content: YANGYANG_MISSION_SPOTS,
  },
};

/** 지도 위 4개 자리에 대한 픽셀 좌표만 미리 확보해둠.
 *  missionSpotId 123 외 나머지(124~126)는 아직 실제 스팟 데이터가 없어서
 *  content 배열에 없는 한 화면에 핀이 그려지지 않음.
 *  백엔드가 해당 missionSpotId로 스팟을 내려주면 자동으로 이 좌표에 핀+팝업이 붙음. */
export const MOCK_MISSION_SPOT_PIXEL_POSITIONS: MissionSpotPixelPosition[] = [
  { missionSpotId: 123, top: 25, left: 285, width: 40, height: 45 },
  { missionSpotId: 124, top: 96, left: 90, width: 40, height: 45 },
  { missionSpotId: 125, top: 233, left: 275, width: 40, height: 45 },
  { missionSpotId: 126, top: 398, left: 305, width: 40, height: 45 },
];