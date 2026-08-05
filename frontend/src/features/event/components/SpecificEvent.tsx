// frontend/src/features/event/components/SpecificEvent.tsx
'use client';

import { useRouter } from 'next/navigation';

interface EventDetail {
    id: string;
    title: string;
    date: string;
    body: string;
}

const eventDetails: EventDetail[] = [
    {
        id: '1',
        title: "'다이어리 이벤트' 당첨자 발표",
        date: '2026.06.25 17:00',
        body: `안녕하세요 지꾸 운영팀 입니다.
많은 관심과 참여를 보내주신 '다이어리 이벤트'의 당첨자를 발표합니다.

■ 당첨자 발표
여행지도러버 (trav*****@naver.com)
지도꾸미기왕 (ma*****@gmail.com)
서울투어리스트 (se*****@daum.net)
바다냄새조아 (oc*****@naver.com)
산책하는고양이 (ca*****@gmail.com)
제주도민되기 (je*****@naver.com)
지꾸매니아 (ji*****@gmail.com)
동네한바퀴 (wa*****@daum.net)
스티커수집가 (st*****@naver.com)
여행기록장인 (re*****@gmail.com)

■ 경품 발송 안내
당첨자 분들 각각의 메일로 관련 안내사항과 파일을 첨부했습니다. 당첨자 개인정보 수집 동의 후, 순차적으로 경품을 발송해 드릴 예정입니다.

앞으로도 더 다양한 이벤트로 찾아뵙겠습니다. 참여해 주신 모든 분들께 감사드립니다.

운영팀 드림`,
    },
    {
        id: '2',
        title: "'나만의 지도 자랑하기 이벤트' 안내",
        date: '2026.06.11 17:03',
        body: `안녕하세요 지꾸 운영팀 입니다.
나만의 스타일로 꾸민 지도를 자랑하는 '나만의 지도 자랑하기 이벤트'를 진행합니다.

■ 이벤트 기간
2026년 6월 15일(월) ~ 2026년 6월 30일(화)
■ 참여 방법
1. 내 지도를 스티커와 사진으로 자유롭게 꾸미기
2. 지도를 캡처하여 인스타그램(공개계정 한정)에 업로드
3. 해시태그 #지꾸 #나만의지도 포함
■ 경품
베스트 지도 선정 10명에게 한정판 지꾸 굿즈 증정

여러분의 창의적인 지도를 기대하겠습니다. 많은 참여 부탁드립니다.

운영팀 드림`,
    },
    {
        id: '3',
        title: "'다이어리 이벤트' 안내",
        date: '2026.04.25 13:42',
        body: `안녕하세요 지꾸 운영팀 입니다.
여행의 기록을 더 특별하게 남길 수 있는 '다이어리 이벤트'를 진행합니다.

■ 이벤트 기간
2026년 4월 28일(화) ~ 2026년 5월 12일(화)
■ 참여 방법
1. 지꾸 앱에서 MY MAP 방문률 70%이상 달성
2. 방문률 70%이상 달성시 자동으로 응모 완료!
■ 경품
추첨을 통해 지꾸 오리지널 다이어리 증정 (총 10명)

많은 참여 부탁드립니다. 감사합니다.

운영팀 드림`,
    },
    {
        id: '4',
        title: "'한정판 배지 이벤트' 당첨자 발표",
        date: '2026.01.17 18:00',
        body: `안녕하세요 지꾸 운영팀 입니다.
많은 관심과 참여를 보내주신 '한정판 배지 이벤트'의 당첨자를 발표합니다.

■ 당첨자 발표
내 업적 >  배지 페이지를 확인해주세요. 당첨자는 1/16일 자정 기준 자동으로 배지가 추가되어있습니다.

앞으로도 더 다양한 이벤트로 찾아뵙겠습니다. 참여해 주신 모든 분들께 감사드립니다.

운영팀 드림`,
    },
    {
        id: '5',
        title: "'한정판 배지 이벤트' 안내",
        date: '2025.12.17 13:11',
        body: `안녕하세요 지꾸 운영팀 입니다.
연말을 맞아 지꾸 사용자 여러분께 감사한 마음을 담아 '한정판 배지 이벤트'를 진행합니다.

■ 이벤트 기간
2025년 12월 20일(토) ~ 2026년 1월 10일(토)
■ 참여 방법
1. 지꾸 앱에서 기간 내에 방문 지역 5곳 이상 기록
2. 5곳 이상 기록시 자동으로 응모 완료!
■ 경품
추첨을 통해 연말 한정판 배지 증정 (총 100명)

많은 참여 부탁드립니다. 감사합니다.

운영팀 드림`,
    },
];

interface SpecificEventProps {
    id: string;
}

export function SpecificEvent({ id }: SpecificEventProps) {
    const router = useRouter();

    const goBack = () => router.push('/events');
    const onMenu = () => router.push('/mypage');
    const onBackToList = () => router.push('/events');

    const event = eventDetails.find((item) => item.id === id);

    if (!event) {
        return (
            <div className="w-full mx-auto min-h-screen bg-[#DCE7E6] flex flex-col items-center justify-center">
                <p className="text-black font-[Pretendard,sans-serif] text-base">
                    존재하지 않는 이벤트입니다.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto min-h-screen bg-white flex flex-col">
            <div className="w-full min-h-30 bg-white flex flex-col">
                <div className="relative w-full flex items-center px-[17px] pt-11 pb-[6px]">
                    <button
                        onClick={goBack}
                        aria-label="뒤로가기"
                        className="bg-transparent p-0 rounded-full inline-flex items-center justify-center transition-colors duration-200 "
                    >
                        <img src="/assets/chevron-left.svg" className="w-[28px] h-[28px] block" />
                    </button>

                    <button
                        onClick={onMenu}
                        aria-label="메뉴"
                        className="absolute right-4 bg-transparent p-0 rounded-full inline-flex items-center justify-center transition-colors duration-200 hover:bg-black/5"
                    >
                        <img src="/assets/menu.png" className="w-[28px] h-[28px] block" />
                    </button>
                </div>

                <h1 className="text-black text-center font-[Pretendard,sans-serif] text-[18px] font-bold not-italic leading-normal pb-[20px]">
                    이벤트 게시판
                </h1>
            </div>

            <div className="px-[26px] py-5 flex flex-col gap-[3px]">
                <span className="text-black font-[Pretendard,sans-serif] h-[19px] text-[16px] font-bold not-italic leading-normal">
                    {event.title}
                </span>
                <span className="text-[#8B8B8B] font-[Pretendard,sans-serif] h-[17px] text-[12px] font-normal not-italic leading-normal">
                    {event.date}
                </span>
            </div>

            <div className=" mx-[19px] border-t-1 border-[#D1D1D6]" />

            <div className="px-[19px] pt-[39px] pb-[29px]">
                <p className="text-[#444] font-[Pretendard,sans-serif] text-[15px] font-400 not-italic leading-relaxed whitespace-pre-line">
                    {event.body}
                </p>
            </div>

            <div className="px-[19px] pb-8">
                <button
                    onClick={onBackToList}
                    className="bg-[#DCE7E6]/45 text-[#6CA59C] rounded-[5px] px-[9px] py-[7px] text-[14px] font-[Pretendard,sans-serif] font-400 not-italic leading-normal transition-opacity duration-200"
                >
                    목록으로 돌아가기
                </button>
            </div>
        </div>
    );
}