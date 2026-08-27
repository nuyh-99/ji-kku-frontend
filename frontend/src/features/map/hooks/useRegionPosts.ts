"use client";

// 지역별 기록(포스트) 목록 — 지도에서 지역을 훑어보는 뷰가 쓴다.
//
// 기록 데이터 자체는 B 담당(/records) 도메인이라 API 는 lib/api/travelPost 것을 그대로 쓰고,
// 지도 화면이 필요한 형태(RegionPost)로 바꾸는 일만 여기서 한다.
// ⚠️ lib/api/travelPost.ts 의 USE_MOCK 이 true 인 동안에는 목데이터가 돌아온다(담당자와 조율 필요).
import { useQuery } from "@tanstack/react-query";
import { getEupmyeondongTravelPosts } from "@/lib/api/travelPost";
import type { RegionPost } from "@/types/map";
import { mapKeys } from "./queryKeys";
import type { SigunguCode } from "../types";
import { useHasToken } from "./useMapDesign";

const EMPTY_POSTS: RegionPost[] = [];

/** 기록 사진이 없을 때 카드에 넣을 대체 이미지. */
const FALLBACK_IMAGE = "/icons/map/add-image.png";

/**
 * 시군구의 기록 목록. date 를 주면 그 날짜만 서버에서 걸러 온다.
 *
 * 응답(TravelPostResponse)에는 읍·면·동 **이름만** 있고 코드가 없다. 그래서 읍·면·동 단위로
 * 좁혀 볼 때는 코드가 아니라 이름으로 맞춰야 한다 — 호출부가 지도 데이터에서 이름을 찾아 넘긴다.
 * 본문 미리보기도 응답에 없어서, 카드 본문 자리에는 제목이 들어간다.
 */
export function useRegionPosts(sigunguCd: SigunguCode, date?: string) {
  const hasToken = useHasToken();

  const query = useQuery({
    queryKey: mapKeys.regionPosts(sigunguCd, date),
    queryFn: () => getEupmyeondongTravelPosts(Number(sigunguCd), date),
    enabled: hasToken && Boolean(sigunguCd),
    select: (data): RegionPost[] =>
      (data.content ?? []).map((post) => ({
        id: String(post.travelPostId),
        // 코드를 주지 않으므로 이름을 그대로 식별자 자리에 둔다(필터도 이름으로 맞춘다).
        eupmyeondongCd: post.emdNm,
        eupmyeondongName: post.emdNm,
        imageUrl: post.firstImage ?? FALLBACK_IMAGE,
        content: post.title,
        logDate: post.logDate,
      })),
  });

  return { ...query, data: query.data ?? EMPTY_POSTS };
}
