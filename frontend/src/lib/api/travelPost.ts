import { apiFetch } from "./client";

/** 여행기록 유무 조회 (시군구). TODO: 응답 타입 확정 필요 */
export function getSigunguTravelPostStatus() {
  return apiFetch<unknown>("/travel-posts");
}

/** 여행기록 조회 (읍면동). TODO: 응답 타입 확정 필요 */
export function getEupmyeondongTravelPosts(sigunguCd: string, date: string) {
  const query = new URLSearchParams({ date }).toString();
  return apiFetch<unknown>(`/travel-posts/${encodeURIComponent(sigunguCd)}?${query}`);
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
