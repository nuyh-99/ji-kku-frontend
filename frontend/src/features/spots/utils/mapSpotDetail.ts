import type { SpotDetailItem } from "@/types/tourism";

export interface SpotDetailData {
  id: string;
  title: string;
  imageUrl: string;
  address: string;
  description: string;
  lat: number;
  lng: number;
}

export function mapSpotDetailToDetailData(item: SpotDetailItem): SpotDetailData {
  return {
    id: String(item.spotId),
    title: item.title,
    imageUrl: item.firstImage,
    address: item.addr1,
    description: item.description,
    lat: item.mapY,   // mapY가 위도
    lng: item.mapX,   // mapX가 경도
  };
}