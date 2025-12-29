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
    staleTime: 600000, 
    refetchOnWindowFocus: false, 
    refetchOnMount: false, 
    refetchInterval: refetchInterval === undefined ? false : refetchInterval, 
    retry: (failureCount, error: unknown) => {
      
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 429) {
          return false;
        }
      }
      return failureCount < 2; 
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

