// C 담당 · 기본 서비스 페이지 · 커뮤니티
import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function EventsPage() {
  return (
    <PagePlaceholder
      title="이벤트"
      owner="C 담당 · 기본 서비스/커뮤니티"
      description="진행 중/예정 이벤트를 보여주는 커뮤니티 화면입니다."
      todos={[
        "이벤트 목록(기간·요약) 렌더링",
        "이벤트 상세 보기",
        "mock: src/data/mock-events.ts 참고",
      ]}
    />
  );
}
