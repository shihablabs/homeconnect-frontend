import { api } from './api';



export interface User {
  id: string;
  username: string;
  slug: string;
  name: string;
  email: string;
  role: 'tenant' | 'landlord' | 'admin' | 'support';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
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

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
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

export interface GetUsersParams {
  role?: 'tenant' | 'landlord' | 'admin' | 'support';
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}



export const usersApi = {

  getUsers: async (params?: GetUsersParams): Promise<UsersResponse> => {
    const response = await api.get('/users', { params });
    return response.data.data;
  },


  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },


  updateUser: async (
    id: string,
    data: UpdateUserRequest
  ): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  },
};

