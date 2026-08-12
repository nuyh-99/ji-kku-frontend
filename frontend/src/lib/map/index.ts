// lib/map/regions/index.ts
export function getRegionProjector(sigunguCd: string): ((lon: number, lat: number) => { x: number; y: number }) | null {
  switch (sigunguCd) {
    // case "51830": return projectYangyangGps;  // 아직 계수 미확정
    default:
      return null;
  }
}