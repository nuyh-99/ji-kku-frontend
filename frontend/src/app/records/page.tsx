// B 강수연 · 여행 기록
// src/app/records/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, MenuIcon } from "@/components/common/icons";
import { ApiError } from "@/lib/api/types";
import { masterSigunguList } from "@/data/master-sigungu";
import { getSigunguTravelPostStatus } from "@/lib/api/travelPost";
import { ChevronLeft, Menu } from "lucide-react";
/** 재로그인이 필요한 인증 에러 코드 */
const AUTH_ERROR_CODES = new Set([
  "AUTH401_1", 
  "AUTH401_2", 
  "AUTH401_3", 
  "AUTH401_5", 
]);

export default function RecordsPage() {
  const router = useRouter();
  const [visibleSigunguList, setVisibleSigunguList] = useState<
    typeof masterSigunguList | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSigunguTravelPostStatus();

        // O(1) 조회를 위해 Set으로 변환
        const recordedIdSet = new Set(data.content.map((item) => Number(item.sigunguCd)));

        // 마스터 리스트 중 "기록이 있는" 시군구만 필터링 -> 이것만 pill로 렌더링
        const filtered = masterSigunguList.filter((sigungu) =>
          recordedIdSet.has(sigungu.sigunguCd)
        );
        setVisibleSigunguList(filtered);
      } catch (err) {
        if (err instanceof ApiError) {
          if (AUTH_ERROR_CODES.has(err.code)) {
            router.replace("/login");
            return;
          }
          setErrorMessage(
            err.code === "AUTH403_1" ? "이 기록을 볼 수 있는 권한이 없어요." : err.message
          );
        } else {
          console.error(err);
          setErrorMessage("일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
        }
      }
    }

    load();
  }, [router]);

  return (
    <div className="relative px-[17px] pt-10 pb-4">
      <header className="flex items-center justify-between mb-4">
        <button aria-label="뒤로가기" onClick={() => router.back()}>
          <ChevronLeft size={24} />
        </button>
        <button aria-label="메뉴" onClick={() => router.push("/mypage")}>
          <Menu size={24} />
        </button>
      </header>

       <h1
        className="font-bold px-[5px] mb-[12px]"
        style={{
          fontFamily: "Pretendard",
          fontWeight: 700,
          fontSize: 16,
          lineHeight: "100%",
          letterSpacing: "0%",
          color: "#6CA59C",
        }}
      >
        내 기록 모아보기
      </h1>

      {errorMessage ? (
        <p className="text-sm text-red-400 text-center mt-10">{errorMessage}</p>
      ) : visibleSigunguList === null ? (
        <p className="text-sm text-gray-400 text-center mt-10">불러오는 중...</p>
      ) : visibleSigunguList.length === 0 ? (
        <p className="text-sm text-gray-400 text-center mt-10">
          아직 등록된 기록이 없어요.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-[10px]">
          {visibleSigunguList.map((sigungu) => (
            <Link
              key={sigungu.sigunguCd}
              href={`/records/${encodeURIComponent(sigungu.sigunguCd)}`}
              className="flex items-center justify-between w-[113px] h-[39px] rounded-[14px] bg-[#6CA59C]/70 text-sm text-white pt-[10px] pr-[9px] pb-[10px] pl-[15px]"
            >
               <span
    style={{
      fontFamily: "Pretendard",
      fontWeight: 400,
      fontSize: 16,
      fontStyle: "normal",
      lineHeight: "100%",
      letterSpacing: "0%",
      color: "#FFFFFF",
      whiteSpace: "nowrap",
    }}
  >
              
              {sigungu.sigunguNm}
              </span>
               <svg width={4} height={8} viewBox="0 0 4 8" fill="none">
    <path
      d="M1 1L3 4L1 7"
      stroke="#FFFFFF"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}