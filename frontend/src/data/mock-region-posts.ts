// 지역별 포스트 목록 목데이터 (디자인 566:2096).
// 시군구 코드 → 그 지역에 쓴 기록들. 지금은 양양군(51830)만 채워져 있다.
// 서버 연동 시 features/map/api/mapApi.ts 의 포스트 조회로 대체한다.
import type { RegionPost } from "@/types/map";

export const mockRegionPosts: Record<string, RegionPost[]> = {
  "51830": [
    {
      id: "post-1",
      eupmyeondongCd: "5183033000",
      eupmyeondongName: "현북면",
      imageUrl: "/mock/posts/post-1.jpg",
      content:
        "하조대 해수욕장을 방문 한 후에 하조대 전망대도 방문을 했는데, 탁 트인 바다가 한눈에 들어와서 좋았다.",
      logDate: "2026-07-02",
    },
    {
      id: "post-2",
      eupmyeondongCd: "5183033000",
      eupmyeondongName: "현북면",
      imageUrl: "/mock/posts/post-2.jpg",
      content:
        "하조대 해수욕장에서 조개 껍데기들을 많이 주웠다. 주운 걸로 동생이랑 모래성을 꾸며봤다.",
      logDate: "2026-07-02",
    },
    {
      id: "post-3",
      eupmyeondongCd: "5183034000",
      eupmyeondongName: "현남면",
      imageUrl: "/mock/posts/post-3.jpg",
      content:
        "죽도해변 근처 카페에서 아이스크림을 먹었다. 파도 소리 들으면서 먹으니 두 배로 맛있다.",
      logDate: "2026-04-11",
    },
    {
      id: "post-4",
      eupmyeondongCd: "5183031000",
      eupmyeondongName: "서면",
      imageUrl: "/mock/posts/post-4.jpg",
      content: "서면 쪽 벚꽃길을 걸었다. 4월 초라 딱 만개해서 사진 찍기 좋았다.",
      logDate: "2026-04-05",
    },
    {
      id: "post-5",
      eupmyeondongCd: "5183031000",
      eupmyeondongName: "서면",
      imageUrl: "/mock/posts/post-5.jpg",
      content: "점심으로 물회비빔밥이랑 라면을 시켰다. 양양 와서 먹은 것 중에 제일 맛있었다.",
      logDate: "2026-04-05",
    },
    {
      id: "post-6",
      eupmyeondongCd: "5183025000",
      eupmyeondongName: "양양읍",
      imageUrl: "/mock/posts/post-6.jpg",
      content: "양양 전통시장에서 방금 구운 어묵을 사 먹었다. 바람 불던 날에 딱이었다.",
      logDate: "2026-03-28",
    },
  ],
};

/** 해당 시군구의 포스트 목록. 없으면 빈 배열. */
export function getRegionPosts(sigunguCd: string): RegionPost[] {
  return mockRegionPosts[sigunguCd] ?? [];
}
