// 백엔드가 방문 인증(위치 검증)을 아직 제대로 완료 처리해주지 못해서, 지역 배지 획득 여부를
// 클라이언트에서도 보조로 기록해둔다. 지역 게이지가 다 찼을 때 markRegionBadgeUnlocked를 부르면,
// achievements 페이지가 이 기록과 실제 GET /badges 응답을 합쳐서 배지를 바로 보여줄 수 있다.
import { masterSigunguList } from "@/data/master-sigungu";
import { regionBadges } from "@/data/region-badges";

const STORAGE_KEY = "locallyUnlockedRegionBadges";

function sigunguCdToBadgeNo(sigunguCd: number): string | undefined {
  const sigungu = masterSigunguList.find((s) => s.sigunguCd === sigunguCd);
  if (!sigungu) return undefined;
  return regionBadges.find((b) => b.name === sigungu.sigunguNm)?.badgeNo;
}

export function getLocallyUnlockedBadgeNos(): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** 지역 게이지가 5/5로 다 찼을 때 호출한다. */
export function markRegionBadgeUnlocked(sigunguCd: number): void {
  if (typeof window === "undefined") return;

  const badgeNo = sigunguCdToBadgeNo(sigunguCd);
  if (!badgeNo) return;

  const unlocked = getLocallyUnlockedBadgeNos();
  if (unlocked.has(badgeNo)) return;

  unlocked.add(badgeNo);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
}
