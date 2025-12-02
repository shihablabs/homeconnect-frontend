"use client";

import { adminApi, type AdminStats } from "@/lib/api/admin-api";
import { useQuery } from "@tanstack/react-query";

export const useAdminStats = (options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) => {
  const { enabled = true, refetchInterval } = options || {};

  const statsQuery = useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getAdminStats,
    enabled,
    staleTime: 600000, // Consider data fresh for 10 minutes (increased from 2 minutes)
    refetchOnWindowFocus: false, // Disable to prevent excessive refetches
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchInterval: refetchInterval === undefined ? false : refetchInterval, // Default: Disable auto-refetch, only manual or explicit
    retry: (failureCount, error: any) => {
      // Don't retry on rate limit errors (429)
      if (error?.response?.status === 429) {
        return false;
      }
      return failureCount < 2; // Reduced retries from 3 to 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    isFetching: statsQuery.isFetching,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};

