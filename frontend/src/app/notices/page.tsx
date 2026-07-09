// C 김수빈 · 기본 서비스 페이지 · 커뮤니티
import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function NoticesPage() {
  return (
    <PagePlaceholder
      title="공지사항"
      owner="C 김수빈 · 기본 서비스/커뮤니티"
      description="서비스 공지사항 목록 화면입니다."
      todos={[
        "공지 목록(고정 공지 우선) 렌더링",
        "공지 상세 보기",
        "mock: src/data/mock-notices.ts 참고",
      ]}
    />
  );
}
