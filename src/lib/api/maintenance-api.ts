import { api } from './api';
import { uploadApi } from './upload-api';



export type MaintenanceStatus = 'reported' | 'in_progress' | 'completed' | 'cancelled';
export type MaintenancePriority = 'urgent' | 'medium' | 'low';
export type MaintenanceCategory =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'appliances'
  | 'structural'
  | 'pest_control'
  | 'cleaning'
  | 'other';

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    address: string;
  };
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  landlordId: string;
  landlord: {
    id: string;
    name: string;
    email: string;
  };
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  images?: string[];
  estimatedCost?: number;
  completionDate?: string;
  assignedVendorId?: string;
  assignedVendor?: {
    id: string;
    name: string;
    serviceCategory: string;
    contactPerson: string;
    phoneNumber: string;
    email: string;
    rating: number;
    isVerified: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceRequestData {
  propertyId: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  images?: string[];
}

export interface UpdateMaintenanceRequestData {
  status?: MaintenanceStatus;
  estimatedCost?: number;
  completionDate?: string;
  assignedVendorId?: string | null; 
}

export interface MaintenanceFilters {
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  category?: MaintenanceCategory;
  propertyId?: string;
  tenantId?: string;
  landlordId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'priority' | 'status' | 'completionDate';
  sortOrder?: 'asc' | 'desc';
}

export interface MaintenanceListResponse {
  requests: MaintenanceRequest[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}



export const maintenanceApi = {
  
  uploadImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await uploadApi.post('/upload/images', formData, {
      params: { folder: 'maintenance' },
    });

    return response.data.data.map((img: { url: string }) => img.url);
  },

  
  createMaintenanceRequest: async (
    data: CreateMaintenanceRequestData
  ): Promise<MaintenanceRequest> => {
    const response = await api.post('/maintenance/request', data);
    return response.data.data;
  },

  
  getMaintenanceRequests: async (
    filters?: MaintenanceFilters
  ): Promise<MaintenanceListResponse> => {
    const response = await api.get('/maintenance', { params: filters });
    return {
      requests: response.data.data,
      total: response.data.pagination?.total || 0,
      totalPages: response.data.pagination?.totalPages || 0,
      page: response.data.pagination?.page || 1,
      limit: response.data.pagination?.limit || 10,
    };
  },

  
  getMaintenanceRequest: async (id: string): Promise<MaintenanceRequest> => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data.data;
  },

  
  updateMaintenanceRequest: async (
    id: string,
    data: UpdateMaintenanceRequestData
  ): Promise<MaintenanceRequest> => {
    const response = await api.patch(`/maintenance/${id}/update-status`, data);
    return response.data.data;
  },
};

