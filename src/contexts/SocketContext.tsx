'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

export interface Notification {
  id: string;
  type: 'message' | 'booking' | 'payment' | 'property' | 'maintenance' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingUsers: Map<string, boolean>; // userId -> isTyping
  notificationCount: number;
  notifications: Notification[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Only connect on client side
    if (typeof window === 'undefined') return;

    // TODO: WebSocket connection temporarily disabled to prevent console errors during system development.
    // Uncomment the code below when ready to re-enable real-time features.
    console.log('[Socket] Connection temporarily disabled via code.');
    return;

    /*
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('[Socket] No token found, skipping connection');
      return;
    }

    // Get base URL without /api
    const socketUrl = API_BASE_URL.replace('/api', '');

    console.log('[Socket] Connecting to:', socketUrl);

    // Initialize socket connection
    const newSocket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('[Socket] Connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
      setOnlineUsers(new Set());
      setTypingUsers(new Map());
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      setIsConnected(false);
    });

    // User status events
    newSocket.on('user_status_change', (data: { userId: string; isOnline: boolean }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (data.isOnline) {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    });

    // Typing indicators
    newSocket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (data.isTyping) {
          next.set(data.userId, true);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    });

    // Notification events
    newSocket.on('notification_count', (data: { count: number }) => {
      console.log('[Socket] Notification count updated:', data.count);
      setNotificationCount(data.count);
    });

    newSocket.on('new_notification', (notification: Notification) => {
      console.log('[Socket] New notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setNotificationCount((prev) => prev + 1);
    });

    newSocket.on('notifications_list', (data: { notifications: Notification[] }) => {
      console.log('[Socket] Notifications list received:', data.notifications.length);
      setNotifications(data.notifications);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('[Socket] Cleaning up connection');
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
    };
    */
  }, []);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      onlineUsers,
      typingUsers,
      notificationCount,
      notifications,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

