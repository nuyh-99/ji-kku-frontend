'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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
const SLOT_HEIGHT = 84; // 문구 한 개가 차지하는 슬롯 높이

export function Login() {
    const router = useRouter();

    // 무한 루프
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
        if (index === SLOGANS.length) {
            const resetTimer = setTimeout(() => {
                setWithTransition(false);
                setIndex(0);
            }, TRANSITION_MS);
            return () => clearTimeout(resetTimer);
        }
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
        // 바깥 래퍼: 데스크탑에서 화면 전체를 채우는 회색 배경 + 가운데 정렬
        <div className="min-h-screen w-full bg-gray-200 flex justify-center">
            {/* 폰 프레임: 모바일 화면 너비로 고정 */}
            <div className="relative min-h-screen w-full max-w-[430px] overflow-hidden shadow-xl">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/assets/landing-bg.jpg')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/50" />

                <div className="relative z-10 flex flex-col min-h-screen">
                    <div className="h-11" />
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
                    <div className="mt-auto px-[46px] pb-[50px] flex flex-col items-center gap-3">
                        <button
                            onClick={handleKakaoLogin}
                            className="w-[300px] h-[45px] max-w-[calc(100vw-48px)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
                        >
                            <img src="/assets/kakao_login_medium_wide.png" alt="카카오 로그인" className="w-full h-full block" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}