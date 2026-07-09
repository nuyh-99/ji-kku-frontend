// C 김수빈 · 기본 서비스 페이지 · 커뮤니티
import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function MyPage() {
  return (
    <PagePlaceholder
      title="마이페이지"
      owner="C 김수빈 · 기본 서비스/커뮤니티"
      description="내 프로필과 활동 요약을 보여주는 화면입니다."
      todos={[
        "프로필 정보(닉네임·이미지)",
        "내 방문 관광지 / 기록 / 업적 요약",
        "설정 · 로그아웃",
        "mock: src/types/user.ts 참고",
      ]}
    />
  );
}
