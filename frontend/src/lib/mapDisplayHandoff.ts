// 기록 작성 → 지도 표시 인수인계 (디자인 794:3117 "표시하기" → 566:2034 "등록 완료").
//
// 기록 작성 화면(features/records)과 지도(features/map)는 서로 import 할 수 없다
// (feature 간 교차 import 금지). 그래서 넘길 내용을 공용 최하층인 여기에 정의하고
// sessionStorage 로 건넨다.
//
// ⚠️ 임시 방편이다. 백엔드가 붙으면 "기록 등록 → 지도 표시" 는 서버가 들고 있게 되고,
//    지도는 mapApi 의 사진 조회로 읽으면 된다. 그때 이 파일을 지운다.
//    (탭을 닫으면 사라지는 sessionStorage 를 쓰는 것도 그래서다 — 영속 데이터가 아니다.)

const KEY = "jikku:map-display-handoff";

/** 지도에 카드로 띄울 기록 한 건. */
export interface MapDisplayHandoff {
  recordId: string;
  /** 어느 시군구 지도에 놓을지. */
  sigunguCd: string;
  /** 어느 읍·면·동에 놓을지. 카드 초기 위치를 그 지역 라벨 근처로 잡는 데 쓴다. */
  eupmyeondongCd: string;
  /** 카드 캡션(기록 제목). */
  title: string;
  /** 카드 사진. 첨부가 없으면 빈 문자열. */
  src: string;
}

/** 지도로 넘길 기록을 적어둔다. */
export function putMapDisplayHandoff(handoff: MapDisplayHandoff) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(handoff));
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
    return JSON.parse(raw) as MapDisplayHandoff;
  } catch {
    // 손상된 값은 조용히 버린다 — 이미 지웠으므로 다음 진입은 정상이다.
    return null;
  }
}
