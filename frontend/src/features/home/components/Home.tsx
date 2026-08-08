"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import SpotCard from "@/components/SpotCard";
import CircularProgress from "./CircularProgress";
import type { SpotCardData } from "@/types/mapTodaySpot";

export default function Home() {
    const router = useRouter();

    //실제로는 API
    const visitedCount = 6;
    const totalCount = 18;
    const percent = Math.round((visitedCount / totalCount) * 100);

    //오늘의 관광지 추천 데이터도 실제로는 API 응답
    // mapTodaySpot으로 변환해서 (SpotCardData 타입)
    const todaySpots: SpotCardData[] = [
        {
            id: "1",
            title: "영월 삼옥리 호밀밭",
            overview: "붉은 메밀꽃으로 사람들의 발길을 잡는 경치 명소",
            imageUrl: "/assets/spot-samok.png",
        },
        {
            id: "2",
            title: "춘천 청평사 구성폭포",
            overview: "청평사로 올라가는 길목에 구성폭포가 위치해 있다.",
            imageUrl: "/assets/spot-guseong.png",
        },
        {
            id: "3",
            title: "정선 스카이워크",
            overview: "동강 사이에 한반도 모양을 감상할 수 있다.",
            imageUrl: "/assets/spot-byeongbangchi.png",
        },
        {
            id: "4",
            title: "영금정 전망대",
            overview: "해상 정자에서 펼쳐진 바다를 바라볼 수 있는 일출 명소",
            imageUrl: "/assets/spot-arirang.png",
        },
    ];

    const onDecorateMap = () => router.push("/mypage/map");
    const onEventArea = () => router.push("/event");
    const onMyAchievement = () => router.push("/mypage/achievement");
    const onMyRecord = () => router.push("/mypage/record");

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
                    <button aria-label="메뉴 열기">
                        <Image src="/assets/Menu.png" alt="" width={28} height={28} />
                    </button>
                </div>

                {/* MY MAP 카드 */}
                <div className="rounded-[20px] h-100 bg-white/60 shadow-[0_0_4px_0_rgba(0,0,0,0.50)] overflow-hidden ">
                    <h2 className="relative z-10 m-[14px] text-[12.538px] font-bold text-[#6CA59C]">MY MAP</h2>

                    <div className="relative h-64 w-full">
                        <Image
                            src="/assets/mymap.png" //지도부분은 일단 이미지로 하드코딩 (나중에 받아와야함)
                            alt="강원도 지도"
                            fill
                            className="object-contain " //원본비율 유지
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
                            onClick={onDecorateMap}
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
                    <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {todaySpots.map((spot) => (
                            <SpotCard key={spot.id} spot={spot} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}