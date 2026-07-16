# 협업 규칙 (Ji-kku)

> 이 문서는 frontend / backend 두 레포에 동일하게 넣어두세요.

## 브랜치 전략 — GitHub Flow

- `main` 은 **항상 동작하는 상태**로 유지합니다. 직접 push 하지 않고 PR로만 머지합니다.
- 모든 작업은 `main` 에서 **새 브랜치를 따서** 진행합니다.
- 머지가 끝난 브랜치는 삭제합니다.

### 브랜치 이름: `종류/내용`

| 종류       | 용도      | 예시                   |
| ---------- | --------- | ---------------------- |
| `feature`  | 새 기능   | `feature/map-fill`     |
| `fix`      | 버그 수정 | `fix/login-error`      |
| `refactor` | 리팩터링  | `refactor/photo-store` |
| `docs`     | 문서      | `docs/readme`          |
| `chore`    | 설정·잡일 | `chore/eslint-config`  |

- 내용은 영어 소문자 + 하이픈(`kebab-case`)으로 적습니다.

## 커밋 메시지: `종류: 내용`

- `feat:` 새 기능
- `fix:` 버그 수정
- `docs:` 문서
- `style:` 포맷·세미콜론 등 (동작 변화 없음)
- `refactor:` 리팩터링
- `test:` 테스트
- `chore:` 빌드·설정

예시: `feat: 시·군 클릭 시 세부지도로 이동`

## PR 흐름

1. 작업 시작 전 `main` 을 최신으로 당겨옵니다. (`git pull origin main`)
2. 큰 덩어리 대신 **작은 단위로 자주** PR을 올립니다.
3. PR 템플릿을 채웁니다.
4. **리뷰어 1명 승인** 후 머지합니다.
5. 머지 후 작업 브랜치를 삭제합니다.

## 꼭 지킬 것

- `.env` 등 비밀값(**TourAPI 키, JWT 시크릿, 스토리지 키**)은 **절대 커밋하지 않습니다.**
- 공유가 필요하면 `.env.example` 에 **변수 이름만** 적습니다(값은 비워둠).
- 작업 전 항상 `main` 최신화 → 충돌을 작게 유지합니다.

## package.json / package-lock.json 충돌 났을 때

의존성을 추가하면 서로 **같은 위치**(dependencies 목록)에 줄이 들어가서 자주 충돌합니다. 순서는 이렇습니다.

1. **`package.json` 의 충돌 마커만** 손으로 정리합니다. 보통 **양쪽 다 남기는 게** 맞습니다
   (내가 추가한 것도, 남이 추가한 것도 다 필요하니까요).
2. `npm install` 을 돌립니다. **`package-lock.json` 은 건드리지 마세요** — npm 7+ 는 lock 충돌을
   자동으로 병합합니다. 우리 npm 은 11.x 라 그냥 됩니다.
3. `npm run lint && npm run typecheck` 확인 후 커밋합니다.

> ⚠️ **`package-lock.json` 을 지우고 `npm install` 로 다시 만들지 마세요.**
> 모든 의존성이 semver 범위 안에서 최신으로 다시 풀려서, (1) 나만 다른 버전을 쓰게 되고
> (2) PR 에 lock diff 가 수백~수천 줄 붙어 다른 사람과 또 충돌합니다.
> 이미 지워버렸다면 `git checkout origin/main -- package-lock.json` 후 `npm install` 로 되돌립니다.
