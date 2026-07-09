// B 담당 · 관광지 · 기록 · 업적
import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function EventRegionsPage() {
  return (
    <PagePlaceholder
      title="추천 · 이벤트 지역"
      owner="B 담당 · 관광지/기록/업적"
      description="이벤트 또는 추천 대상 지역을 보여주고, 각 지역의 관광지로 연결되는 화면입니다."
      todos={[
        "이벤트/추천 지역 목록 렌더링",
        "지역별 관광지 목록 진입",
        "관광지 카드 → /spots/[id] 이동",
      ]}
    />
  );
}
