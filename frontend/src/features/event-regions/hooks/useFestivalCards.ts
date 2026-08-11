import { useQueries, useQuery } from "@tanstack/react-query";
import { getFestivals, getFestivalDetail } from "@/lib/api/spot";
import { mapFestivalCard } from "../utils/mapFestival";

export function useFestivalCards() {
  const { data: listData } = useQuery({
    queryKey: ["festivals"],
    queryFn: getFestivals,
  });

  const contentIds = (listData?.content ?? []).map((item) => String(item.contentId));

  const detailQueries = useQueries({
    queries: contentIds.map((contentId) => ({
      queryKey: ["festival-detail", contentId],
      queryFn: () => getFestivalDetail(contentId),
      enabled: contentIds.length > 0,
    })),
  });

  const isLoading = detailQueries.some((q) => q.isLoading);
  const festivals = detailQueries
    .filter((q) => q.data)
    .map((q) => mapFestivalCard(q.data!));

  return { festivals, isLoading };
}