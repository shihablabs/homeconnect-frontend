import { adminApi } from "@/lib/api/admin-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAdminUser = (userId: string) => {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: async () => {
      return await adminApi.getUserById(userId);
    },
    enabled: !!userId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ isActive, reason }: { isActive: boolean; reason?: string }) => {
      return await adminApi.updateUserStatus(userId, { isActive, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const restoreUserMutation = useMutation({
    mutationFn: async () => {
      return await adminApi.restoreUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
    refetch: userQuery.refetch,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    restoreUser: restoreUserMutation.mutate,
    restoreUserAsync: restoreUserMutation.mutateAsync,
    isRestoring: restoreUserMutation.isPending,
  };
};
