import type { TodaySpotItem } from "@/types/tourism";

export interface SpotCardData {
  id: string;
  title: string;
  imageUrl: string;
  overview: string;
}

export function mapTodaySpotToCardData(item: TodaySpotItem): SpotCardData {
  return {
    id: String(item.contentId),
    title: item.title,
    imageUrl: item.firstImage,
    overview: item.overview,
  };
}