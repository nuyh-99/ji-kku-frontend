// 기록 작성 → 지도 표시 인수인계 (디자인 794:3117 "표시하기" → 566:2034 "등록 완료").
//
// 기록 작성 화면(features/records)과 지도(features/map)는 서로 import 할 수 없다
// (feature 간 교차 import 금지). 그래서 넘길 내용을 공용 최하층인 여기에 정의하고
// sessionStorage 로 건넨다.
//
// 넘기는 건 **서버가 발급한 travelPostId 뿐**이다 — 기록 본문은 이미 서버에 저장돼 있고,
// 지도는 POST /map-design/{sigunguCd}/travel-post 로 카드를 붙인 뒤 서버에서 다시 읽는다.
// (제목·사진을 같이 넘기던 초안 시절 구조를 걷어냈다: 그때는 저장이 서버로 가지 않아서
//  화면에 뿌릴 값을 직접 들고 가야 했다.)
//
// sessionStorage 를 쓰는 건 이 값이 한 번 쓰고 버리는 인수인계이기 때문이다(영속 데이터 아님).

const KEY = "jikku:map-display-handoff";

/** 지도에 카드로 띄울 기록 한 건. */
export interface MapDisplayHandoff {
  /** 서버가 발급한 기록 id. 지도 카드 배치 요청의 travelPostId 로 그대로 쓴다. */
  travelPostId: number;
  /** 어느 시군구 지도에 놓을지. */
  sigunguCd: string;
  /** 어느 읍·면·동에 놓을지. 카드 초기 위치를 그 지역 라벨 근처로 잡는 데 쓴다. */
  eupmyeondongCd: string;
}

/** 지도로 넘길 기록을 적어둔다. */
export function putMapDisplayHandoff(handoff: MapDisplayHandoff) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(handoff));
}

/** 넘어온 값이 지금 구조에 맞는지. 예전 배포에서 남은 초안 형태(recordId 문자열)를 걸러낸다. */
function isHandoff(value: unknown): value is MapDisplayHandoff {
  if (typeof value !== "object" || value === null) return false;
  const { travelPostId, sigunguCd, eupmyeondongCd } = value as Partial<MapDisplayHandoff>;
  return (
    typeof travelPostId === "number" &&
    Number.isFinite(travelPostId) &&
    typeof sigunguCd === "string" &&
    typeof eupmyeondongCd === "string"
  );
}

/**
 * 넘어온 기록을 꺼낸다. **꺼내면서 지운다** — 지도를 다시 열 때마다 같은 카드가
 * 또 생기면 안 되기 때문이다.
 */
export function takeMapDisplayHandoff(): MapDisplayHandoff | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(KEY);
  try {
    const parsed: unknown = JSON.parse(raw);
    // 손상되거나 옛 구조인 값은 조용히 버린다 — 이미 지웠으므로 다음 진입은 정상이다.
    return isHandoff(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
