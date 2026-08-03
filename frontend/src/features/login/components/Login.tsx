'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// 슬라이딩되는 문구 목록 - 슬라이드마다 줄 수와 들여쓰기 정도가 달라서
// 각 줄을 { text, offsetX } 형태로 개별 관리함 (offsetX: 오른쪽으로 밀 픽셀 값)
const SLOGANS = [
    {
        lines: [
            { text: '나만의 추억으로', offsetX: 9 },
            { text: '나만의 지도를 꾸며보세요', offsetX: 50 },
        ],
    },
    {
        lines: [
            { text: '소중한 장소와 순간을', offsetX: 0 },
            { text: '기록해보세요', offsetX: 170 },
        ],
    },
    {
        lines: [
            { text: '특별한 스티커로 장식해 보세요', offsetX: 0 },
        ],
    },
];

const SLIDE_INTERVAL_MS = 3000; // 3초마다 전환
const TRANSITION_MS = 500; // 슬라이드 애니메이션 시간
const SLOT_HEIGHT = 84; // 문구 한 개가 차지하는 슬롯 높이 (26px 폰트 2줄이 여유롭게 들어가는 값)

export function Login() {
    const router = useRouter();

    // 무한 루프처럼 보이게 하려고 배열 끝에 첫 문구를 복사해서 하나 더 붙여둠
    const slides = [...SLOGANS, SLOGANS[0]];

    const [index, setIndex] = useState(0);
    const [withTransition, setWithTransition] = useState(true);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setIndex((prev) => prev + 1);
        }, SLIDE_INTERVAL_MS);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        // 마지막(복사본) 문구까지 슬라이드된 직후,
        // 트랜지션 없이 진짜 0번 위치로 순간이동시켜서 무한 루프처럼 보이게 함
        if (index === SLOGANS.length) {
            const resetTimer = setTimeout(() => {
                setWithTransition(false);
                setIndex(0);
            }, TRANSITION_MS);
            return () => clearTimeout(resetTimer);
        }
        // 순간이동 직후엔 다시 트랜지션을 켜줘야 다음 슬라이드가 자연스럽게 넘어감
        if (!withTransition) {
            const enableTimer = setTimeout(() => setWithTransition(true), 50);
            return () => clearTimeout(enableTimer);
        }
    }, [index, withTransition]);

    const handleGuestLogin = () => {
        router.push('/home');
    };

    const handleKakaoLogin = () => {
        // 카카오 로그인 페이지로 리다이렉트 (실제 REST API 키 / redirect_uri로 교체)
        const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
        const REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;
        window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden ">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/assets/landing-bg.jpg')" }}
            />
            {/* 하단 가독성을 위한 그라데이션 오버레이 (배경 없어도 흰 글씨가 보이게 톤을 살짝 올림) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/50" />

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* 상단 상태바 여백 정도만 확보 (실제 상태바는 OS가 그림) */}
                <div className="h-11" />

                {/* 슬라이딩 문구 영역 - top을 %(화면 높이 비율)로 지정해서
                    화면 크기가 달라져도 배경 사진 속 같은 지점에 항상 위치하도록 함 */}
                <div className="absolute top-[49%] left-0 right-0 flex justify-center">
                    <div className="w-full max-w-[393px] pl-[33px]">
                        <div className="overflow-hidden" style={{ height: SLOT_HEIGHT }}>
                            <div
                                className={withTransition ? 'transition-transform ease-in-out' : ''}
                                style={{
                                    transform: `translateY(-${index * SLOT_HEIGHT}px)`,
                                    transitionDuration: withTransition ? `${TRANSITION_MS}ms` : '0ms',
                                }}
                            >
                                {slides.map((slogan, slideIdx) => (
                                    <div
                                        key={slideIdx}
                                        className="flex flex-col items-start justify-center text-left"
                                        style={{ height: SLOT_HEIGHT }}
                                    >
                                        {slogan.lines.map((line, lineIdx) => (
                                            <p
                                                key={lineIdx}
                                                className="text-white text-[26px] font-700 whitespace-nowrap [text-shadow:0px_6px_4px_rgba(0,0,0,0.5)] leading-[1.4]"
                                                style={{ transform: `translateX(${line.offsetX}px)` }}
                                            >
                                                {line.text}
                                            </p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 로그인 버튼 영역 - 하단 고정, 크기는 화면 폭과 무관하게 항상 동일 */}
                <div className="mt-auto px-[46px] pb-[46px] flex flex-col items-center gap-3">
                    <button
                        onClick={handleKakaoLogin}
                        className="w-[300px] h-[45px] max-w-[calc(100vw-48px)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
                    >
                        <img src="/assets/kakao_login_medium_wide.png" alt="카카오 로그인" className="w-full h-full block" />
                    </button>
                    <button
                        onClick={handleGuestLogin}
                        className="w-[300px] h-[45px] max-w-[calc(100vw-48px)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
                    >
                        <img src="/assets/loginguest.png" alt="게스트 로그인" className="w-full h-full block" />
                    </button>
                </div>
            </div>
        </div>
    );
}