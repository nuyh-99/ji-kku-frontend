// A 박태현 · 지도 핵심 기능
import PagePlaceholder from "@/components/common/PagePlaceholder";

export default function MapPage() {
  return (
    <PagePlaceholder
      title="지도"
      owner="A 박태현 · 지도 핵심 기능"
      description="지역을 선택하고 방문 상태를 표시하며, 관광지에서 상세 페이지로 이동하는 핵심 화면입니다."
      todos={[
        "지역(시/군) 선택 UI",
        "방문 / 미방문 상태 시각화",
        "지도 꾸미기(테마·스티커 등)",
        "관광지 선택 시 /spots/[id] 상세로 이동",
      ]}
    />
  );
}
