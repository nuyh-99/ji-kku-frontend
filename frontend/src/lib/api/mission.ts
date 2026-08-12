import { apiFetch } from "./client";
import type { VerifyMissionVisitBody, VerifyMissionVisitResult } from "@/types/mission";
import { MOCK_MISSIONS_BY_SIGUNGU } from "@/data/mock-mission";
import { MOCK_MISSION_DETAIL_BY_CONTENT_ID, MOCK_DETAIL_FALLBACK_BY_SIGUNGU } from "@/data/mock-missionDetail";

// 📌 백엔드 및 클라이언트 공통 미션 스팟 단일 객체 타입 정의
export interface MissionSpotItem {
  missionSpotId?: number;
  isCompleted?: boolean;
  contentId: number;
  title: string;
  firstImage?: string | null;
  overview?: string;
  addr1?: string;
  sigunguCd?: number;
  sigunguNm?: string;
  mapX: number | string;
  mapY: number | string;
}

export interface MissionSpotApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: MissionSpotItem;
}

const USE_MOCK = true; // 목데이터 사용 설정

/** 
 * [목데이터 연결] 특정 시군구(sigunguCd)의 특정 관광지(contentId) 상세 정보 조회
 */
export async function getMissionSpotDetail(
  sigunguCd: number,
  contentId: number
): Promise<MissionSpotItem> {
  if (USE_MOCK) {
    // 1. 목록 데이터에서 기본 정보 찾기
    const mockDataGroup = MOCK_MISSIONS_BY_SIGUNGU[sigunguCd];
    const listSpot = mockDataGroup?.content.find(
      (spot) => spot.contentId === contentId
    );

    // 2. 상세 데이터에서 오버레이할 정보 찾기
    const detailOverride = MOCK_MISSION_DETAIL_BY_CONTENT_ID[contentId];

    if (listSpot || detailOverride) {
      return Promise.resolve({
        ...listSpot,
        ...detailOverride,
        sigunguCd,
      } as MissionSpotItem);
    }

    // 3. 찾는 데이터가 없을 경우 해당 시군구의 fallback contentId로 재조회
    const fallbackContentId = MOCK_DETAIL_FALLBACK_BY_SIGUNGU[sigunguCd] ?? 2761729;
    const fallbackDetail = MOCK_MISSION_DETAIL_BY_CONTENT_ID[fallbackContentId];

    return Promise.resolve({
      contentId: fallbackContentId,
      sigunguCd,
      ...fallbackDetail,
    } as MissionSpotItem);
  }

  // USE_MOCK이 false일 때 실제 백엔드 API 호출
  const response = await apiFetch<MissionSpotApiResponse>(
    `/event-regions/${sigunguCd}/${contentId}`
  );
  return response.result;
}
export async function getMissionSpots(sigunguCd: number) {
  if (USE_MOCK) {
    const mockData = MOCK_MISSIONS_BY_SIGUNGU[sigunguCd];
    return Promise.resolve(mockData?.content || []);
  }

  const response = await apiFetch<{ result: MissionSpotItem[] }>(`/missions/${sigunguCd}`);
  return response.result;
}

export function verifyMissionVisit(missionSpotId: number, body: VerifyMissionVisitBody) {
  if (USE_MOCK) {
    // mock 데이터에서 해당 missionSpotId를 찾아 isCompleted를 true로 변경
    for (const group of Object.values(MOCK_MISSIONS_BY_SIGUNGU)) {
      const target = group.content.find((s) => s.missionSpotId === missionSpotId);
      if (target) {
        target.isCompleted = true;
        group.completedCount = group.content.filter((s) => s.isCompleted).length;
        break;
      }
    }

    return Promise.resolve<VerifyMissionVisitResult>({
      isSuccess: true,
      code: "OK",
      message: "요청이 성공했습니다.",
      result: { missionSpotId, isCompleted: true },
    });
  }

  return apiFetch<VerifyMissionVisitResult>(`/missions/verify/${missionSpotId}`, {
    method: "POST",
    body,
  });
}

export function getBadges() {
  return apiFetch<unknown>("/badges");
}