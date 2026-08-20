'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setError('카카오 인가 코드가 없습니다.');
      return;
    }

    const login = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login/kakao`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              redirectUri: `${window.location.origin}/auth/kakao/callback`,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok || !data.isSuccess) {
          throw new Error(data.message || '로그인 요청 실패');
        }

        localStorage.setItem('accessToken', data.result.accessToken);
        localStorage.setItem('refreshToken', data.result.refreshToken);

        router.push('/home');
      } catch (err) {
        console.error(err);
        setError('로그인 중 문제가 발생했습니다.');
      }
    };

    login();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {error}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      로그인 처리 중...
    </div>
  );
}

export default function KakaoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          로그인 처리 중...
        </div>
      }
    >
      <KakaoCallbackContent />
    </Suspense>
  );
}