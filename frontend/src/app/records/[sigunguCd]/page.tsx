"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { ChevronLeftIcon, MenuIcon } from "@/components/common/icons";
import { getEupmyeondongTravelPosts } from "@/lib/api/travelPost";
import { masterSigunguList } from "@/data/master-sigungu";
import Calendar from "../components/Calendar";

export default function SigunguRecordsPage({
  params,
}: {
  params: Promise<{ sigunguCd: string }>;
}) {
  const { sigunguCd: sigunguCdParam } = use(params);
  const sigunguCd = Number(sigunguCdParam);

  const sigunguNm =
    masterSigunguList.find((s) => s.sigunguCd === sigunguCd)?.sigunguNm ?? "";

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const router = useRouter();

  
  // API에는 여전히 "YYYY-MM-DD" 문자열로 전달
  const date = selectedDate ? formatIsoDate(selectedDate) : "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["eupmyeondongTravelPosts", sigunguCd, date],
    queryFn: () => getEupmyeondongTravelPosts(sigunguCd, date || undefined),
    enabled: Number.isFinite(sigunguCd),
  });

  const posts = data?.content ?? [];

  const handleSelectDate = (d: Date) => {
    // 이미 선택된 날짜를 다시 누르면 -> 선택 해제 (전체보기)
    if (selectedDate && isSameDate(d, selectedDate)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(d);
    }
    setShowDatePicker(false);
  };

  return (
    <div className="relative px-2 py-4">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between mb-4">
        <button aria-label="뒤로가기" onClick={() => router.back()}>
          <ChevronLeftIcon className="size-6" />
        </button>

        <div className="mt-[18px] flex items-center gap-2 mb-4">
          <h1
            className="
            font-pretendard
            font-bold
            text-[16px]
            leading-[100%]
            tracking-[em]
            "
            style={{ color: "#6CA59C" }}
            >
            {sigunguNm}
          </h1>
          <button
            aria-label="날짜 선택"
            onClick={() => setShowDatePicker((prev) => !prev)}
          >
            <Image src="/calendar.png" alt="달력" width={23} height={23} />
          </button>
        </div>

        <button aria-label="메뉴">
          <MenuIcon className="size-6" />
        </button>
      </header>

      {showDatePicker && (
        <div
          className="
            fixed
            top-[50px]
            left-1/2
            -translate-x-1/2
            z-50
            w-[272px]
            h-[269px]
            rounded-[9px]
            bg-white
            border border-black/50
            shadow-[0_0_4px_rgba(0,0,0,0.5)]
            p-2
          "
        >
          <Calendar
  selectedDate={selectedDate}
  onSelectDate={handleSelectDate}
  visitedDates={posts.map((post) => post.logDate)}
/>
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-gray-400 text-center mt-10">
          불러오는 중...
        </p>
      )}

      {isError && (
        <p className="text-sm text-red-400 text-center mt-10">
          여행기록을 불러오지 못했어요.
        </p>
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-10">
          해당 날짜에 기록된 여행이 없어요.
        </p>
      )}

      {/* 카드 그리드 */}
      <div className="grid grid-cols-2 gap-x-[10px] gap-y-[14px] justify-items-center">
        {posts.map((post) => (
          <button
            key={post.travelPostId}
            onClick={() => router.push(`/records/detail/${post.travelPostId}`)}
            className="
              relative
              w-[175px]
              h-[186px]
              rounded-[9px]
              bg-[#DCE7E6]
              shadow-[0px_3px_4px_0px_rgba(0,0,0,0.25)]
              text-left
              overflow-hidden
            "
          >
            {/* 이미지 영역: width 163 / height 97 / top 6 / left 6 */}
            <div className="absolute top-[6px] left-[6px] w-[163px] h-[97px] rounded-[9px] overflow-hidden bg-gray-100">
              {post.firstImage ? (
                <Image
                  src={post.firstImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">
                  이미지 없음
                </div>
              )}
            </div>

            {/* 뱃지 영역: 이미지 하단(6 + 97 = 103)에서 살짝 띄운 위치 */}
            <div className="absolute top-[109px] left-[6px] flex items-center gap-1.5">
              {/* 읍면동 뱃지: width 56 / height 18 / bg #6CA59C 70% */}
              <span
                className="
                  w-[56px]
                  h-[18px]
                  rounded-[20px]
                  bg-[#6CA59C]/70
                  text-white
                  font-pretendard
                  font-normal
                  text-[12px]
                  leading-[100%]
                  tracking-[0em]
                  flex items-center justify-center
                  pt-[2px] pr-[12px] pb-[2px] pl-[12px]
                  truncate
                "
              >
                {post.emdNm}
              </span>

              {/* 날짜 뱃지: width 71 / height 18 / bg #FFFFFF 70% */}
              <span
                  className="
                    w-[71px]
                    h-[18px]
                    rounded-[20px]
                    bg-white/70
                    font-pretendard
                    font-normal
                    text-[12px]
                    leading-[100%]
                    tracking-[0em]
                    text-[#6CA59C]/70
                    flex items-center justify-center
                    pt-[2px] pr-[12px] pb-[2px] pl-[12px]
                    truncate
                  "
                >
                  {formatShortDate(post.logDate)}
                </span>
            </div>

            {/* 제목 텍스트 */}
            <p className="absolute top-[132px] left-[6px] w-[163px] text-sm text-gray-700 line-clamp-2">
              {post.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Date -> "2026-07-25" */
function formatIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** "2026-07-25" -> "26.07.25" */
function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${year.slice(2)}.${month}.${day}`;
}