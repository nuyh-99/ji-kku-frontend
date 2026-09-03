"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import SpotCard from "@/components/SpotCard";
import GangwonMapSvg from "@/components/map/GangwonMapSvg";
import { GANGWON_REGIONS, GANGWON_VIEW_BOX } from "@/data/regions/gangwon";
import { useSigunguFills } from "@/features/map/hooks/useMapDesign";
import { useTodaySpots } from "../hooks/useTodaySpots";
import CircularProgress from "./CircularProgress";

export default function Home() {
    const router = useRouter();

    const onOpenMenu = () => router.push("/mypage");

    // 오늘의 관광지 추천 — 실제 API 연동
    const { data: todaySpots, isLoading, isError } = useTodaySpots();

    // 내가 칠한 시군구 지도 — 읽기 전용 미리보기
    const { data: sigunguFills } = useSigunguFills();

    // 실제로 채워진(색/사진) 시군구 개수를 방문 카운트로 사용
    const visitedCount = Object.values(sigunguFills.fills).filter(
        (fill) => fill.type !== "empty",
    ).length;
    const totalCount = 18;
    const percent = Math.round((visitedCount / totalCount) * 100);

    const onOpenMap = () => router.push("/map");
    const onEventArea = () => router.push("/event-regions");
    const onMyAchievement = () => router.push("/achievements");
    const onMyRecord = () => router.push("/records");

    return (
        <div className="relative w-full min-h-screen overflow-hidden font-pretendard">
            <style jsx global>{`
                @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css");
                .font-pretendard {
                    font-family: "Pretendard", sans-serif;
                }
            `}</style>

            <div
                className="absolute inset-0  bg-cover bg-center  scale-110"
                style={{ backgroundImage: "url('/assets/landing-bg-blur.png')" }}
            />

            <div className="relative flex flex-col gap-[14px] px-4 py-11">
                {/* 상단 메뉴 아이콘 */}
                <div className="flex justify-end">
                    <button aria-label="메뉴 열기" className="pr-[1px]" onClick={onOpenMenu}>
                        <Image src="/assets/Menu.png" alt="" width={28} height={28} />
                    </button>
                </div>

                {/* MY MAP 카드 */}
                <div className="rounded-[20px] h-100 bg-white/60 shadow-[0_0_4px_0_rgba(0,0,0,0.50)] overflow-hidden ">
                    <h2 className="relative z-10 m-[14px] text-[12.538px] font-bold text-[#6CA59C]">MY MAP</h2>

                    <div
                        className="relative h-64 w-full px-6 flex items-center justify-center cursor-pointer"
                        onClick={onOpenMap}
                        role="button"
                        aria-label="내 지도 꾸미러 가기"
                    >
                        <GangwonMapSvg
                            regions={GANGWON_REGIONS}
                            viewBox={GANGWON_VIEW_BOX}
                            regionStates={sigunguFills.fills}
                            ariaLabel="내가 방문한 강원도 지도"
                            // onRegionClick 없음 → 클릭/포커스 불가능한 읽기 전용 지도
                        />
                    </div>

                    <div className="mt-4 w-full h-[82px] flex items-center justify-between rounded-0 bg-white py-[14px] px-[18px]">
                        <div className="flex items-center gap-[9px]">
                            <CircularProgress percent={percent} />
                            <p className="text-xs text-[#6CA59C]/70">
                                <span className="text-base text-[#6CA59C]">{visitedCount}</span>
                                /{totalCount}
                                <br />
                                <span className="text-[#6CA59C]/70">방문 시군</span>
                            </p>
                        </div>

                        <button
                            onClick={onOpenMap}
                            className="flex w-[142px] h-[37.209px] items-center gap-2 rounded-full bg-[#6CA59C] pl-[13.67px] py-[6.38px] text-[12.15px] font-medium text-white"
                        >
                            내 지도 꾸미러 가기
                            <Image src="/assets/chevron-right.svg" width={18} height={18} alt="" />
                        </button>
                    </div>
                </div>

                {/* 버튼 3개 */}
                <div className="flex gap-[14px]">
                    <button
                        onClick={onEventArea}
                        className="flex flex-1 h-[42px] items-center justify-center gap-[9px] rounded-full bg-[#6CA59C] py-3 pl-3 text-sm font-medium text-white shadow-[0_0_4px_0_rgba(0,0,0,0.50)]"
                    >
                        이벤트 지역
                        <Image src="/assets/chevron-right.svg" width={18} height={18} alt="" />
                    </button>
                    <button
                        onClick={onMyAchievement}
                        className="flex flex-1 h-[42px]  items-center justify-center gap-[35px] rounded-full bg-[#6CA59C] py-3 pl-3 text-sm font-medium text-white shadow-[0_0_4px_0_rgba(0,0,0,0.50)]"
                    >
                        내 업적
                        <Image src="/assets/chevron-right.svg" width={18} height={18} alt="" />
                    </button>
                    <button
                        onClick={onMyRecord}
                        className="flex flex-1 h-[42px]  items-center justify-center gap-[34px] rounded-full bg-[#6CA59C] py-3 pl-3 text-sm font-medium text-white shadow-[0_0_4px_0_rgba(0,0,0,0.50)]"
                    >
                        내 기록
                        <Image src="/assets/chevron-right.svg" width={18} height={18} alt="" />
                    </button>
                </div>

                {/* 오늘의 관광지 추천 — SpotCard 컴포넌트 재사용 */}
                <section>
                    <h3 className="mb-2 text-white text-base font-bold [text-shadow:0_0_4px_rgba(0,0,0,0.50)]">
                        오늘의 관광지 추천
                    </h3>

                    {isLoading && <p className="text-white text-sm">불러오는 중...</p>}
                    {isError && <p className="text-white text-sm">관광지 정보를 불러오지 못했습니다.</p>}

                    {todaySpots && (
                        <div className="flex gap-[11px] overflow-x-auto -mx-4 px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {todaySpots.map((spot) => (
                                <SpotCard key={spot.id} spot={spot} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}