"use client";

import { paymentsApi, type Payment } from "@/lib/api/payments-api";
import { useQuery } from "@tanstack/react-query";

interface UseTransactionsOptions {
  type?: string;
  status?: string;
  limit?: number;
  enabled?: boolean;
}

export const useTransactions = (options: UseTransactionsOptions = {}) => {
  const { type, status, limit = 100, enabled = true } = options;

  const transactionsQuery = useQuery({
    queryKey: ['transactions', type, status, limit],
    queryFn: async () => {
      const response = await paymentsApi.getPaymentHistory({
        type: type !== 'all' ? (type as any) : undefined,
        status: status !== 'all' ? (status as any) : undefined,
        limit,
      });
      return {
        transactions: response.payments || [],
      };
    },
    enabled,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Auto-refetch every minute
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 429) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    transactions: transactionsQuery.data?.transactions || [],
    isLoading: transactionsQuery.isLoading,
    isFetching: transactionsQuery.isFetching,
    error: transactionsQuery.error,
    refetch: transactionsQuery.refetch,
  };
};

