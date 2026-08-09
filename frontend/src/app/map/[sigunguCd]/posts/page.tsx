// A 박태현 · 지도 — 지역별 기록(포스트) 목록
import RegionPostList from "@/features/map/components/RegionPostList";

export default async function RegionPostsPage({
  params,
}: {
  params: Promise<{ sigunguCd: string }>;
}) {
  const { sigunguCd } = await params;

  return (
    <main>
      <RegionPostList sigunguCd={sigunguCd} />
    </main>
  );
}
