"use client";

import { dashboardApi } from "@/lib/api/dashboard";
import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";

export const useDashboardCounts = () => {
  const { notificationCount } = useSocket();
  const [realTimeNotificationCount, setRealTimeNotificationCount] = useState<number | null>(null);

  const countsQuery = useQuery({
    queryKey: ["dashboard", "counts"],
    queryFn: dashboardApi.getDashboardCounts,
    staleTime: 120000, // Consider data fresh for 2 minutes
    refetchOnWindowFocus: false, // Disable to prevent excessive refetches
    refetchInterval: 300000, // Refetch every 5 minutes (reduced from 1 minute)
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

  // Update notification count from socket
  useEffect(() => {
    if (notificationCount !== undefined) {
      setRealTimeNotificationCount(notificationCount);
    }
  }, [notificationCount]);

  // Use real-time notification count if available, otherwise use API count
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

