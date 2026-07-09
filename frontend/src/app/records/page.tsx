// B 강수연 · 여행 기록
import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function RecordsPage() {
  return (
    <PagePlaceholder
      title="여행 기록"
      owner="B 강수연 · 관광지/기록/업적"
      description="사용자가 남긴 여행 기록을 모아 보고, 새 기록을 작성하는 화면입니다."
      todos={[
        "기록 목록(사진·제목·방문일) 렌더링",
        "새 기록 작성 폼",
        "기록 상세/수정/삭제",
        "mock: src/data/mock-records.ts 참고",
      ]}
    />
  );
}
