// B 담당 · 업적
import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function AchievementsPage() {
  return (
    <PagePlaceholder
      title="업적"
      owner="B 담당 · 관광지/기록/업적"
      description="방문·기록 활동으로 달성하는 업적(배지)과 진행도를 보여주는 화면입니다."
      todos={[
        "달성 / 미달성 업적 목록",
        "진행도 표시",
        "달성 조건 안내",
        "mock: src/data/mock-achievements.ts 참고",
      ]}
    />
  );
}
