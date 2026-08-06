"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import SpotCard from "@/components/SpotCard";
import type { SpotCardData } from "@/types/mapTodaySpot";

export default function Home() {
    const router = useRouter();

    // 👉 실제로는 API에서 받아옴
    const visitedCount = 6;
    const totalCount = 18;
    const percent = Math.round((visitedCount / totalCount) * 100);

    // 👉 오늘의 관광지 추천 데이터도 실제로는 API 응답을
    //    mapTodaySpot으로 변환해서 넣게 될 거예요 (SpotCardData 타입)
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
    ];

    const onDecorateMap = () => router.push("/mypage/map");
    const onEventArea = () => router.push("/event");
    const onMyAchievement = () => router.push("/mypage/achievement");
    const onMyRecord = () => router.push("/mypage/record");

    return (
        <div className="w-full min-h-screen bg-[#F5F7F6] flex flex-col gap-4 p-4">
            {/* 상단 메뉴 아이콘 */}
            <div className="flex justify-end">
                <button aria-label="메뉴 열기">
                    <Image src="/assets/menu.png" alt="" width={24} height={24} />
                </button>
            </div>

            {/* MY MAP 카드 */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-lg font-bold text-teal-600">MY MAP</h2>

                <div className="relative h-64 w-full">
                    <Image
                        src="/assets/gangwon-map.png"
                        alt="강원도 지도"
                        fill
                        className="object-contain"
                    />
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-teal-600"
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
                        className="flex items-center gap-1 rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white"
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
                    className="flex flex-1 items-center justify-center gap-1 rounded-full bg-teal-600 py-3 text-sm font-medium text-white"
                >
                    이벤트 지역
                    <span>›</span>
                </button>
                <button
                    onClick={onMyAchievement}
                    className="flex flex-1 items-center justify-center gap-1 rounded-full bg-teal-600 py-3 text-sm font-medium text-white"
                >
                    내 업적
                    <span>›</span>
                </button>
                <button
                    onClick={onMyRecord}
                    className="flex flex-1 items-center justify-center gap-1 rounded-full bg-teal-600 py-3 text-sm font-medium text-white"
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
    );
}