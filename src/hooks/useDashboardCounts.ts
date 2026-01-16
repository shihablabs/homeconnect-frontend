"use client";

import { dashboardApi } from "@/lib/api/dashboard";
import { useQuery } from "@tanstack/react-query";
// import { useSocket } from "@/contexts/SocketContext";
import { useState } from "react";

export const useDashboardCounts = () => {
  // const { notificationCount } = useSocket();
  const [realTimeNotificationCount, setRealTimeNotificationCount] = useState<number | null>(null);

  const countsQuery = useQuery({
    queryKey: ["dashboard", "counts"],
    queryFn: dashboardApi.getDashboardCounts,
    staleTime: 120000, 
    refetchOnWindowFocus: false, 
    refetchInterval: 300000, 
    retry: (failureCount, error: unknown) => {
      
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

  /*
  useEffect(() => {
    if (notificationCount !== undefined) {
      setRealTimeNotificationCount(notificationCount);
    }
  }, [notificationCount]);
  */

  
  const unreadNotifications = realTimeNotificationCount !== null 
    ? realTimeNotificationCount 
    : (countsQuery.data?.unreadNotifications ?? 0);

  return {
    unreadMessages: countsQuery.data?.unreadMessages ?? 0,
    unreadNotifications,
    pendingMaintenance: countsQuery.data?.pendingMaintenance ?? 0,
    isLoading: countsQuery.isLoading,
    error: countsQuery.error,
    refetch: countsQuery.refetch,
  };
};

