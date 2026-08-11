export type RawFestivalListItem = {
  contentId: number;
  title: string;
  firstImage: string;
  eventStartDate: string;
  eventEndDate: string;
  sigunguCd: number;
  sigunguNm: string;
};

export type RawFestivalDetail = {
  contentId: number;
  title: string;
  firstImage: string;
  overview: string;
  addr1: string;
  eventStartDate: string;
  eventEndDate: string;
  sigunguCd: number;
  sigunguNm: string;
  mapX: number;
  mapY: number;
};