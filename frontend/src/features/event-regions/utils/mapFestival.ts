// src/features/event-regions/utils/mapFestival.ts
import type { RawFestivalDetail } from "@/types/festival";

export type FestivalCardData = {
  id: string;
  title: string;
  overview: string;
  imageUrl: string;
};

export function mapFestivalCard(raw: RawFestivalDetail): FestivalCardData {
  return {
    id: String(raw.contentId),
    title: raw.title,
    overview: raw.overview,
    imageUrl: raw.firstImage,
  };
}