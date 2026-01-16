import type { AuthUser } from "@/redux/features/auth/authSlice";
import { api } from "./api";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "tenant" | "landlord";
  phoneNumber?: string;
  avatar?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phoneNumber?: string;
    isPhoneVerified?: boolean;
  };
  token: string;
  expiresIn: string;
  refreshToken?: string;
}

interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IUpdateProfileRequest {
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
  title?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  yearsOfExperience?: number;
  specializedArea?: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    return response.data.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data.data;
  },

  updateProfile: async (data: Partial<AuthUser>) => {
    const response = await api.patch('/auth/profile', data);
    return response.data.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/auth/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  verifyEmail: async (data: { email: string; otp: string }): Promise<{ message: string }> => {
    const response = await api.post("/auth/verify-email", data);
    return response.data;
  },

  resendVerificationEmail: async (email: string): Promise<{ message: string }> => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  },

  verifyPhone: async (): Promise<{ message: string }> => {
    const response = await api.post("/auth/verify-phone", {});
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ message: string }> => {
    const response = await api.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/refresh-token", { refreshToken });
    return response.data.data;
  },
  changePassword: async (
    data: IChangePasswordRequest
  ): Promise<{ message: string }> => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },


  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await api.delete("/users/me/delete-account");
    return response.data;
  },


  logout: async (): Promise<{ message: string }> => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};
