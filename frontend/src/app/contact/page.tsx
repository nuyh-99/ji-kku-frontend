// C 담당 · 기본 서비스 페이지 · 커뮤니티
import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function ContactPage() {
  return (
    <PagePlaceholder
      title="문의"
      owner="C 담당 · 기본 서비스/커뮤니티"
      description="서비스 이용 문의를 남기는 화면입니다."
      todos={[
        "문의 작성 폼(제목·내용·이메일)",
        "제출 처리(추후 API 연동)",
        "자주 묻는 질문(FAQ) 섹션",
      ]}
    />
  );
}
