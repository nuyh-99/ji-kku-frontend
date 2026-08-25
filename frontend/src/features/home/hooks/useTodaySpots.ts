import { useQuery } from "@tanstack/react-query";
import { getTodaySpots } from "@/lib/api/spot";
import { mapTodaySpotToCardData } from "@/types/mapTodaySpot";

export function useTodaySpots() {
    return useQuery({
        queryKey: ["spots", "today"],
        queryFn: async () => {
            const data = await getTodaySpots();
            return data.content.map(mapTodaySpotToCardData);
        },
    });
}