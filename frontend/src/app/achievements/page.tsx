"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Menu } from "lucide-react";

import { getBadges } from "@/lib/api/mission";
import { regionBadges } from "@/data/region-badges";
import type { BadgeItem } from "@/types/mission";

export default function AchievementsPage() {
  const router = useRouter();

  const [unlockedNos, setUnlockedNos] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchBadges() {
      try {
        const response = await getBadges();

        // getBadges()는 GetBadgesResult를 반환하므로
        // response.content에 배지 목록이 들어있음
        const badgeList: BadgeItem[] = response.content;

        const regionBadgeNos = badgeList
          .filter((badge) => badge.badgeType === "REGION")
          .map((badge) => badge.badgeNo);

        setUnlockedNos(new Set(regionBadgeNos));
      } catch (error) {
        console.error("배지 목록을 불러오지 못했습니다.", error);
      }
    }

    fetchBadges();
  }, []);

  return (
    <div className="relative min-h-screen bg-white px-[17px] pt-10 pb-4">
      {/* 헤더 */}
      <header
  className="flex items-start justify-center mb-4"
  style={{ width: 359, height: 28, gap: 303 }}
>
  <button aria-label="뒤로가기" onClick={() => router.back()} type="button">
    <ChevronLeft size={28} className="shrink-0" />
  </button>

  <button aria-label="메뉴" onClick={() => router.push("/mypage")} type="button">
    <Menu size={28} className="shrink-0" />
  </button>
</header>

      {/* 축하 배너 */}
      <div className="relative w-full h-[81px] rounded-[9px] bg-[#C3DAD7] overflow-hidden">
        <p className="absolute top-[21px] left-[26px] text-[16px] font-normal leading-none text-[#5F5F5F]">
          축하해요
        </p>

        <p className="absolute top-[41px] left-[26px] text-[16px] font-normal leading-none text-[#0B221E]">
          새로운 배지가 생겼어요
        </p>

        <Image
          src="/event-region/confetti.png"
          alt=""
          width={70}
          height={70}
          className="absolute top-[6px] left-[288px] -rotate-90"
        />
      </div>

      {/* 내 배지 타이틀 */}
      <div className="flex items-center gap-[6px] mt-[34px] mb-4">
        <h2 className="text-[16px] font-bold leading-none text-[#0B221E]">
          내 배지
        </h2>

        <div
  style={{
    display: "flex",
    width: "15px",
    height: "15px",
    padding: "2.5px",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "12.5px",
    border: "0.625px solid #5F5F5F",
  }}
>
  <Image
    src="/questionmark.png"
    alt="배지 안내"
    width={10}
    height={10}
  />
</div>
      </div>

      {/* 배지 그리드 */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-[34px]">
        {regionBadges.map((badge) => {
          const isUnlocked = unlockedNos.has(badge.badgeNo);

          return (
            <div
              key={badge.id}
              className="flex flex-col items-center"
            >
              <div className="relative h-[75px] w-[75px]">
                <Image
                  src={`/badge/${badge.id}.png`}
                  alt={badge.name}
                  fill
                  className={`object-contain ${
                    !isUnlocked ? "grayscale blur-[4px]" : ""
                  }`}
                />

                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/yetquestionmark.png"
                      alt="미획득 배지"
                      width={48}
                      height={48}
                    />
                  </div>
                )}
              </div>

              <span
  className="mt-2 text-[15px] font-normal text-black"
  style={{ fontFamily: "Pretendard", lineHeight: "normal" }}
>
                {badge.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}