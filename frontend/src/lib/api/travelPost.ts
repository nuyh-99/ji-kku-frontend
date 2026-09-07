import { apiFetch } from "./client";
import type { SigunguTravelPostStatusResult } from "@/types/sigungu";
import { mockRecordedSigunguResponse } from "@/data/mock-recorded-sigungu";
import { mockRecords } from "@/data/mock-records";
import type { TravelPostDetailResponse } from "@/types/record";
import type { TravelPostDetail } from "@/types/record";

const USE_MOCK = false;

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
  return apiFetch<TravelPostDetail>(
    `/travel-posts/detail/${encodeURIComponent(travelPostId)}`
  );
}

// ─── 기록 작성 (POST /travel-posts/detail) ────────────────────────────────
// 스키마 출처: OpenAPI TravelPostCreateRequest / TravelPostCreateResponse.

/** 본문 블록 종류. 서버는 글과 사진을 한 배열에 순서(sortOrder)로 섞어 받는다. */
export type TravelPostBlockType = "TEXT" | "IMAGE";

/** 본문 블록 한 개. TEXT 면 textContent 를, IMAGE 면 imgUrl(업로드된 S3 URL)을 채운다. */
export interface TravelPostBlockCreateRequest {
  blockType: TravelPostBlockType;
  sortOrder: number;
  textContent?: string;
  imgUrl?: string;
}

export interface TravelPostCreateRequest {
  /** 서버 DB 의 읍·면·동 id — 행정동코드가 아니다(data/regions/emdId 참고). */
  emdId: number;
  title: string;
  /** 방문 날짜, yyyy-MM-dd. */
  logDate: string;
  /** 최소 1개 필요하다(minItems: 1). */
  blocks: TravelPostBlockCreateRequest[];
}

export interface TravelPostCreateResult {
  travelPostId: number;
  title: string;
  firstImage: string | null;
}

/** 여행기록 작성. 저장된 기록의 travelPostId 를 돌려준다(지도에 카드로 올릴 때 쓴다). */
export function createTravelPost(body: TravelPostCreateRequest): Promise<TravelPostCreateResult> {
  return apiFetch<TravelPostCreateResult>("/travel-posts/detail", {
    method: "POST",
    body,
  });
}
