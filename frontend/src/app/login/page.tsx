// C 담당 · 기본 서비스 페이지 · 커뮤니티
import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function LoginPage() {
  return (
    <PagePlaceholder
      title="로그인"
      owner="C 담당 · 기본 서비스/커뮤니티"
      description="서비스 로그인 화면입니다."
      todos={[
        "로그인 폼(또는 소셜 로그인 버튼)",
        "로그인 성공 시 /home 이동",
        "인증 상태 처리(추후 API 연동)",
      ]}
    />
  );
}
