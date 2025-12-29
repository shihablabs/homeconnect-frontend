import { api } from './api';



export type VendorServiceCategory =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'appliances'
  | 'structural'
  | 'pest_control'
  | 'cleaning'
  | 'general_repair'
  | 'other';

export interface Vendor {
  id: string;
  name: string;
  serviceCategory: VendorServiceCategory;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  address: string;
  rating: number;
  totalAssignments: number;
  completedAssignments: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorData {
  name: string;
  serviceCategory: VendorServiceCategory;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  address: string;
  isVerified?: boolean;
}

export interface UpdateVendorData {
  name?: string;
  serviceCategory?: VendorServiceCategory;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  isVerified?: boolean;
}

export interface VendorFilters {
  serviceCategory?: VendorServiceCategory;
  isVerified?: boolean;
  minRating?: number;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'rating' | 'totalAssignments' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface VendorListResponse {
  vendors: Vendor[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}



export const vendorsApi = {
  
  getVendors: async (filters?: VendorFilters): Promise<VendorListResponse> => {
    const response = await api.get('/vendors', { params: filters });
    return {
      vendors: response.data.data,
      total: response.data.pagination?.total || 0,
      totalPages: response.data.pagination?.totalPages || 0,
      page: response.data.pagination?.page || 1,
      limit: response.data.pagination?.limit || 10,
    };
  },

  
  getVendor: async (id: string): Promise<Vendor> => {
    const response = await api.get(`/vendors/${id}`);
    return response.data.data;
  },

  
  createVendor: async (data: CreateVendorData): Promise<Vendor> => {
    const response = await api.post('/vendors', data);
    return response.data.data;
  },

  
  updateVendor: async (
    id: string,
    data: UpdateVendorData
  ): Promise<Vendor> => {
    const response = await api.patch(`/vendors/${id}`, data);
    return response.data.data;
  },

  
  deleteVendor: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/vendors/${id}`);
    return response.data;
  },
};

