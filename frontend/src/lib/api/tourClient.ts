// 한국관광공사 TourAPI 전용 클라이언트.
// 백엔드(apiFetch)와 응답 구조가 달라 별도 래퍼로 둔다:
//   - base URL / 인증(serviceKey) 별개
//   - 응답이 { response: { header, body: { items: { item: [] } } } } 형태
// base URL은 상수, 인증 키는 NEXT_PUBLIC_TOURISM_API_KEY 로 주입한다.

const TOUR_API_BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const SERVICE_KEY = process.env.NEXT_PUBLIC_TOURISM_API_KEY;

/** TourAPI 공통 응답 봉투 */
interface TourApiResponse<T> {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: { item: T[] } | "";
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export class TourApiError extends Error {
  constructor(
    public readonly resultCode: string,
    message: string,
  ) {
    super(message);
    this.name = "TourApiError";
  }
}

/**
 * TourAPI 공통 GET 래퍼.
 * 공통 파라미터(serviceKey, MobileOS, MobileApp, _type=json)를 자동으로 붙이고
 * items.item 배열을 T[]로 반환한다. 결과가 없으면 빈 배열.
 */
export async function tourFetch<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T[]> {
  const search = new URLSearchParams({
    serviceKey: SERVICE_KEY ?? "",
    MobileOS: "WEB",
    MobileApp: "ji-kku",
    _type: "json",
    ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
  });

  const response = await fetch(`${TOUR_API_BASE_URL}${path}?${search.toString()}`);
  if (!response.ok) {
    throw new TourApiError(String(response.status), "TourAPI 요청에 실패했습니다.");
  }

  const data = (await response.json()) as TourApiResponse<T>;
  const { resultCode, resultMsg } = data.response.header;
  if (resultCode !== "0000") {
    throw new TourApiError(resultCode, resultMsg);
  }

  const items = data.response.body.items;
  return items === "" ? [] : items.item;
}
