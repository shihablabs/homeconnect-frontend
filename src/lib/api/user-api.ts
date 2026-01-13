import { api } from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'landlord' | 'tenant' | 'admin';
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
}

export const userApi = {
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    const response = await api.get(`/users/${userId}`);
    return response.data.data;
  },
  
  updateProfile: async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
      const response = await api.put(`/users/${userId}`, data);
      return response.data.data;
  }
};
