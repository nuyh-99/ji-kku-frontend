// src/features/spots/utils/mapTodaySpot.ts
import type { TodaySpotItem } from "@/types/tourism";

export interface SpotCardData {
  id: string;
  title: string;
  imageUrl: string;
  overview: string;
}

export function mapTodaySpotToCardData(item: TodaySpotItem): SpotCardData {
  return {
    id: String(item.spot_id),
    title: item.title,
    imageUrl: item.first_image,
    overview: item.overview,
  };
}