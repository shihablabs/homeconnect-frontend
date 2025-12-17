"use client";

import { adminApi } from "@/lib/api/admin-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseAdminUsersOptions {
  role?: 'tenant' | 'landlord' | 'admin' | 'support';
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'blocked' | 'all';
  sortBy?: 'createdAt' | 'name' | 'email' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
}

export const useAdminUsers = (options: UseAdminUsersOptions = {}) => {
  const {
    role,
    page = 1,
    limit = 20,
    search,
    status = 'all',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    enabled = true,
  } = options;

  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', role, page, limit, search, status, sortBy, sortOrder],
    queryFn: async () => {
      const response = await adminApi.getAllUsers({
        role,
        page,
        limit,
        search: search || undefined,
        status: status === 'all' ? 'all' : status,
        sortBy,
        sortOrder,
      });
      return {
        users: response.users || [],
        pagination: response.pagination || { total: 0, page: 1, totalPages: 1 },
      };
    },
    enabled,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Auto-refetch every minute
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive, reason }: { userId: string; isActive: boolean; reason?: string }) => {
      return await adminApi.updateUserStatus(userId, { isActive, reason });
    },
    onSuccess: () => {
      // Invalidate all user queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      return await adminApi.deleteUser(userId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const restoreUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await adminApi.restoreUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string; role: 'admin' | 'support'; phone?: string }) => {
      return await adminApi.createStaffAccount(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  return {
    users: usersQuery.data?.users || [],
    pagination: usersQuery.data?.pagination || { total: 0, page: 1, totalPages: 1 },
    isLoading: usersQuery.isLoading,
    isFetching: usersQuery.isFetching,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    deleteUser: deleteUserMutation.mutate,
    deleteUserAsync: deleteUserMutation.mutateAsync,
    isDeleting: deleteUserMutation.isPending,
    restoreUser: restoreUserMutation.mutate,
    restoreUserAsync: restoreUserMutation.mutateAsync,
    isRestoring: restoreUserMutation.isPending,
    createStaff: createStaffMutation.mutate,
    createStaffAsync: createStaffMutation.mutateAsync,
    isCreatingStaff: createStaffMutation.isPending,
  };
};

