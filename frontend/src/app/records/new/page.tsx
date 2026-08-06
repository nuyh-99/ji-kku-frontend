// B 강수연 · 여행 기록 — 기록 작성 (디자인 488:4347)
// 지도 2단계의 "기록 작성하기"(features/map/components/DecorateFab)에서 들어온다.
// 어느 지역 기록인지는 쿼리로 받는다.
import RecordEditor from "@/features/records/components/RecordEditor";

export default async function NewRecordPage({
  searchParams,
}: {
  searchParams: Promise<{ sigunguCd?: string; eupmyeondongCd?: string }>;
}) {
  const { sigunguCd = "", eupmyeondongCd = "" } = await searchParams;

  return (
    <main>
      <RecordEditor sigunguCd={sigunguCd} eupmyeondongCd={eupmyeondongCd} />
    </main>
  );
}
