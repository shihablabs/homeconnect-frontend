"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationsApi, type Notification } from "@/lib/api/notifications-api";
import { connectSocket, getSocket } from "@/lib/socket";
import { selectIsAuthenticated } from "@/redux/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  CreditCard,
  FileQuestion,
  Home,
  MessageSquare,
  ShieldCheck,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NotificationDetailsDialog } from "./NotificationDetailsDialog";

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Socket Integration
  useEffect(() => {
    if (userId && isAuthenticated) {
      connectSocket(userId);
      const socket = getSocket();

      socket.on("new_notification", (notification: Notification) => {
        toast.info(notification.title, {
          description: notification.message,
        });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
      });

      socket.on("notification_count", () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
      });

      return () => {
        socket.off("new_notification");
        socket.off("notification_count");
        // Don't disconnect here to allow sharing connection, or handle carefully
        // disconnectSocket(); 
      };
    }
  }, [userId, isAuthenticated, queryClient]);


  const { data: notificationsResponse } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications({ limit: 10 }),
    enabled: !!userId && isAuthenticated,
    refetchInterval: 30000 // Fallback polling
  });
  const notifications = notificationsResponse?.notifications || [];



  const { data: stats } = useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: notificationsApi.getStats,
    enabled: !!userId && isAuthenticated,
    refetchInterval: 30000
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
      toast.success("All notifications marked as read");
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'stats'] });
    }
  });

  const handleMarkAsRead = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsReadMutation.mutate(id);
    }
  };

  const unreadCount = stats?.unread || 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'booking': return <Home className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'inquiry': return <FileQuestion className="h-4 w-4" />;
      case 'verification': return <ShieldCheck className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'booking': return 'bg-purple-100 text-purple-600';
      case 'maintenance': return 'bg-yellow-100 text-yellow-600';
      case 'inquiry': return 'bg-orange-100 text-orange-600';
      case 'verification': return 'bg-teal-100 text-teal-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // ... inside component ...
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // ... (keep existing mutations and hooks) ...

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="relative p-1.5 md:p-2 hover:bg-gray-100 rounded-lg outline-none transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 md:w-96 p-0 shadow-xl border-gray-100">
          <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-gray-900">Notifications</h4>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100">
                  {unreadCount} New
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={(e) => {
                  e.preventDefault();
                  markAllAsReadMutation.mutate();
                }}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="h-3 w-3 mr-1" /> Mark all read
              </Button>
            )}
          </div>
          <ScrollArea className="h-[400px]">
            {notifications && notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors group relative cursor-pointer ${!notification.isRead ? 'bg-blue-50/40' : ''}`}
                    onClick={() => {
                      setSelectedNotification(notification);
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id, false); // Mark read on click
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full shrink-0 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notification.title || "No Title"}
                          </p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {notification.message || "No content available."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">No notifications</p>
                <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
              </div>
            )}
          </ScrollArea>
          <div className="p-2 border-t bg-gray-50/50 text-center">
            <Link
              href="/dashboard/notifications"
              className="text-xs text-blue-600 hover:underline hover:text-blue-700 font-medium block w-full py-1.5 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              View All Notifications
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationDetailsDialog
        notification={selectedNotification}
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
        onDelete={(id) => deleteNotificationMutation.mutate(id)}
      />
    </>
  );
}
