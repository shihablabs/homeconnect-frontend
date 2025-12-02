import { api } from './api';

// --- Interfaces & Types ---

export interface Notification {
  id: string;
  user: string;
  type: 'message' | 'booking' | 'payment' | 'property' | 'maintenance' | 'system';
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
  };
}

export interface NotificationParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: 'message' | 'booking' | 'payment' | 'property' | 'maintenance' | 'system';
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  hasNext: boolean;
}

// --- API Implementation ---

export const notificationsApi = {
  /**
   * Get user's notifications
   */
  getNotifications: async (
    params?: NotificationParams
  ): Promise<NotificationResponse> => {
    const response = await api.get('/notifications', { params });
    return response.data.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.data;
  },

  /**
   * Get notification statistics
   */
  getStats: async (): Promise<NotificationStats> => {
    const response = await api.get('/notifications/stats');
    return response.data.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ count: number }> => {
    const response = await api.patch('/notifications/read-all');
    return response.data.data;
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: string): Promise<{ message: string }> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (
    notificationId: string
  ): Promise<{ message: string }> => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Clear all notifications
   */
  clearAll: async (): Promise<{ count: number }> => {
    const response = await api.delete('/notifications');
    return response.data.data;
  },
};

