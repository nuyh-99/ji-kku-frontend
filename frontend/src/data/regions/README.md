# 강원도 읍·면·동 경계 데이터

이 폴더는 지도(map) 도메인이 사용할 **강원도 읍·면·동 경계 데이터**가 들어갈 자리입니다.

## 상태: 형식 미정 (TBD)

데이터 포맷이 아직 확정되지 않았습니다. 후보:

- **GeoJSON** — `FeatureCollection` (지역별 `properties.code` + `geometry`)
- **TopoJSON** — 용량이 작고 위상 공유에 유리
- **사전 계산된 SVG path 문자열** — 렌더 단순, 좌표 변환 불필요

## 정해지면 할 일

- [ ] 포맷/좌표계(위경도 vs SVG 좌표) 확정
- [ ] 지역 식별자 키를 `SigunguCode`(`src/features/map/types.ts`)와 정합
- [ ] 실제 데이터 파일 + 로더 추가
- [ ] `src/features/map/types.ts`의 `RegionGeometry` placeholder를 실제 타입으로 교체

> ⚠️ 형식이 확정되기 전에는 세부 구조/실제 데이터 파일을 만들지 않습니다.
