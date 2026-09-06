'use client';

import { useRouter } from 'next/navigation';

interface ContactPerson {
    name: string;
    email: string;
}

const CONTACTS: ContactPerson[] = [
    { name: '강준우', email: 'oofrog3000@icloud.com' },
    { name: '강수연', email: 'ksui9210@gmail.com' },
    { name: '김수빈', email: 'ksb1833123@naver.com' },
    { name: '박태현', email: 'pth400@gmail.com' },
    { name: '이재림', email: 'jaelim0429@gmail.com' },
];

export function Contact() {
    const router = useRouter();

    const goBack = () => router.back();

    return (
        // 바깥 래퍼: 데스크탑에서 화면 전체를 채우는 회색 배경 + 가운데 정렬
        <div className="min-h-screen w-full bg-gray-200 flex justify-center">
            {/* 폰 프레임: 모바일 화면 너비로 고정 */}
            <div
                className="min-h-screen w-full max-w-[430px] shadow-xl"
                style={{
                    background: 'linear-gradient(270deg, #6CA59C 0%, #496E68 50%, #293F3C 100%)',
                }}
            >
                {/* 헤더 영역 - 뒤로가기 버튼만 */}
                <div className="px-[17px] pt-11 ">
                    <button
                        onClick={goBack}
                        className="bg-transparent p-0 rounded-full inline-flex items-center justify-center transition-colors duration-200"
                    >
                        <img src="/assets/chevron-left.svg" className="w-[28px] h-[28px] block" alt="" />
                    </button>
                </div>

                <div className="px-[58px] pt-[153px]">
                    <h1 className="text-white text-[24px] font-bold text-center mb-13">
                        Contact
                    </h1>

                    <ul className="flex flex-col gap-[14px]  max-w-[264px] mx-auto">
                        {CONTACTS.map((person) => (
                            <li key={person.email} className="flex h-[21px] gap-[29px]">
                  <span className="h-[21px] w-13 shrink-0 text-white text-[18px] font-normal">
                    {person.name}
                  </span>
                                <span className="h-[21px]text-[18px] font-normal text-white" >{person.email}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}