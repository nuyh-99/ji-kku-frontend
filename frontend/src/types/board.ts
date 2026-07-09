// 게시판(공지/이벤트) 관련 타입
// types 폴더의 tourism/user/record/achievement 와 짝을 이루며,
// 커뮤니티성 게시글 타입을 모아둡니다.

/** 공지사항 */
export interface Notice {
  id: string;
  title: string;
  content: string;
  /** 작성 일자 (ISO 문자열) */
  createdAt: string;
  /** 상단 고정 여부 */
  pinned?: boolean;
}

/** 이벤트 게시글 */
export interface EventPost {
  id: string;
  title: string;
  /** 목록에 노출할 짧은 요약 */
  summary: string;
  content: string;
  imageUrl?: string;
  /** 이벤트 시작/종료 일자 (ISO 문자열) */
  startsAt: string;
  endsAt: string;
  /** 관련 지역 (선택) */
  region?: string;
}
