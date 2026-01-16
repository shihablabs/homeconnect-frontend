import {
    notificationsApi,
    type Notification,
    type NotificationParams,
    type NotificationStats
} from '@/lib/api/notifications-api';
import { getSocket } from '@/lib/socket';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

interface UseNotificationsSocketOptions {
  autoFetch?: boolean;
  onNewNotification?: (notification: Notification) => void;
}

interface UseNotificationsSocketReturn {
  notifications: Notification[];
  stats: NotificationStats | null;
  loading: boolean;
  isConnected: boolean;
  fetchNotifications: (params?: NotificationParams) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationsSocket = (
  options: UseNotificationsSocketOptions = {}
): UseNotificationsSocketReturn => {
  const user = useSelector(selectCurrentUser);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(getSocket());

  const fetchNotifications = useCallback(async (params?: NotificationParams) => {
    try {
      setLoading(true);
      const [notificationsData, statsData] = await Promise.all([
        notificationsApi.getNotifications(params),
        notificationsApi.getStats()
      ]);
      setNotifications(notificationsData.notifications);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Fetch
  useEffect(() => {
    if (options.autoFetch && user) {
      fetchNotifications();
    }
  }, [options.autoFetch, user, fetchNotifications]);

  // Socket Connection and Event Listeners
  useEffect(() => {
    if (!user) return;

    const socket = socketRef.current;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onNewNotification = (notification: Notification) => {
      // Update stats locally
      setStats((prev) => {
        if (!prev) return null;
        const newStats = { ...prev };
        newStats.total += 1;
        newStats.unread += 1;
        if (newStats.byType[notification.type] !== undefined) {
          newStats.byType[notification.type] += 1;
        }
        return newStats;
      });

      // Update notifications list
      setNotifications((prev) => [notification, ...prev]);

      // Callback
      if (options.onNewNotification) {
        options.onNewNotification(notification);
      }
    };

    if (socket.connected) {
      onConnect();
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification', onNewNotification);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification', onNewNotification);
    };
  }, [user, options.onNewNotification]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      
      // Optimistic Update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      
      setStats(prev => {
        if (!prev) return null;
        return {
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        };
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      
      // Optimistic Update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setStats(prev => {
        if (!prev) return null;
        return { ...prev, unread: 0 };
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsApi.deleteNotification(id);
      
      // Optimistic Update
      const notifToDelete = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (notifToDelete) {
        setStats(prev => {
          if (!prev) return null;
          const newStats = { ...prev };
          newStats.total = Math.max(0, newStats.total - 1);
          if (!notifToDelete.isRead) {
            newStats.unread = Math.max(0, newStats.unread - 1);
          }
           if (newStats.byType[notifToDelete.type] !== undefined) {
            newStats.byType[notifToDelete.type] = Math.max(0, newStats.byType[notifToDelete.type] - 1);
          }
          return newStats;
        });
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  };

  return {
    notifications,
    stats,
    loading,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
