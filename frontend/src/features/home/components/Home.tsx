"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import SpotCard from "@/components/SpotCard";
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
            imageUrl: "/assets/spot-samok.jpg",
        },
        {
            id: "2",
            title: "춘천 청평사 구성폭포",
            overview: "청평사로 올라가는 길목에 구성폭포가 위치해 있다.",
            imageUrl: "/assets/spot-guseong.jpg",
        },
        {
            id: "3",
            title: "정선 병방치 스카이워크",
            overview: "동강 사이에 한반도 모양을 감상할 수 있다.",
            imageUrl: "/assets/spot-byeongbangchi.jpg",
        },
        {
            id: "4",
            title: "영금정 전망대",
            overview: "해상 정자에서 펼쳐진 바다를 바라볼 수 있는 일출 명소",
            imageUrl: "/assets/spot-yeonggeumjeong.jpg",
        },
    ];

    const onDecorateMap = () => router.push("/mypage/map");
    const onEventArea = () => router.push("/event");
    const onMyAchievement = () => router.push("/mypage/achievement");
    const onMyRecord = () => router.push("/mypage/record");

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            <div
                className="absolute inset-0  bg-cover bg-center  scale-110"
                style={{ backgroundImage: "url('/assets/landing-bg-blur.png')" }}
            />

            <div className="relative flex flex-col gap-4 px-4 py-11">
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

                <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-[#6CA59C]"
                            style={{
                                background: `conic-gradient(#0d9488 ${percent * 3.6}deg, #e5e7eb 0deg)`,
                            }}
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xs">
                                {percent}%
                            </div>
                        </div>
                        <p className="text-sm">
                            <span className="text-base font-bold">{visitedCount}</span>
                            /{totalCount}
                            <br />
                            <span className="text-gray-500">방문 시군</span>
                        </p>
                    </div>

                    <button
                        onClick={onDecorateMap}
                        className="flex items-center gap-1 rounded-full bg-[#6CA59C] px-4 py-2 text-sm font-medium text-white"
                    >
                        내 지도 꾸미러 가기
                        <span>›</span>
                    </button>
                </div>
            </div>

            {/* 퀵메뉴 버튼 3개 */}
            <div className="flex gap-2">
                <button
                    onClick={onEventArea}
                    className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#6CA59C] py-3 text-sm font-medium text-white"
                >
                    이벤트 지역
                    <span>›</span>
                </button>
                <button
                    onClick={onMyAchievement}
                    className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#6CA59C] py-3 text-sm font-medium text-white"
                >
                    내 업적
                    <span>›</span>
                </button>
                <button
                    onClick={onMyRecord}
                    className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#6CA59C] py-3 text-sm font-medium text-white"
                >
                    내 기록
                    <span>›</span>
                </button>
            </div>

            {/* 오늘의 관광지 추천 — SpotCard 컴포넌트 재사용 */}
            <section>
                <h3 className="mb-3 text-base font-bold">오늘의 관광지 추천</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {todaySpots.map((spot) => (
                        <SpotCard key={spot.id} spot={spot} />
                    ))}
                </div>
            </section>
            </div>
        </div>
    );
}