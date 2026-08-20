// A 박태현 · 지도 — 지역별 기록(포스트) 목록
// emd 쿼리를 주면 시군구 전체(566:2096)가 아니라 그 읍·면·동 목록(583:4425)이 된다.
import RegionPostList from "@/features/map/components/RegionPostList";

export default async function RegionPostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ sigunguCd: string }>;
  searchParams: Promise<{ emd?: string }>;
}) {
  const { sigunguCd } = await params;
  const { emd } = await searchParams;

  return (
    <main>
      <RegionPostList sigunguCd={sigunguCd} eupmyeondongCd={emd} />
    </main>
  );
}
