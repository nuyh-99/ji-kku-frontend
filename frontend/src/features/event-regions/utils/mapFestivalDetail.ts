import type { RawFestivalDetail } from "@/types/festival";

export function mapFestivalDetailToDetailData(data: RawFestivalDetail) {
  return {
    id: data.contentId,
    title: data.title,
    address: data.addr1,
    description: data.overview,
    imageUrl: data.firstImage,
    lat: data.mapY,
    lng: data.mapX,
    period: `${data.eventStartDate} ~ ${data.eventEndDate}`,
    venue: data.sigunguNm,
  };
}