"use client";

import { paymentsApi, type PaymentHistoryParams } from "@/lib/api/payments-api";
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
        type: type !== 'all' ? (type as PaymentHistoryParams['type']) : undefined,
        status: status !== 'all' ? (status as PaymentHistoryParams['status']) : undefined,
        limit,
      });
      return {
        transactions: response.payments || [],
      };
    },
    enabled,
    staleTime: 30000, 
    refetchOnWindowFocus: true,
    refetchInterval: 60000, 
    retry: (failureCount, error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 429) {
          return false;
        }
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

