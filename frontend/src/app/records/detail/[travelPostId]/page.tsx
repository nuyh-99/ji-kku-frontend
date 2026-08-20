"use client";

import Image from "next/image";
import { use } from "react";
import { useRouter } from "next/navigation";
import { MOCK_RECORD_DETAIL } from "@/data/mock-recordDetail";

export default function TravelPostDetailPage({
  params,
}: {
  params: Promise<{ travelPostId: string }>;
}) {
  const { travelPostId } = use(params);
  const router = useRouter();

  const record = MOCK_RECORD_DETAIL;

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 고정 영역 */}
      <div className="fixed left-0 top-0 z-30 h-[113px] w-full bg-white">
        {/* 뒤로가기 / 메뉴: 좌우 17px, 위 44px */}
        <header
          className="absolute left-0 top-0 flex w-full items-center justify-between px-[17px]"
          style={{ paddingTop: 44 }}
        >
          <button type="button" aria-label="뒤로가기" onClick={() => router.back()}>
            <Image
              src="/assets/chevron-left.svg"
              alt="뒤로가기"
              width={28}
              height={28}
              className="shrink-0"
            />
          </button>

          <button type="button" aria-label="메뉴" onClick={() => router.push("/mypage")}>
            <div
              className="shrink-0"
              style={{
                width: 28,
                height: 28,
                background: "url('/assets/Menu.png') 50% / contain no-repeat",
              }}
            />
          </button>
        </header>

        {/* 읍면동 이름: 위 83px, 왼쪽 132px */}
        <div
          className="
            absolute
            left-[132px]
            top-[83px]
            whitespace-nowrap
            text-[16px]
            font-bold
            leading-[100%]
            text-[#6CA59C]
          "
        >
          {record.emdNm}
        </div>

        {/* 날짜: 위 85px, 왼쪽 182px */}
        <div
          className="
            absolute
            left-[182px]
            top-[85px]
            whitespace-nowrap
            text-[14px]
            font-bold
            leading-[100%]
            text-[#6CA59CB2]
          "
        >
          {record.logDate}
        </div>
      </div>

      {/* 기록 내용 */}
      <main className="pt-[70px]">
        <div className="flex flex-col gap-[15px]">
          {record.contents.map((content, index) => {
            if (content.type === "image" && content.src) {
              return (
                <div
                  key={`${content.type}-${index}`}
                  className="relative w-full overflow-hidden"
                >
                  <Image
                    src={content.src}
                    alt={`여행 기록 이미지 ${index + 1}`}
                    width={349}
                    height={300}
                    className="h-auto w-full object-cover"
                  />
                </div>
              );
            }

            if (content.type === "text" && content.text) {
              return (
                <p
                  key={`${content.type}-${index}`}
                  className="
                    w-[349px]
                    mx-auto
                    whitespace-pre-line
                    text-center
                    text-[14px]
                    font-normal
                    leading-[100%]
                    tracking-[0%]
                    text-black
                  "
                >
                  {content.text}
                </p>
              );
            }

            return null;
          })}
        </div>
      </main>
    </div>
  );
}