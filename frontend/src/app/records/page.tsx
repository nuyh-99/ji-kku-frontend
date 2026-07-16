// B 강수연 · 여행 기록
// src/app/records/page.tsx
import Link from "next/link";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { mockRecords } from "@/data/mock-records";

export default function RecordsPage() {
  return (
    <div className="px-2 py-4">
      <header className="flex items-center justify-between mb-6">
        <button aria-label="뒤로가기">
          <ChevronLeft size={24} />
        </button>
        <button aria-label="메뉴">
          <Menu size={24} />
        </button>
      </header>

      <h1 className="text-base text-[#6CA59C] font-semibold mb-4">내 기록 모아보기</h1>

      {mockRecords.length === 0 ? (
        <p className="text-sm text-gray-400 text-center mt-10">
          아직 등록된 기록이 없어요.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-[10px]">
          {mockRecords.map((record) => (
            <Link
              key={record.id}
              href={`/records/${record.id}`}
              className="flex items-center justify-between h-[39px] rounded-[14px] bg-[#6CA59C]/70 text-sm text-[#FFFFFF] pt-[10px] pr-[9px] pb-[10px] pl-[15px]"
            >
              {record.spotName}
              <ChevronRight size={16} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
//export default function RecordsPage() {
//  return (
//    <PagePlaceholder
//      title="여행 기록"
//      owner="B 강수연 · 관광지/기록/업적"
//      description="사용자가 남긴 여행 기록을 모아 보고, 새 기록을 작성하는 화면입니다."
 //     todos={[
 //       "기록 목록(사진·제목·방문일) 렌더링",
 //       "새 기록 작성 폼",
 //       "기록 상세/수정/삭제",
 //       "mock: src/data/mock-records.ts 참고",
//      ]}
//    />
//  );
//}
