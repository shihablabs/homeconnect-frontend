import { api } from './api';

// --- Interfaces & Types ---

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tenant' | 'landlord' | 'admin' | 'support';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatar?: string;
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

// --- API Implementation ---

export const usersApi = {
  /**
   * Get all users (typically used by admins)
   */
  getUsers: async (params?: GetUsersParams): Promise<UsersResponse> => {
    const response = await api.get('/users', { params });
    return response.data.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  /**
   * Update user profile
   * Users can only update their own profile unless they are an admin
   */
  updateUser: async (
    id: string,
    data: UpdateUserRequest
  ): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  },
};

