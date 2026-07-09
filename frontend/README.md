# Ji-kku · Frontend

관광데이터 공모전 출품작 **Ji-kku**의 프론트엔드 레포입니다.
강원 지역을 중심으로 여행지를 둘러보고, 방문을 지도에 기록하며, 활동으로 업적을 모으는 **Next.js 기반 웹앱**입니다.

> 이 레포의 실제 프로젝트는 `frontend/` 폴더 안에 있습니다. 아래 명령은 모두 `frontend/` 에서 실행하세요.

## 1. 프로젝트 소개

- 관광데이터 공모전 프론트엔드 프로젝트
- 여행 기록 · 지도 · 업적 · 커뮤니티 기능을 제공하는 Next.js 웹앱
- 현재는 **화면 개발용 초기 세팅** 단계로, 각 페이지는 placeholder 이며 mock 데이터로 동작합니다.

## 2. 기술 스택

- **Next.js** (App Router) + **React**
- **TypeScript**
- **Tailwind CSS**
- **ESLint**
- import alias: `@/*` → `src/*`

> 지도(카카오 지도 SDK), 상태관리 등 추가 라이브러리는 각 담당이 기능 구현 시 필요에 따라 도입합니다.

## 3. 실행 방법

```bash
cd frontend

# 1) 패키지 설치
npm install

# 2) 환경변수 설정 (아래 7번 참고)
cp .env.example .env.local   # 값은 각자 채우기, .env.local 은 커밋 금지

# 3) 개발 서버 실행
npm run dev                  # http://localhost:3000
```

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint 검사 |

## 4. 폴더 구조

```
frontend/
  src/
    app/                     # App Router 라우팅 + 페이지
      page.tsx               # / (라우트 허브 / 랜딩)
      login/  home/  mypage/
      map/                   # 지도
      event-regions/         # 추천·이벤트 지역
      spots/[id]/            # 관광지 상세
      records/  achievements/
      notices/ contact/ events/
    components/
      common/                # Button, Card, PagePlaceholder 등 공용
      layout/                # Header, BottomNav
      map/  spot/  record/  achievement/  board/   # 도메인별 (비어 있음, 담당이 채움)
    data/                    # 화면 개발용 mock 데이터 (mock-*.ts)
    types/                   # 공용 타입 (tourism/user/record/achievement/board)
  public/                    # 정적 파일
  .env.example               # 환경변수 예시 (실제 값 금지)
```

- 공용으로 쓰는 화면 placeholder 는 `components/common/PagePlaceholder.tsx` 입니다. 담당 페이지에서 이 컴포넌트를 걷어내고 실제 화면을 구현하세요.
- `Header`, `BottomNav` 는 만들어만 두었고 모든 페이지에 강제 적용하지 않았습니다. 필요할 때 불러 쓰세요.

## 5. 역할분담

| 담당 | 영역 | 라우트 |
|---|---|---|
| **A** | 지도 핵심 기능 | `/map`, 지도 → `/spots/[id]` 이동 |
| **B** | 관광지 · 기록 · 업적 | `/event-regions`, `/spots/[id]`, `/records`, `/achievements` |
| **C** | 기본 서비스 · 커뮤니티 | `/`, `/login`, `/home`, `/mypage`, `/notices`, `/contact`, `/events` |

## 6. 브랜치 전략 (예시)

`main` 은 항상 동작하는 상태로 두고, 각자 기능 브랜치에서 작업 후 PR로 머지합니다.

- `feat/map` — A: 지도
- `feat/tourism-record` — B: 관광지 / 기록 / 업적
- `feat/layout-pages` — C: 기본 페이지 / 커뮤니티

> 브랜치·커밋·PR 상세 규칙은 [`CONTRIBUTING.md`](./CONTRIBUTING.md) 를 참고하세요.

## 7. 환경변수 사용법

- `.env.example` 를 복사해 `.env.local` 을 만들고 값을 채웁니다.
- **`NEXT_PUBLIC_` 접두사가 붙은 변수만 브라우저에 노출**됩니다.
- 실제 API 키·토큰 같은 **비밀값은 `.env.local` 에만** 작성합니다.
- **`.env.local` 은 절대 커밋하지 마세요.** (`.gitignore` 에 이미 제외되어 있습니다. `.env.example` 만 추적됩니다.)
