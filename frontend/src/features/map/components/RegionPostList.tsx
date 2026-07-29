"use client";

// 지역별 기록(포스트) 목록 — 읍면동 지도 좌하단 목록(≡) 버튼으로 들어온다. (디자인 566:2096)
// 2열 카드 그리드. 카드 = 사진 + [읍면동 칩 · 날짜 칩] + 본문 2줄.
//
// ⚠️ 기록 자체는 B 담당(/records) 도메인이다. 여기는 "지도에서 지역별로 훑어보는" 뷰라
//    map 이 소유하되, 목데이터를 쓴다. 서버 연동 시 mapApi 의 포스트 조회로 교체한다.
import { useRouter } from "next/navigation";
import { getRegionPosts } from "@/data/mock-region-posts";
import { GANGWON_REGIONS } from "@/data/regions/gangwon";
import { ChevronLeftIcon, MenuIcon } from "./icons";

const BRAND = "#6ca59c";
/** 디자인의 칩·라벨은 브랜드 색 70% 불투명도를 쓴다. */
const BRAND_70 = "rgba(108,165,156,0.7)";

interface RegionPostListProps {
  sigunguCd: string;
}

export default function RegionPostList({ sigunguCd }: RegionPostListProps) {
  const router = useRouter();
  const posts = getRegionPosts(sigunguCd);
  const sigunguName = GANGWON_REGIONS.find((r) => r.code === sigunguCd)?.name ?? "이 지역";

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-white">
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
          {sigunguName}
        </h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/map/calendar.png" alt="" className="size-[23px] object-contain" />
      </div>

      {posts.length === 0 ? (
        <p className="px-6 py-16 text-center text-sm text-zinc-500">
          아직 이 지역에 남긴 기록이 없어요.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-2.5 gap-y-3.5 px-[17px] pb-10">
          {posts.map((post) => (
            <li key={post.id}>
              <article className="overflow-hidden rounded-[9px] bg-[#dce7e6] p-1.5 shadow-[0px_3px_4px_0px_rgba(0,0,0,0.25)]">
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
                    {post.displayDate}
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
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
