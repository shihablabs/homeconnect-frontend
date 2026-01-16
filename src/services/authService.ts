
import { api } from '@/lib/api/api';
import { AuthUser } from '@/redux/features/auth/authSlice';

interface SyncUserParams {
  name?: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  avatar?: string;
  firebaseUid: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

export const authService = {
  syncUser: async (data: SyncUserParams, firebaseToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/sync-user', data, {
      headers: {
        Authorization: `Bearer ${firebaseToken}`,
      },
    });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getProfile: async (): Promise<AuthUser> => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  updateProfile: async (data: Partial<AuthUser>): Promise<AuthUser> => {
    const response = await api.patch('/auth/profile', data);
    return response.data.data;
  },
};
