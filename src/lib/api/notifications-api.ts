import { api } from './api';



export interface Notification {
  id: string;
  user: string;
  type: 'message' | 'booking' | 'payment' | 'property' | 'maintenance' | 'system' | 'inquiry' | 'verification';
  title: string;
  message: string;
  data?: {
    entityId?: string;
    entityType?: string;
    [key: string]: unknown;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    message: number;
    booking: number;
    payment: number;
    property: number;
    maintenance: number;
    system: number;
    inquiry: number;
    verification: number;
  };
}

export interface NotificationParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: 'message' | 'booking' | 'payment' | 'property' | 'maintenance' | 'system' | 'inquiry' | 'verification';
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  hasNext: boolean;
}



export const notificationsApi = {

  getNotifications: async (
    params?: NotificationParams
  ): Promise<NotificationResponse> => {
    const response = await api.get('/notifications', { params });
    return {
      notifications: response.data.data,
      total: response.data.meta?.total || 0,
      hasNext: response.data.meta?.hasNext || false,
    };
  },


  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.data;
  },


  getStats: async (): Promise<NotificationStats> => {
    const response = await api.get('/notifications/stats');
    return response.data.data;
  },


  markAllAsRead: async (): Promise<{ count: number }> => {
    const response = await api.patch('/notifications/read-all');
    return response.data.data;
  },


  markAsRead: async (notificationId: string): Promise<{ message: string }> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },


  deleteNotification: async (
    notificationId: string
  ): Promise<{ message: string }> => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },


  clearAll: async (): Promise<{ count: number }> => {
    const response = await api.delete('/notifications');
    return response.data.data;
  },
};

