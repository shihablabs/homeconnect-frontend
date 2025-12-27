import { useAuthState } from "@/hooks/useAuthState";
import { TourRequest, toursApi } from "@/lib/api/tours-api";
import { useQuery } from "@tanstack/react-query";

export function useMyToursQuery() {
  const { user } = useAuthState();

  const query = useQuery({
    queryKey: ["myTours", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return toursApi.getMyTours();
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const hasPendingTour = (propertyId: string) => {
    if (!query.data) return false;
    return query.data.some(
      (tour: TourRequest) =>
        tour.property.id === propertyId &&
        (tour.status === "pending" || tour.status === "approved")
    );
  };

  const getTourStatus = (propertyId: string) => {
    if (!query.data) return null;
    const tour = query.data.find(
      (tour: TourRequest) =>
        tour.property.id === propertyId &&
        (tour.status === "pending" || tour.status === "approved")
    );
    return tour ? tour.status : null;
  };

  return { ...query, hasPendingTour, getTourStatus };
}
