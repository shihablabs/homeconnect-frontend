'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFCM } from '@/hooks/useFCM';
import { useNotificationsSocket } from '@/hooks/useNotificationsSocket';
import { type Notification } from '@/lib/api/notifications-api';
import { Bell, CheckCheck, CreditCard, Filter, Home, Loader2, MessageSquare, Settings, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return past.toLocaleDateString();
};

export function NotificationsDashboardClient() {
  const [activeTab, setActiveTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [markingAll, setMarkingAll] = useState(false);
  const { fcmToken, notificationPermission, requestPermission } = useFCM();

  const {
    notifications: allNotifications,
    stats,
    loading,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationsSocket({
    autoFetch: true,
    onNewNotification: (notification) => {
      console.log('New notification received:', notification);
    },
  });


  useEffect(() => {
    const params: {
      limit: number;
      unreadOnly?: boolean;
      type?: 'message' | 'booking' | 'payment' | 'property' | 'maintenance' | 'system';
    } = {
      limit: 50,
    };
    if (activeTab === 'unread') {
      params.unreadOnly = true;
    }
    if (typeFilter !== 'all') {
      params.type = typeFilter as 'message' | 'booking' | 'payment' | 'property' | 'maintenance' | 'system';
    }
    fetchNotifications(params);
  }, [activeTab, typeFilter, fetchNotifications]);

  const notifications = (allNotifications || []).filter((n) => {
    if (activeTab === 'unread' && n.isRead) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error: unknown) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await markAllAsRead();
    } catch (error: unknown) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error: unknown) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      case 'payment':
        return <CreditCard className="h-5 w-5" />;
      case 'booking':
        return <Home className="h-5 w-5" />;
      case 'property':
        return <Home className="h-5 w-5" />;
      case 'maintenance':
        return <Wrench className="h-5 w-5" />;
      case 'system':
        return <Settings className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 text-blue-600';
      case 'payment':
        return 'bg-green-100 text-green-600';
      case 'booking':
        return 'bg-purple-100 text-purple-600';
      case 'property':
        return 'bg-orange-100 text-orange-600';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-600';
      case 'system':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.data?.entityId) {
      switch (notification.type) {
        case 'booking':
          return `/dashboard/bookings/${notification.data.entityId}`;
        case 'payment':
          return `/dashboard/payments/${notification.data.entityId}`;
        case 'property':
          return `/properties/${notification.data.entityId}`;
        case 'message':
          return `/dashboard/messages`;
        case 'maintenance':
          return `/dashboard/maintenance`;
        default:
          return null;
      }
    }
    return null;
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center text-muted-foreground">Loading notifications...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your latest activities
            {!isConnected && (
              <span className="ml-2 text-yellow-600 text-sm">(Connecting...)</span>
            )}
          </p>
        </div>
        {stats && (stats.unread ?? 0) > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead} disabled={markingAll}>
            {markingAll ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Marking...
              </>
            ) : (
              <>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all as read
              </>
            )}
          </Button>
        )}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="py-4 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">Push Notifications</h3>
            <div className="text-xs text-muted-foreground">
              Permission: <Badge variant={notificationPermission === 'granted' ? 'default' : 'secondary'}>{notificationPermission}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {fcmToken && (
              <div className="hidden">Token available in console</div>
            )}
            <Button size="sm" onClick={requestPermission} disabled={notificationPermission === 'granted'}>
              {notificationPermission === 'granted' ? 'Enabled' : 'Enable Notifications'}
            </Button>
            {fcmToken && (
              <Button size="sm" variant="outline" onClick={() => {
                navigator.clipboard.writeText(fcmToken);
                toast.success('Token copied to clipboard');
              }}>
                Copy Token
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      { }
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.unread ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType?.message ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType?.payment ?? 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="message">Messages</SelectItem>
              <SelectItem value="booking">Bookings</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="property">Properties</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    You&apos;re all caught up! New notifications will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    const link = getNotificationLink(notification);
                    const NotificationContent = (
                      <div
                        className={`p-4 border rounded-lg ${!notification.isRead ? 'bg-primary/5 border-primary/20' : ''
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{notification.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimeAgo(notification.createdAt)}
                                  </span>
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {notification.type}
                                  </Badge>
                                  {!notification.isRead && (
                                    <Badge variant="default" className="text-xs">
                                      New
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    Mark read
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(notification.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );

                    return link ? (
                      <Link key={notification.id} href={link}>
                        {NotificationContent}
                      </Link>
                    ) : (
                      <div key={notification.id}>{NotificationContent}</div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
              <CardDescription>
                {notifications.filter((n) => !n.isRead).length} unread notification
                {notifications.filter((n) => !n.isRead).length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.filter((n) => !n.isRead).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCheck className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">You have no unread notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications
                    .filter((n) => !n.isRead)
                    .map((notification) => {
                      const link = getNotificationLink(notification);
                      const NotificationContent = (
                        <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                          <div className="flex items-start gap-4">
                            <div
                              className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}
                            >
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">{notification.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      {formatTimeAgo(notification.createdAt)}
                                    </span>
                                    <Badge variant="outline" className="capitalize text-xs">
                                      {notification.type}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    Mark read
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(notification.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );

                      return link ? (
                        <Link key={notification.id} href={link}>
                          {NotificationContent}
                        </Link>
                      ) : (
                        <div key={notification.id}>{NotificationContent}</div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

