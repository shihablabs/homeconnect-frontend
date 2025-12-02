'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { notificationsApi, type Notification, type NotificationStats } from '@/lib/api/notifications-api';
import { toast } from 'sonner';

interface UseNotificationsSocketOptions {
  autoFetch?: boolean;
  onNewNotification?: (notification: Notification) => void;
  onNotificationRead?: (notificationId: string) => void;
}

export function useNotificationsSocket(options: UseNotificationsSocketOptions = {}) {
  const { socket, isConnected, notificationCount, notifications: socketNotifications } = useSocket();
  const { autoFetch = true, onNewNotification, onNotificationRead } = options;
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  }) => {
    try {
      setLoading(true);
      const [notificationsData, statsData] = await Promise.all([
        notificationsApi.getNotifications(params),
        notificationsApi.getStats(),
      ]);
      setNotifications(notificationsData.notifications);
      setStats(statsData);
    } catch (error: any) {
      console.error('[NotificationsSocket] Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [autoFetch, fetchNotifications]);

  // Listen for new notifications via socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (notification: Notification) => {
      console.log('[NotificationsSocket] New notification:', notification);
      
      // Add to local state
      setNotifications((prev) => {
        // Check if already exists
        if (prev.some((n) => n.id === notification.id)) {
          return prev;
        }
        return [notification, ...prev];
      });

      // Update stats
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          total: prev.total + 1,
          unread: prev.unread + 1,
          byType: {
            ...prev.byType,
            [notification.type]: (prev.byType[notification.type] || 0) + 1,
          },
        };
      });

      if (onNewNotification) {
        onNewNotification(notification);
      }
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, isConnected, onNewNotification]);

  // Listen for notification count updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotificationCount = (data: { count: number }) => {
      console.log('[NotificationsSocket] Notification count:', data.count);
      // Update stats with new count
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          unread: data.count,
        };
      });
    };

    socket.on('notification_count', handleNotificationCount);

    return () => {
      socket.off('notification_count', handleNotificationCount);
    };
  }, [socket, isConnected]);

  // Request notifications via socket
  const requestNotifications = useCallback(() => {
    if (!socket || !isConnected) {
      // Fallback to REST API
      fetchNotifications();
      return;
    }

    socket.emit('get_notifications');
  }, [socket, isConnected, fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        if (socket && isConnected) {
          // Use socket if available
          socket.emit('mark_notification_read', { notificationId });
        } else {
          // Fallback to REST API
          await notificationsApi.markAsRead(notificationId);
        }

        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
          )
        );

        // Update stats
        setStats((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            unread: Math.max(0, prev.unread - 1),
          };
        });

        if (onNotificationRead) {
          onNotificationRead(notificationId);
        }
      } catch (error: any) {
        console.error('[NotificationsSocket] Error marking as read:', error);
        toast.error('Failed to mark notification as read');
      }
    },
    [socket, isConnected, onNotificationRead]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      if (socket && isConnected) {
        socket.emit('mark_all_notifications_read');
      } else {
        await notificationsApi.markAllAsRead();
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );

      // Update stats
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          unread: 0,
        };
      });

      toast.success('All notifications marked as read');
    } catch (error: any) {
      console.error('[NotificationsSocket] Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  }, [socket, isConnected]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await notificationsApi.deleteNotification(notificationId);

        // Update local state
        const deleted = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        // Update stats
        if (deleted) {
          setStats((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              total: Math.max(0, prev.total - 1),
              unread: deleted.isRead ? prev.unread : Math.max(0, prev.unread - 1),
              byType: {
                ...prev.byType,
                [deleted.type]: Math.max(0, (prev.byType[deleted.type] || 0) - 1),
              },
            };
          });
        }
      } catch (error: any) {
        console.error('[NotificationsSocket] Error deleting notification:', error);
        toast.error('Failed to delete notification');
      }
    },
    [notifications]
  );

  return {
    notifications,
    stats,
    loading,
    notificationCount,
    isConnected,
    fetchNotifications,
    requestNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

