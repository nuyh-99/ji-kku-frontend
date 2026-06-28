# Ji-kku · Frontend

강원도 지도를 내 여행 사진으로 채워 나가고, 일정 기준을 달성하면 실물 다이어리로 소장하는 여행 아카이빙 웹앱 **Ji-kku**의 프론트엔드 레포입니다.

## 기술 스택

- **React + Next.js (App Router) + TypeScript**
- 상태관리: **Zustand**
- 서버 상태/캐싱: **TanStack Query**
- 개인 수집 지도: **SVG 폴리곤 + `clipPath`** (사진을 지역 경계 모양대로 채움)
- 지도 확대/이동: **react-zoom-pan-pinch**
- 명소추천 지도: **카카오 지도 SDK**
- 이미지 압축: **browser-image-compression**

## 시작하기

```bash
# 1. 클론
git clone https://github.com/<조직or계정>/ji-kku-frontend.git
cd ji-kku-frontend

# 2. 패키지 설치
npm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 값을 채워주세요 (아래 '환경변수' 참고)

# 4. 개발 서버 실행
npm run dev
```

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 (next dev) |
| `npm run build` | 프로덕션 빌드 (next build) |
| `npm run start` | 빌드 결과 실행 (next start) |
| `npm run lint` | ESLint 검사 (next lint) |

## 폴더 구조 (제안)

App Router를 쓰되, 기능을 도메인별로 묶어 담당이 자기 영역 안에서 작업하도록 구성했습니다.

```
src/
  app/          # 라우팅 (App Router) — layout.tsx, page.tsx
  components/   # 공용 컴포넌트
  features/
    map/        # 전체/세부 지도, clipPath 채우기 (담당: 김수빈)
    record/     # 사진·일기 등록, 사진 그리드, 다이어리 (담당: 강수연)
    explore/    # 온보딩, 명소추천, 미션·배지 (담당: 박태현)
  store/        # zustand 스토어
  lib/          # api 클라이언트, 공용 유틸(이미지 압축 등)
  types/        # 공용 타입
public/
  boundaries/   # 강원 시·군/읍면동 경계 SVG 등 정적 데이터
```

> Next.js에서 이미지·SVG 같은 **정적 파일은 `public/`** 에 둡니다. 경계 SVG도 여기에 넣고 `/boundaries/...` 경로로 불러옵니다.

## 클라이언트 컴포넌트 주의

Next.js는 기본이 **서버 컴포넌트**입니다. 하지만 지도 인터랙션, 사진 업로드, EXIF 읽기, 위치(GPS) 접근, react-zoom-pan-pinch 등 **브라우저 API를 쓰는 컴포넌트는 파일 맨 위에 `"use client"`** 를 선언해야 동작합니다. 우리 서비스의 지도·기록 화면은 대부분 클라이언트 컴포넌트가 됩니다.

## 환경변수

`.env.example` 를 복사해 `.env.local` 로 만들고 값을 채웁니다. **`NEXT_PUBLIC_` 접두사가 붙은 변수만 브라우저에 노출**되고, 접두사가 없으면 서버 사이드에서만 접근됩니다. **`.env.local` 은 절대 커밋하지 마세요.**

## 협업 규칙

브랜치·커밋·PR 규칙은 [`CONTRIBUTING.md`](./CONTRIBUTING.md) 를 참고하세요. 요약: `main` 직접 push 금지, `feature/...` 브랜치에서 작업 후 PR 1명 승인 머지.
