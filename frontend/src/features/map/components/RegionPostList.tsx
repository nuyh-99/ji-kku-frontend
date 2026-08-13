"use client";

// 지역별 기록(포스트) 목록.
// 범위는 둘이다 — 제목만 다르고 카드 그리드는 같다.
//   시군구 전체 (디자인 566:2096) : 읍면동 지도 좌하단 목록(≡) 버튼으로 들어온다.
//   읍면동 하나 (디자인 583:4425) : 기록을 "저장만 하기" 로 남긴 뒤 그 지역 목록으로 온다.
// 2열 카드 그리드. 카드 = 사진 + [읍면동 칩 · 날짜 칩] + 본문 2줄.
// 카드를 누르면 기록 상세로, 지역명 옆 달력을 누르면 날짜로 걸러본다.
//
// ⚠️ 기록 자체는 B 담당(/records) 도메인이다. 여기는 "지도에서 지역별로 훑어보는" 뷰라
//    map 이 소유하되, 목데이터를 쓴다. 서버 연동 시 mapApi 의 포스트 조회로 교체한다.
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DatePickerPopover from "@/components/common/DatePickerPopover";
import { ChevronLeftIcon, MenuIcon } from "@/components/common/icons";
import { getRegionPosts } from "@/data/mock-region-posts";
import { getEupmyeondongMap } from "@/data/regions/eupmyeondong";
import { GANGWON_REGIONS } from "@/data/regions/gangwon";

const BRAND = "#6ca59c";
/** 디자인의 칩·라벨은 브랜드 색 70% 불투명도를 쓴다. */
const BRAND_70 = "rgba(108,165,156,0.7)";

interface RegionPostListProps {
  sigunguCd: string;
  /** 읍·면·동 코드. 주면 그 지역 기록만 보여주고 제목도 그 지역 이름이 된다. */
  eupmyeondongCd?: string;
}

/** Date → "2026-07-02". 목록의 logDate 와 같은 표기라 문자열끼리 비교할 수 있다. */
function toIsoDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/** "2026-07-02" → "26.07.02" (디자인의 날짜 칩 표기). */
function toChipDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${year.slice(2)}.${month}.${day}`;
}

export default function RegionPostList({ sigunguCd, eupmyeondongCd }: RegionPostListProps) {
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  // 고른 날짜가 없으면(null) 전체보기다.
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const allPosts = getRegionPosts(sigunguCd);

  // 제목은 보고 있는 범위의 이름이다. 읍·면·동 이름은 기록이 한 건도 없어도 나와야 해서
  // 포스트가 아니라 지도 데이터에서 찾는다.
  const regionName = eupmyeondongCd
    ? (getEupmyeondongMap(sigunguCd)?.regions.find((r) => r.code === eupmyeondongCd)?.name ??
      "이 지역")
    : (GANGWON_REGIONS.find((r) => r.code === sigunguCd)?.name ?? "이 지역");

  const posts = useMemo(() => {
    const iso = selectedDate ? toIsoDate(selectedDate) : null;
    return allPosts.filter(
      (post) =>
        (!eupmyeondongCd || post.eupmyeondongCd === eupmyeondongCd) &&
        (!iso || post.logDate === iso),
    );
  }, [allPosts, eupmyeondongCd, selectedDate]);

  const handleSelectDate = (date: Date) => {
    // 이미 고른 날짜를 다시 누르면 필터를 푼다(= 전체보기). /records 쪽 목록과 같은 규칙.
    setSelectedDate((prev) => (prev && toIsoDate(prev) === toIsoDate(date) ? null : date));
    setPickerOpen(false);
  };

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-white">
      <header className="relative flex h-14 shrink-0 items-center px-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로"
          className="grid size-10 place-items-center rounded-full text-zinc-800 hover:bg-black/5"
        >
          <ChevronLeftIcon className="size-6" />
        </button>
        <button
          type="button"
          aria-label="메뉴"
          className="absolute right-2 grid size-10 place-items-center rounded-full text-zinc-800 hover:bg-black/5"
        >
          <MenuIcon className="size-6" />
        </button>
      </header>

      <div className="flex items-center justify-center gap-1 pb-4">
        <h1 className="text-base font-medium" style={{ color: BRAND }}>
          {regionName}
        </h1>
        <button
          type="button"
          onClick={() => setPickerOpen((open) => !open)}
          aria-label="날짜로 거르기"
          aria-expanded={pickerOpen}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/map/calendar.png" alt="" className="size-[23px] object-contain" />
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="px-6 py-16 text-center text-sm text-zinc-500">
          {selectedDate
            ? `${toChipDate(toIsoDate(selectedDate))}에 ${regionName}에서 남긴 기록이 없어요.`
            : `아직 ${regionName}에 남긴 기록이 없어요.`}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-2.5 gap-y-3.5 px-[17px] pb-10">
          {posts.map((post) => (
            <li key={post.id}>
              {/*
                기록 상세는 B 담당(/records/detail)이다. 지금 그 화면은 travelPostId 를 보지
                않고 목데이터 한 건만 보여줘서, 어느 카드를 눌러도 같은 기록이 뜬다.
                서버가 붙어 id 로 조회하게 되면 이 링크가 그대로 맞는다.
              */}
              <Link
                href={`/records/detail/${post.id}`}
                className="block overflow-hidden rounded-[9px] bg-[#dce7e6] p-1.5 shadow-[0px_3px_4px_0px_rgba(0,0,0,0.25)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.imageUrl}
                  alt=""
                  className="h-[97px] w-full rounded-[9px] object-cover"
                />

                <div className="mt-2.5 flex items-center gap-1.5">
                  <span
                    className="rounded-[20px] px-3 py-0.5 text-xs whitespace-nowrap text-white"
                    style={{ backgroundColor: BRAND_70 }}
                  >
                    {post.eupmyeondongName}
                  </span>
                  <span
                    className="rounded-[20px] bg-white/70 px-3 py-0.5 text-xs whitespace-nowrap"
                    style={{ color: BRAND_70 }}
                  >
                    {toChipDate(post.logDate)}
                  </span>
                </div>

                {/*
                  디자인은 2줄에서 말줄임.
                  line-clamp 의 overflow:hidden 은 padding-box 까지 포함해서 자르기 때문에
                  아래 여백을 padding 으로 주면 잘린 3번째 줄이 그 안에 비친다 → margin 으로 준다.
                */}
                <p className="mt-2 mb-1 line-clamp-2 px-1 text-xs leading-[1.45] text-black">
                  {post.content}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pickerOpen && (
        <DatePickerPopover
          // 고른 날짜가 없으면 오늘 달을 펼쳐 보여준다(선택 표시는 끈다).
          value={selectedDate ?? new Date()}
          showSelection={selectedDate !== null}
          onSelect={handleSelectDate}
          onClose={() => setPickerOpen(false)}
          // 헤더(56) + 지역명 줄 아래.
          className="absolute top-[92px] left-1/2 -translate-x-1/2"
        />
      )}
    </div>
  );
}
