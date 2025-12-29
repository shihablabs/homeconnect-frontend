import { api } from "./api";

export interface IActivityResponse {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  action: string;
  message: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface IMaintenanceRequestResponse {
  id: string;
  property: {
    id: string;
    title: string;
    address: string;
  };
  tenant: {
    id: string;
    name: string;
  };
  title: string;
  description: string;
  status: string;
  priority: string;
  images?: string[];
  reportedAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface IDashboardStats {
  totalProperties: number;
  totalPropertiesForRent: number;
  totalPropertiesForSale: number;
  occupiedProperties: number;
  totalUsers: number;
  totalLandlords: number;
  pendingMaintenance: number;
  totalRevenue: number;
  
  totalBookings?: number;
  pendingBookings?: number;
  activeTenants?: number;
}

export interface IDashboardOverviewResponse {
  stats: IDashboardStats;
  recentActivity: IActivityResponse[];
  pendingMaintenanceRequests: IMaintenanceRequestResponse[];
}
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: TUserRole;
  avatar?: string | null;
  phone?: string;
}
export type TUserRole = 'tenant' | 'landlord' | 'admin' | 'support';


export const dashboardApi = {
  
  getDashboard: async (): Promise<IDashboardOverviewResponse> => {
    const response = await api.get('/dashboard/overview');
    return response.data.data; 
  },

  
  createMaintenanceRequest: async (data: {
    property: string;
    title: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<IMaintenanceRequestResponse> => {
    const response = await api.post('/dashboard/maintenance', data);
    return response.data.data;
  },

  
  getMaintenanceRequests: async (params?: {
    status?: string;
    priority?: string;
    propertyId?: string;
    tenantId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    requests: IMaintenanceRequestResponse[];
    total: number;
    totalPages: number;
  }> => {
    const response = await api.get('/dashboard/maintenance', { params });
    return response.data.data;
  },

  
  updateMaintenanceRequest: async (
    maintenanceId: string,
    data: { status?: string; priority?: string }
  ): Promise<IMaintenanceRequestResponse> => {
    const response = await api.patch(`/dashboard/maintenance/${maintenanceId}`, data);
    return response.data.data;
  },

  
  getActivities: async (params?: {
    action?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    activities: IActivityResponse[];
    total: number;
    totalPages: number;
  }> => {
    const response = await api.get('/dashboard/activity', { params });
    return response.data.data;
  },

  
  markActivityAsRead: async (activityId: string): Promise<IActivityResponse> => {
    const response = await api.patch(`/dashboard/activity/${activityId}/read`);
    return response.data.data;
  },

  
  markAllActivitiesAsRead: async (): Promise<{ count: number }> => {
    const response = await api.patch('/dashboard/activity/read-all');
    return response.data.data;
  },

  
  getDashboardCounts: async (): Promise<{
    unreadMessages: number;
    unreadNotifications: number;
    pendingMaintenance: number;
  }> => {
    const response = await api.get('/dashboard/counts');
    return response.data.data;
  },
};