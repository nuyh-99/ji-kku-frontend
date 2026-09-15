// 스티커 표시명(a11y 라벨).
//
// 서버 카탈로그(GET /stickers)는 { stickerId, stickerUrl } 만 주고 이름이 없다. 이미지 파일명도
// 생성 도구가 붙인 해시라(Gemini_Generated_Image_…) 뜻을 되찾을 수 없다.
// (예전에는 디자인에서 받은 12종 로컬 카탈로그와 파일명으로 맞춰 이름을 붙였는데, 서버 카탈로그가
//  바뀌면서 하나도 맞지 않아 전부 "스티커 스티커 추가" 로 읽혔다.)
//
// 그래서 카탈로그 id 로 번호를 붙인다 — 시트의 버튼과 지도에 놓인 스티커가 같은 번호로 불려서
// 화면 낭독기로도 무엇을 놓았는지 이어서 알 수 있다. 서버가 이름을 주게 되면 이 함수만 바꾸면 된다.

/** 스티커 카탈로그 id → 표시명. id 가 없으면(사진 카드 행 등) 그냥 "스티커". */
export function stickerLabel(stickerId: number | null | undefined): string {
  return stickerId == null ? "스티커" : `스티커 ${stickerId}번`;
}
