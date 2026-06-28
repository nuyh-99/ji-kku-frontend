# 협업 규칙 (Ji-kku)

> 이 문서는 frontend / backend 두 레포에 동일하게 넣어두세요.

## 브랜치 전략 — GitHub Flow

- `main` 은 **항상 동작하는 상태**로 유지합니다. 직접 push 하지 않고 PR로만 머지합니다.
- 모든 작업은 `main` 에서 **새 브랜치를 따서** 진행합니다.
- 머지가 끝난 브랜치는 삭제합니다.

### 브랜치 이름: `종류/내용`

| 종류 | 용도 | 예시 |
|---|---|---|
| `feature` | 새 기능 | `feature/map-fill` |
| `fix` | 버그 수정 | `fix/login-error` |
| `refactor` | 리팩터링 | `refactor/photo-store` |
| `docs` | 문서 | `docs/readme` |
| `chore` | 설정·잡일 | `chore/eslint-config` |

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
