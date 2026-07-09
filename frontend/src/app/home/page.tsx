// C 담당 · 기본 서비스 페이지 · 커뮤니티
import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function HomePage() {
  return (
    <PagePlaceholder
      title="홈"
      owner="C 담당 · 기본 서비스/커뮤니티"
      description="로그인 후 메인 화면입니다. 주요 기능으로 이동하는 진입점 역할을 합니다."
      todos={[
        "주요 메뉴(지도·기록·업적 등) 바로가기",
        "최근 활동 요약",
        "공지/이벤트 배너",
      ]}
    />
  );
}
