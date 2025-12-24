'use client';

import Breadcrumb from '@/components/layout/Breadcrumb';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/redux/features/auth/authApiSlice";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { useAppSelector } from '@/redux/hooks';
import {
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  PlusCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from "sonner";
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);

  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutMutation();

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
      {/* Sidebar - Fixed 400px width */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 h-full">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          role={user?.role as 'tenant' | 'landlord' | 'admin' | 'support'}
        />
      </div>

      {/* Main Content - Offset by sidebar width (320px = w-80) */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-80">
        {/* Header - Perfectly aligned with 400px offset */}
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

            <div className="flex items-center space-x-4">
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

        {/* Main Content - Perfect width calculation */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1 overflow-y-auto scroll-smooth w-full">
          <div className="w-full h-full">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}