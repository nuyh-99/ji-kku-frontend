// B 강수연 · 관광지 상세 (지도/목록에서 진입)
// Next.js 16: 동적 라우트의 params 는 Promise 이므로 await 해서 사용합니다.
import PagePlaceholder from "@/components/common/PagePlaceholder";

interface SpotDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SpotDetailPage({ params }: SpotDetailPageProps) {
  const { id } = await params;

  return (
    <PagePlaceholder
      title={`관광지 상세 (id: ${id})`}
      owner="B 강수연 · 관광지/기록/업적"
      description="선택한 관광지의 상세 정보와 관련 기록을 보여주는 화면입니다."
      todos={[
        "관광지 기본 정보(이름·주소·소개·이미지) 표시",
        "방문 처리 / 방문 취소 버튼",
        "해당 관광지의 여행 기록 목록",
        "mock: src/data/mock-spots.ts 참고",
      ]}
    />
  );
}
