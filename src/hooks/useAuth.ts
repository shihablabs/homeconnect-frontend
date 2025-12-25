"use client";

import { AuthResponse, authApi } from "@/lib/api/auth-api";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { AppDispatch } from "@/redux/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data: AuthResponse) => {
      dispatch(setCredentials({ user: data.user as any, token: data.token }));

      queryClient.invalidateQueries({ queryKey: ["user"] });

      if (data.user.role === "landlord") {
        router.push("/dashboard");
      } else {
        router.push("/properties");
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data: AuthResponse) => {
      dispatch(setCredentials({ user: data.user as any, token: data.token }));

      queryClient.invalidateQueries({ queryKey: ["user"] });

      if (data.user.role === "landlord") {
        router.push("/dashboard");
      } else {
        router.push("/properties");
      }
    },
  });

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    error: loginMutation.error || registerMutation.error,
  };
};
