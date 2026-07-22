# 강원도 시·군 경계 데이터

이 폴더는 지도(map) 도메인이 사용할 **강원 시·군 경계 데이터**가 들어가는 자리입니다.

## 상태: 형식 확정 — 사전계산 SVG path

경계 포맷은 **사전계산된 SVG path 문자열**로 확정했습니다.

- 렌더러(`@/components/map/GangwonMapSvg`)가 소비하는 `@/types/map` 의 `RegionShape { code; name; d }` 형태로 저장합니다.
- 좌표 변환/투영 파이프라인이 런타임에 필요 없어 렌더가 단순합니다.
- (검토했던 GeoJSON / TopoJSON 은 표준·경량이지만 SVG path 변환 단계가 추가로 필요해 이번 범위에서는 제외.)

## 현재 데이터

- `gangwon.ts` — 강원 18개 시·군의 `RegionShape[]`(`GANGWON_REGIONS`) + `GANGWON_VIEW_BOX`.
  - `code`(행정표준코드)·`name` 은 실제 값.
  - `d` 는 아직 **배치 확인용 placeholder(격자 사각형)**. 지도/선택/z-order 개발·데모용.

## 남은 일

- [x] 포맷/좌표계 확정 → **SVG path (SVG 좌표계)**
- [x] 지역 식별자 키를 `SigunguCode`(`src/features/map/types.ts`)와 정합 → `code` 5자리 코드 사용
- [ ] `gangwon.ts` 의 placeholder `d` 를 **실제 시·군 경계 path** 로 교체(원본 GeoJSON → 투영/단순화 → path 스크립트)
- [ ] 필요 시 `src/features/map/types.ts` 의 `RegionGeometry` placeholder 정리(렌더 형식은 `RegionShape` 로 대체됨)
