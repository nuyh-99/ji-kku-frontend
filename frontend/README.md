# Ji-kku · Frontend

관광데이터 공모전 출품작 **Ji-kku**의 프론트엔드 레포입니다.
강원 지역을 중심으로 여행지를 둘러보고, 방문을 지도에 기록하며, 활동으로 업적을 모으는 **Next.js 기반 웹앱**입니다.

> 이 레포의 실제 프로젝트는 `frontend/` 폴더 안에 있습니다. 아래 명령은 모두 `frontend/` 에서 실행하세요.

## 1. 프로젝트 소개

- 관광데이터 공모전 프론트엔드 프로젝트
- 여행 기록 · 지도 · 업적 · 커뮤니티 기능을 제공하는 Next.js 웹앱
- 현재는 **화면 개발용 초기 세팅** 단계로, 각 페이지는 placeholder 이며 mock 데이터로 동작합니다.

## 2. 기술 스택

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4**
- **TanStack Query** — 서버 상태
- **Zustand** — 클라이언트 UI 상태
- **ESLint** + **Prettier**
- import alias: `@/*` → `src/*`

> 지도(카카오 지도 SDK) 등 그 밖의 라이브러리는 각 담당이 기능 구현 시 필요에 따라 도입합니다.

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

| 명령                | 설명                                         |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | 개발 서버 실행                               |
| `npm run build`     | 프로덕션 빌드                                |
| `npm run start`     | 빌드 결과 실행                               |
| `npm run lint`      | ESLint 검사 (레이어 경계 위반도 여기서 잡힘) |
| `npm run typecheck` | 타입 검사                                    |
| `npm run format`    | Prettier 포맷 적용                           |

## 4. 폴더 구조

구조는 **feature-first** 입니다. 도메인 코드는 폴더 종류별로 흩어놓지 않고 `features/<도메인>/` 안에 모아둡니다.

```
frontend/
  src/
    app/                     # App Router 라우팅 + 페이지 (얇게 유지 — feature 컴포넌트 조립만)
      page.tsx               # / (라우트 허브 / 랜딩)
      login/  home/  mypage/
      map/                   # 지도
      event-regions/         # 추천·이벤트 지역
      spots/[id]/            # 관광지 상세
      records/  achievements/
      notices/ contact/ events/
      providers.tsx          # 전역 Provider (QueryProvider 등)
    features/                # ★ 도메인별 코드는 여기에 (담당이 자기 폴더를 만들어 채움)
      map/                   # A 박태현 — 참고용 본보기
        components/          #   해당 feature 전용 컴포넌트
        hooks/               #   Query 훅, store 셀렉터 훅
        store/               #   Zustand 스토어 (클라이언트 UI 상태만)
        api/                 #   이 feature 전용 API 호출
        types.ts             #   이 feature 내부 계약
    components/              # 여러 feature가 함께 쓰는 공용 트리
      common/                # Button, Card, PagePlaceholder
      layout/                # Header, BottomNav
      map/                   # GangwonMapSvg — map·home 두 feature가 공유해서 여기 있음
    lib/                     # 공용 최하층 (누구나 import 가능)
      api/                   # apiFetch 클라이언트, 도메인별 API 함수, 에러코드·응답 타입
      query/                 # QueryClient 기본값, QueryProvider
    data/                    # 순수 데이터 leaf (mock-*.ts, regions/)
    types/                   # data의 mock이 함께 쓰는 공용 타입
  public/                    # 정적 파일
  .env.example               # 환경변수 예시 (실제 값 금지)
```

### 어디에 둘까

| 무엇을 만드나                                 | 어디에                                     |
| --------------------------------------------- | ------------------------------------------ |
| 내 도메인 안에서만 쓰는 컴포넌트·훅·타입      | **`features/<도메인>/`** ← 기본값          |
| 두 개 이상 feature가 공유하는 도메인 컴포넌트 | `components/<도메인>/`                     |
| 도메인 무관 전역 UI                           | `components/common/`, `components/layout/` |
| API 호출·공용 인프라                          | `lib/`                                     |
| `data/`의 mock이 함께 쓰는 타입               | `types/`                                   |

> 헷갈리면 `features/<도메인>/` 에 두세요. 나중에 다른 feature가 필요로 할 때 `components/` 로 올리면 됩니다.
> 미리 공용에 두는 것보다 늦게 올리는 쪽이 쌉니다.

### import 경계 (ESLint가 강제 — `npm run lint`)

- **`app → features → lib`** 단방향입니다.
- **feature 간 교차 import 금지.** 같은 feature 안에서는 상대경로(`../types`), 다른 레이어는 별칭(`@/lib/...`)을 씁니다.
  - 두 feature가 같은 걸 써야 하면 → `components/` 나 `lib/` 로 올리세요.
- `components/` 는 공용 트리라 `@/features/*` 를 import할 수 없습니다.
- `data/` 는 순수 leaf라 다른 레이어를 import할 수 없습니다 (`@/types` 만 가능).

### 상태 경계

- **TanStack Query = 서버 상태의 단일 출처.** 방문·채움 같은 서버 데이터는 Query 훅에서 직접 읽습니다.
- **Zustand = 클라이언트 UI 상태만.** (예: `mapStore` 는 `selectedSigungu` 만 들고 있음)
- 서버 상태를 스토어로 복제하지 마세요. 두 출처가 갈라집니다.

### 그 밖에

- 각 페이지의 `components/common/PagePlaceholder.tsx` 를 걷어내고 실제 화면을 구현하면 됩니다.
- `Header`, `BottomNav` 는 만들어만 두었고 강제 적용하지 않았습니다. 필요할 때 불러 쓰세요.

## 5. 역할분담

| 담당  | 이름   | 영역                   | 라우트                                                               |
| ----- | ------ | ---------------------- | -------------------------------------------------------------------- |
| **A** | 박태현 | 지도 핵심 기능         | `/map`, 지도 → `/spots/[id]` 이동                                    |
| **B** | 강수연 | 관광지 · 기록 · 업적   | `/event-regions`, `/spots/[id]`, `/records`, `/achievements`         |
| **C** | 김수빈 | 기본 서비스 · 커뮤니티 | `/`, `/login`, `/home`, `/mypage`, `/notices`, `/contact`, `/events` |

## 6. 브랜치 전략 (예시)

`main` 은 항상 동작하는 상태로 두고, 각자 기능 브랜치에서 작업 후 PR로 머지합니다.
브랜치 이름은 `CONTRIBUTING.md` 규칙에 따라 `종류/내용`(kebab-case) 형식을 사용합니다.

- `feature/map` — A 박태현: 지도
- `feature/tourism-record` — B 강수연: 관광지 / 기록 / 업적
- `feature/layout-pages` — C 김수빈: 기본 페이지 / 커뮤니티

> 브랜치·커밋·PR 상세 규칙은 [`CONTRIBUTING.md`](./CONTRIBUTING.md) 를 참고하세요.

## 7. 환경변수 사용법

- `.env.example` 를 복사해 `.env.local` 을 만들고 값을 채웁니다.
- **`NEXT_PUBLIC_` 접두사가 붙은 변수만 브라우저에 노출**됩니다.
- 실제 API 키·토큰 같은 **비밀값은 `.env.local` 에만** 작성합니다.
- **`.env.local` 은 절대 커밋하지 마세요.** (`.gitignore` 에 이미 제외되어 있습니다. `.env.example` 만 추적됩니다.)
