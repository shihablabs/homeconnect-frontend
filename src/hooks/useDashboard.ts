"use client";

import { dashboardApi, type IDashboardOverviewResponse } from "@/lib/api/dashboard";
import { useQuery } from "@tanstack/react-query";

export const useDashboard = () => {
  const overviewQuery = useQuery<IDashboardOverviewResponse>({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardApi.getDashboard,
    staleTime: 120000, // Consider data fresh for 2 minutes
    refetchOnWindowFocus: false, // Disable to prevent excessive refetches
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on rate limit errors (429)
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 429) {
          return false;
        }
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const stats = overviewQuery.data?.stats;
  const activities = overviewQuery.data?.recentActivity ?? [];
  const properties = overviewQuery.data?.pendingMaintenanceRequests ?? [];

  return {
    stats,
    quickStats: stats,
    activities,
    properties,
    isLoading: overviewQuery.isLoading,
    isFetching: overviewQuery.isFetching,
    error: overviewQuery.error,
    refetch: overviewQuery.refetch,
    data: overviewQuery.data,
  };
};
