// 카카오맵 SDK는 타입 패키지를 쓰지 않으므로, 실제로 호출하는 API만 좁게 선언한다.
type KakaoLatLng = object;
type KakaoMap = object;

export interface KakaoMapsApi {
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (element: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
  Marker: new (options: { position: KakaoLatLng; map: KakaoMap }) => unknown;
  load: (callback: () => void) => void;
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMapsApi };
  }
}

// SDK 스크립트를 여러 번 삽입하지 않도록 모듈 스코프에서 로딩 상태를 공유
let kakaoMapSdkPromise: Promise<void> | null = null;

export function loadKakaoMapSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.kakao?.maps) return Promise.resolve();
  if (kakaoMapSdkPromise) return kakaoMapSdkPromise;

  kakaoMapSdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-kakao-map-sdk="true"]'
    );
    if (existing) {
      if (existing.dataset.kakaoMapSdkLoaded === "true") {
        window.kakao!.maps.load(() => resolve());
        return;
      }
      existing.addEventListener("load", () => window.kakao!.maps.load(() => resolve()));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.dataset.kakaoMapSdk = "true";
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
    script.onload = () => {
      script.dataset.kakaoMapSdkLoaded = "true";
      window.kakao!.maps.load(() => resolve());
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return kakaoMapSdkPromise;
}

/** 카카오맵 웹에서 특정 좌표에 마커를 찍어 보여주는 링크 */
export function buildKakaoMapLink(title: string, lat: number, lng: number): string {
  return `https://map.kakao.com/link/map/${encodeURIComponent(title)},${lat},${lng}`;
}
