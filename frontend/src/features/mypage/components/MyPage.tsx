'use client';

import { useRouter } from 'next/navigation';

interface MenuItem {
    icon: string;
    label: string;
    bg?: string;
    onClick: () => void;
}

export function MyPage() {
    const router = useRouter();

    const goBack = () => router.back();
    const onEditInfo = () => console.log('정보 수정 클릭');
    const onFaq = () => console.log('FAQ 클릭');
    const onSettings = () => console.log('환경 설정 클릭');
    const onNotice = () => router.push('/notices');
    const onEvent = () => router.push('/events');
    const onMission = () => console.log('진행중인 미션 클릭');
    const onContact = () => router.push('/contact');
    const onLogout = () => router.push('/login')

    const menuItems: MenuItem[] = [
        { icon: '/assets/notice.png', label: '공지사항', onClick: onNotice },
        { icon: '/assets/event.png', label: '이벤트 게시판', onClick: onEvent },
        { icon: '/assets/mission.png', label: '진행중인 미션', onClick: onMission },
        { icon: '/assets/contact.png', label: 'contact', onClick: onContact },
    ];

    return (
        <div className="w-full mx-auto min-h-screen bg-[#DCE7E6] flex flex-col">
            <div className="relative w-full h-[217px] m-0 p-0 z-[1] bg-[linear-gradient(270deg,#6CA59C_0%,#496E68_99.99%,#293F3C_100%)]">
                <button
                    onClick={goBack}
                    aria-label="뒤로가기"
                    className="absolute top-10 left-[26px] bg-transparent border-none cursor-pointer p-1 rounded-full inline-flex items-center justify-center transition-colors duration-200 hover:bg-white/15"
                >
                    <img src="/assets/back.png" className="w-[26px] h-[26px] block" alt="" />
                </button>

                <div className="flex flex-col items-center mt-[70px] gap-0">
                    <div className="w-[60px] h-[60px] rounded-full bg-white overflow-hidden">
                        <img
                            src="/assets/profile-default.png"
                            alt="프로필 사진"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <p className="mt-[14px] mb-[14px] text-white text-center font-[Pretendard,sans-serif] text-base font-normal not-italic leading-normal">
                        수빈 님
                    </p>
                </div>
            </div>

            <div className="flex-1 px-5 py-0 -mt-10 flex flex-col gap-3 z-[2]">
                <div className="bg-white rounded-[9px] grid h-[83px] grid-cols-3 py-[17px] items-center divide-x divide-[#D9D9D9]">
                    <button
                        onClick={onEditInfo}
                        className="w-full bg-transparent flex h-[49px] flex-col items-center justify-center gap-0.5"
                    >
                        <img src="/assets/edit.png" className="w-6 h-6" alt="" />
                        <span className="text-black text-center font-[Pretendard,sans-serif] text-sm font-normal not-italic leading-normal">
                            정보 수정
                        </span>
                    </button>
                    <button
                        onClick={onFaq}
                        className="w-full bg-transparent flex h-[49px] flex-col items-center justify-center gap-0.5"
                    >
                        <img src="/assets/FAQ.png" className="w-6 h-6" alt="" />
                        <span className="text-black text-center font-[Pretendard,sans-serif] text-sm font-normal not-italic leading-normal">
                            FAQ
                        </span>
                    </button>
                    <button
                        onClick={onSettings}
                        className="w-full bg-transparent  flex h-[49px] flex-col items-center justify-center gap-0.5"
                    >
                        <img src="/assets/settings.png" className="w-6 h-6" alt="" />
                        <span className="text-black text-center font-[Pretendard,sans-serif] text-sm font-normal not-italic leading-normal">
                            환경 설정
                        </span>
                    </button>
                </div>

                <div className="bg-white rounded-[9px] overflow-hidden">
                    {menuItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={item.onClick}
                            className="w-full flex items-center gap-2 px-[22px] py-[18px] relative text-left transition-colors duration-200 [&:not(:last-child)]:after:content-[''] [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:bottom-0 [&:not(:last-child)]:after:left-[27px] [&:not(:last-child)]:after:right-[27px] [&:not(:last-child)]:after:h-px [&:not(:last-child)]:after:bg-[#D9D9D9]"
                        >
                            <span
                                className="w-6 h-6 flex items-center justify-center rounded-md shrink-0"
                                style={{ background: item.bg || 'transparent' }}
                            >
                                <img src={item.icon} alt="" className="w-6 h-6 object-contain" />
                            </span>
                            <span className="flex-1 text-black font-[Pretendard,SansSerif] text-sm font-normal not-italic leading-normal">
                                {item.label}
                            </span>
                            <img
                                src="/assets/Vector-right.png"
                                alt=""
                                className="w-[6px] h-3 shrink-0 object-contain"
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-[22px] py-5">
                <button
                    onClick={onLogout}
                    className="w-full h-12 px-16 rounded-[61px] bg-[#6CA59C] text-white flex justify-center items-center text-lg font-bold not-italic leading-normal transition-opacity duration-200"
                >
                    로그아웃
                </button>
            </div>
        </div>
    );
}