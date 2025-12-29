'use client';

import Breadcrumb from "@/components/layout/Breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationsSocket } from "@/hooks/useNotificationsSocket";
import { chatApi, Conversation } from "@/lib/api/chat-api";
import { type Notification } from "@/lib/api/notifications-api";
import { useLogoutMutation } from "@/redux/features/auth/authApiSlice";
import { selectCurrentUser, selectIsAuthenticated } from "@/redux/features/auth/authSlice";
import { useAppSelector } from '@/redux/hooks';
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCheck,
  CreditCard,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MessageSquare,
  PlusCircle,
  Settings,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from "sonner";
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);

  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutMutation();

  
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    if (user) {
      chatApi.getConversations().then(data => {
        setRecentConversations(data);
        const unread = data.reduce((acc, curr) => acc + curr.unreadCount, 0);
        setUnreadMsgCount(unread);
      }).catch(console.error);
    }
  }, [user]);

  const {
    notifications,
    stats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationsSocket({
    autoFetch: false, 
  });

  const unreadCount = stats?.unread || 0;

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailOpen(true);
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'booking': return <Home className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'booking': return 'bg-purple-100 text-purple-600';
      case 'maintenance': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      toast.success("Logged out successfully.");
      router.push('/login');
    } catch (err) {
      toast.error("Failed to log out. Please try again.");
      console.error('Failed to log out:', err);
    }
  };

  const initials = useMemo(() => {
    const n = user?.name?.trim();
    if (!n) return "U";
    const parts = n.split(" ").filter(Boolean);
    return (parts[0]?.[0] ?? "U").toUpperCase() + (parts[1]?.[0]?.toUpperCase() ?? "");
  }, [user?.name]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {}
      <div className="fixed inset-y-0 left-0 z-50 w-80 h-full">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          role={user?.role as 'tenant' | 'landlord' | 'admin' | 'support'}
        />
      </div>

      {}
      <div className="flex-1 flex flex-col ml-0 lg:ml-80">
        {}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 h-20 z-40 sticky top-0 w-full">
          <div className="flex items-center justify-between px-6 py-4 w-full">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900 lg:ml-0">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <Link href="/properties">
                <Button variant="ghost" size="sm" className="hidden md:flex text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Browse Properties</span>
                </Button>
              </Link>

              <DropdownMenu open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <MessageSquare className="h-5 w-5" />
                    {unreadMsgCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadMsgCount > 9 ? '9+' : unreadMsgCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between p-3 border-b bg-gray-50/50">
                    <h4 className="font-semibold text-sm">Messages</h4>
                    {unreadMsgCount > 0 && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                        {unreadMsgCount} new
                      </span>
                    )}
                  </div>
                  <ScrollArea className="h-[320px]">
                    {recentConversations.length > 0 ? (
                      <div className="divide-y">
                        {recentConversations.slice(0, 5).map((conv) => (
                          <Link
                            key={conv.id || conv.partner.id}
                            href={`/dashboard/messages?partner=${conv.partner.id}`}
                            onClick={() => setIsMessageOpen(false)}
                            className={`block p-3 hover:bg-gray-50 transition-colors ${conv.unreadCount > 0 ? 'bg-blue-50/30' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                <Avatar className="h-9 w-9 border border-gray-100">
                                  <AvatarImage src={conv.partner.avatar} />
                                  <AvatarFallback>{conv.partner.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {conv.partner.isOnline && (
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="flex justify-between items-baseline mb-0.5">
                                  <p className="text-sm font-medium text-gray-900 truncate pr-2">{conv.partner.name}</p>
                                  {conv.lastMessage && (
                                    <span className="text-[10px] text-gray-400 shrink-0">
                                      {formatDistanceToNow(new Date(conv.lastMessage.timestamp), { addSuffix: true }).replace('about ', '')}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                                  {conv.lastMessage?.isFromMe && 'You: '}
                                  {conv.lastMessage?.content || 'No messages yet'}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                        <MessageSquare className="h-10 w-10 mb-2 opacity-10" />
                        <p className="text-sm">No messages yet</p>
                      </div>
                    )}
                  </ScrollArea>
                  <div className="p-2 border-t bg-gray-50 text-center">
                    <Link
                      href="/dashboard/messages"
                      className="text-xs text-blue-600 hover:underline font-medium block w-full py-1"
                      onClick={() => setIsMessageOpen(false)}
                    >
                      View All Messages
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-1.5 md:p-2 hover:bg-gray-100 rounded-lg outline-none">
                    <Bell className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 md:w-4 md:h-4 bg-red-500 text-white text-[10px] md:text-xs rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 md:w-96 p-0">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-700"
                        onClick={(e) => {
                          e.preventDefault();
                          markAllAsRead();
                        }}
                      >
                        <CheckCheck className="h-3 w-3 mr-1" /> Mark all read
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[400px]">
                    {notifications && notifications.length > 0 ? (
                      <div className="divide-y">
                        {notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full shrink-0 ${getNotificationColor(notification.type)}`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                  {notification.message}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1.5">
                                  {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                        <Bell className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </ScrollArea>
                  <div className="p-2 border-t bg-gray-50 text-center">
                    <Link
                      href="/dashboard/notifications"
                      className="text-xs text-blue-600 hover:underline font-medium block w-full py-1"
                      onClick={() => setIsNotificationOpen(false)}
                    >
                      View All Notifications
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none flex items-center gap-2 cursor-pointer">
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                  </div>
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={user?.avatar} alt={user?.name ?? "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.name ?? "User"}</span>
                      <span className="text-xs text-muted-foreground font-normal truncate">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  {user?.role === 'landlord' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/properties" className="cursor-pointer">
                          <Home className="mr-2 h-4 w-4" />
                          My Properties
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/add-property" className="cursor-pointer">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add New Property
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/favorites" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      My Favorites
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/messages" className="cursor-pointer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Messages
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1 overflow-y-auto scroll-smooth w-full">
          <div className="w-full h-full">
            <Breadcrumb />
            {children}
          </div>
        </main>

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-md">
            {selectedNotification && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="capitalize">
                      {selectedNotification.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedNotification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <DialogTitle>{selectedNotification.title}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className={`p-3 rounded-lg ${getNotificationColor(selectedNotification.type)} bg-opacity-10 border border-opacity-20`}>
                    <p className="text-sm leading-relaxed">
                      {selectedNotification.message}
                    </p>
                  </div>

                  {selectedNotification.data && (
                    <div className="text-sm space-y-2">
                      {(selectedNotification.data as any).propertyName && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Property:</span>
                          <span className="font-medium">{(selectedNotification.data as any).propertyName}</span>
                        </div>
                      )}
                      {(selectedNotification.data as any).amount && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">${(selectedNotification.data as any).amount}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => deleteNotification(selectedNotification.id).then(() => setIsDetailOpen(false))}>
                    Delete
                  </Button>
                  {(selectedNotification.data as any)?.entityId && (
                    <Button asChild>
                      <Link href={
                        selectedNotification.type === 'booking' ? `/dashboard/bookings/${(selectedNotification.data as any).entityId}` :
                          selectedNotification.type === 'payment' ? `/dashboard/payments/${(selectedNotification.data as any).entityId}` :
                            selectedNotification.type === 'property' ? `/properties/${(selectedNotification.data as any).entityId}` :
                              '/dashboard/notifications'
                      } onClick={() => setIsDetailOpen(false)}>
                        View Details
                      </Link>
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}