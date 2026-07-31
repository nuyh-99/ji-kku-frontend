'use client';

import { useRouter } from 'next/navigation';

interface NoticeItem {
    id: string;
    title: string;
    date: string;
}

const notices: NoticeItem[] = [
    { id: '1', title: '이벤트 게시판 서비스 점검 안내', date: '2026.06.26 16:00' },
    { id: '2', title: '지꾸 버전 업데이트 안내', date: '2026.02.18 16:23' },
    { id: '3', title: "새로운 지도 꾸미기 서비스 '지꾸'를 소개합니다", date: '2025.04.25 08:13' },
];

export function Notice() {
    const router = useRouter();

    const goBack = () => router.back();
    const onMenu = () => console.log('메뉴 클릭');
    const onNoticeClick = (id: string) => router.push(`/notices/${id}`);

    return (
        <div className="w-full mx-auto min-h-screen bg-[#DCE7E6] flex flex-col">
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
                    공지사항
                </h1>
            </div>

            <div className="flex-1 px-[18px] pt-[14px] flex flex-col gap-[10px]">
                {notices.map((notice) => (
                    <button
                        key={notice.id}
                        onClick={() => onNoticeClick(notice.id)}
                        className="w-full bg-white rounded-[9px] px-[19px] py-[27px] flex flex-col items-start gap-1 text-[16px] text-left transition-opacity duration-200"
                    >
                        <span className="text-black font-[Pretendard,sans-serif] h-[19px] text-[16px] font-400 not-italic leading-normal">
                            {notice.title}
                        </span>
                        <span className="text-[#5F5F5F] font-[Pretendard,sans-serif] h-[17px] text-[12px] font-400 not-italic leading-normal">
                            {notice.date}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}