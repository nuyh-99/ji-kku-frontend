// frontend/src/features/notice/components/SpecificNotice.tsx
'use client';

import { useRouter } from 'next/navigation';

interface NoticeDetail {
    id: string;
    title: string;
    date: string;
    body: string;
}

const noticeDetails: NoticeDetail[] = [
    {
        id: '1',
        title: '이벤트 게시판 서비스 점검 안내',
        date: '2026.06.25 17:00',
        body: `안녕하세요 지꾸 운영팀 입니다.
보다 안정적인 서비스 제공을 위해 아래와 같이 이벤트 게시판 서비스 점검을 진행할 예정입니다. 점검 시간 동안에는 이벤트 게시판 열람 및 참여가 일시적으로 제한되오니 이용에 참고 부탁드립니다.

■ 점검 일시
2026년 6월 28일(일) 02:00 ~ 06:00 (4시간)
■ 점검 대상
이벤트 게시판 전체 서비스 (이벤트 목록, 상세 페이지, 응모 기능)
■ 점검 사유
서버 안정화 및 신규 이벤트 시스템 업데이트 적용

점검 시간은 작업 진행 상황에 따라 다소 변동될 수 있습니다. 이용에 불편을 드려 죄송하며, 더 나은 서비스로 찾아뵙겠습니다.
감사합니다.

운영팀 드림`,
    },
    {
        id: '2',
        title: '지꾸 버전 업데이트 안내',
        date: '2026.02.18 16:23',
        body: `안녕하세요 지꾸 운영팀 입니다.
지꾸가 새로운 버전으로 업데이트되었습니다. 이번 업데이트에서 달라진 점을 안내드립니다.

■ 주요 업데이트 내용
- 지도 꾸미기 스티커 20종 신규 추가
- 마이페이지 UI 개선으로 더 편리해진 정보 관리
- 여행 기록 저장 시 발생하던 오류 수정
- 앱 실행 속도 개선
■ 적용 방법
스토어에서 최신 버전으로 업데이트 후 이용해 주세요.

앞으로도 더 좋은 지꾸를 만들기 위해 꾸준히 개선해 나가겠습니다. 이용해 주셔서 감사합니다.

운영팀 드림`,
    },
    {
        id: '3',
        title: "새로운 지도 꾸미기 서비스 '지꾸'를 소개합니다",
        date: '2025.04.25 08:13',
        body: `안녕하세요 지꾸 운영팀 입니다.
나만의 지도를 꾸미고 여행의 기록을 남기는 새로운 서비스, 지꾸를 소개합니다.

■ 지꾸란?
지꾸는 내가 다녀온 여행지를 지도 위에 기록하고, 스티커와 사진으로 나만의 지도를 꾸밀 수 있는 서비스입니다. 친구들과 여행 기록을 공유하며 다음 여행지를 함께 계획할 수도 있습니다.
■ 이런 기능이 있어요
- 방문한 지역을 지도에 표시하고 기록 남기기
- 다양한 스티커로 나만의 지도 꾸미기
- 추천 여행지와 이벤트 정보 확인하기
- 친구와 지도를 공유하고 함께 계획 세우기

앞으로 지꾸와 함께 더 즐거운 여행을 만들어가시길 바랍니다. 많은 관심과 이용 부탁드립니다.

운영팀 드림`,
    },
];

interface SpecificNoticeProps {
    id: string;
}

export function SpecificNotice({ id }: SpecificNoticeProps) {
    const router = useRouter();

    const goBack = () => router.back();
    const onMenu = () => console.log('메뉴 클릭');
    const onBackToList = () => router.push('/notices');

    const notice = noticeDetails.find((item) => item.id === id);

    if (!notice) {
        return (
            <div className="w-full mx-auto min-h-screen bg-[#DCE7E6] flex flex-col items-center justify-center">
                <p className="text-black font-[Pretendard,sans-serif] text-base">
                    존재하지 않는 공지입니다.
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
                    공지사항
                </h1>
            </div>

            <div className="px-[26px] py-5 flex flex-col gap-[3px]">
                <span className="text-black font-[Pretendard,sans-serif] h-[19px] text-[16px] font-bold not-italic leading-normal">
                    {notice.title}
                </span>
                <span className="text-[#8B8B8B] font-[Pretendard,sans-serif] h-[17px] text-[12px] font-normal not-italic leading-normal">
                    {notice.date}
                </span>
            </div>

            <div className=" mx-[19px] border-t-1 border-[#D1D1D6]" />

            <div className="px-[19px] pt-[39px] pb-[29px]">
                <p className="text-[#444] font-[Pretendard,sans-serif] text-[15px] font-400 not-italic leading-relaxed whitespace-pre-line">
                    {notice.body}
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