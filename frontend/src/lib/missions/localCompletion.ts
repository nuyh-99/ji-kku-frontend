// 백엔드 방문 인증(위치 검증)이 아직 불안정해서, react-query 캐시에만 낙관적으로 반영해두면
// staleTime(60초)이 지나거나 다른 페이지를 갔다 오면서 리페치될 때 다시 미완료로 덮어써진다.
// 그래서 인증 완료 시점을 localStorage에도 남겨서, 지역 지도 페이지가 이 기록과 실제 서버
// 데이터를 합쳐서 게이지에 반영하게 한다.
const STORAGE_KEY = "locallyCompletedMissionSpotIds";

export function getLocallyCompletedMissionSpotIds(): Set<number> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

/** 방문 인증 팝업을 띄우는 시점에 호출한다. */
export function markMissionSpotCompleted(missionSpotId: number): void {
  if (typeof window === "undefined") return;

  const completed = getLocallyCompletedMissionSpotIds();
  if (completed.has(missionSpotId)) return;

  completed.add(missionSpotId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}
