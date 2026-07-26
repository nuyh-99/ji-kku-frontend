import { apiFetch } from "./client";
import type { SigunguTravelPostStatusResult } from "@/types/sigungu";
import { mockRecordedSigunguResponse } from "@/data/mock-recorded-sigungu";
import { mockRecords } from "@/data/mock-records";


const USE_MOCK = true;

/** 여행기록 유무 조회 (시군구). TODO: 응답 타입 확정 필요 */
export async function getSigunguTravelPostStatus(): Promise<SigunguTravelPostStatusResult> {
  if (USE_MOCK) {
    return mockRecordedSigunguResponse;
  }
  return apiFetch<SigunguTravelPostStatusResult>("/travel-posts");
}

/** 여행기록 조회 (읍면동). TODO: 응답 타입 확정 필요 */
export function getEupmyeondongTravelPosts(
  sigunguCd: number,
  date?: string
): Promise<EupmyeondongTravelPostsResult> {
  if (USE_MOCK) {
    return Promise.resolve(buildMockEupmyeondongResponse(sigunguCd, date));
  }
  const query = date ? `?${new URLSearchParams({ date }).toString()}` : "";
  return apiFetch<EupmyeondongTravelPostsResult>(
    `/travel-posts/${encodeURIComponent(sigunguCd.toString())}${query}`
  );
}
interface EupmyeondongTravelPostsResult {
  content: {
    travelPostId: number;
    firstImage: string | null;
    emdNm: string;
    logDate: string;
    title: string;
  }[];
}

/** mockRecords를 시군구/읍면동 기준으로 집계해서 요약 응답 형태로 만들어줌 */
function buildMockEupmyeondongResponse(
  sigunguCd: number,
  date?: string
): EupmyeondongTravelPostsResult {
  const content = mockRecords
    .filter((r) => r.sigunguCd === sigunguCd && (!date || r.visitedAt === date))
    .map((r, index) => ({
      travelPostId: index + 1,
      firstImage: r.imageUrls[0] ?? null,
      emdNm: r.emdCd.split("-")[1] ?? r.emdCd,
      logDate: r.visitedAt,
      title: r.title,
    }));

  return { content };
}

/** 여행기록 세부 조회. TODO: 응답 타입 확정 필요 */
export function getTravelPostDetail(travelPostId: string) {
  return apiFetch<unknown>(`/travel-posts/detail/${encodeURIComponent(travelPostId)}`);
}

/** 여행기록 작성. TODO: 요청/응답 타입 확정 필요 */
export function createTravelPost(body: unknown) {
  return apiFetch<unknown>("/travel-posts/detail", {
    method: "POST",
    body,
  });
}