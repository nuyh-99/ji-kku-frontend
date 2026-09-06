'use client';

import { useRouter } from 'next/navigation';

interface EventItem {
    id: string;
    title: string;
    date: string;
}

const events: EventItem[] = [
    { id: '1', title: '"다이어리 이벤트’ 당첨자 발표', date: '2026.06.25 17:00' },
    { id: '2', title: '‘나만의 지도 자랑하기 이벤트’ 안내', date: '2026.06.11 17:03' },
    { id: '3', title: "‘다이어리 이벤트’ 안내", date: '2026.04.25 13:42' },
    { id: '4', title: "‘한정판 배지 이벤트’ 당첨자 발표", date: '2026.01.17 18:00' },
    { id: '5', title: "‘한정판 배지 이벤트’ 안내", date: '2025.12.17 13:11' },
];

export function Event() {
    const router = useRouter();

    const goBack = () => router.push('/mypage');
    const onMenu = () => router.push('/mypage');
    const onEventClick = (id: string) => router.push(`/events/${id}`);

    return (
        // 바깥 래퍼: 데스크탑에서 화면 전체를 채우는 회색 배경 + 가운데 정렬
        <div className="min-h-screen w-full bg-gray-200 flex justify-center">
            {/* 폰 프레임: 모바일 화면 너비로 고정 */}
            <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#DCE7E6] flex flex-col shadow-xl">
                <div className="w-full min-h-30 bg-white flex flex-col">
                    <div className="relative w-full flex items-center px-[17px] pt-11 pb-[6px]">
                        <button
                            onClick={goBack}
                            className="bg-transparent p-0 rounded-full inline-flex items-center justify-center transition-colors duration-200"
                        >
                            <img src="/assets/chevron-left.svg" className="w-[28px] h-[28px] block" alt="" />
                        </button>

                        <button
                            onClick={onMenu}
                            className="absolute right-4 bg-transparent p-0 rounded-full inline-flex items-center justify-center transition-colors duration-200"
                        >
                            <img src="/assets/Menu.png" className="w-[28px] h-[28px] block" alt="" />
                        </button>
                    </div>

                    <h1 className="text-black text-center font-[Pretendard,sans-serif] text-[18px] font-bold not-italic leading-normal pb-[20px]">
                        이벤트 게시판
                    </h1>
                </div>

                <div className="flex-1 px-[18px] pt-[14px] flex flex-col gap-[10px]">
                    {events.map((event) => (
                        <button
                            key={event.id}
                            onClick={() => onEventClick(event.id)}
                            className="w-full bg-white rounded-[9px] px-[19px] py-[27px] flex flex-col items-start gap-1 text-[16px] text-left transition-opacity duration-200 shadow-sm"
                        >
                            <span className="text-black font-[Pretendard,sans-serif] h-[19px] text-[16px] font-400 not-italic leading-normal">
                                {event.title}
                            </span>
                            <span className="text-[#5F5F5F] font-[Pretendard,sans-serif] h-[17px] text-[12px] font-400 not-italic leading-normal">
                                {event.date}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}