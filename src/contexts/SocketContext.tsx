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
  typingUsers: Map<string, boolean>; 
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
    
    if (typeof window === 'undefined') return;

    
    
    console.log('[Socket] Connection temporarily disabled via code.');
    return;

    
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

