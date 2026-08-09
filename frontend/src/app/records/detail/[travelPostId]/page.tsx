"use client";

// 여행 기록 상세.
// records/[sigunguCd] 목록에서 카드를 누르면 이 라우트로 들어온다.
// TODO: getTravelPostDetail(travelPostId)로 상세를 받아 화면을 구성한다.
//       (지금은 라우트만 살려두는 placeholder — 빈 파일이면 라우트 타입 검증이 실패한다.)
import { use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/components/common/icons";

export default function TravelPostDetailPage({
  params,
}: {
  params: Promise<{ travelPostId: string }>;
}) {
  const { travelPostId } = use(params);
  const router = useRouter();

  return (
    <div className="px-2 py-4">
      <header className="mb-6 flex items-center">
        <button aria-label="뒤로가기" onClick={() => router.back()}>
          <ChevronLeftIcon className="size-6" />
        </button>
      </header>

      <p className="text-sm text-zinc-500">기록 상세 화면은 준비 중이에요. (#{travelPostId})</p>
    </div>
  );
}
