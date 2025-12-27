'use client';

import { navigationConfig } from '@/config/navigationConfig';
import { useDashboardCounts } from '@/hooks/useDashboardCounts';
import { pacifico } from '@/lib/fonts';
import { useLogoutMutation } from '@/redux/features/auth/authApiSlice';
import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  TbChevronDown,
  TbChevronRight,
  TbHomeSearch,
  TbLogout
} from 'react-icons/tb';
import { toast } from 'sonner';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'tenant' | 'landlord' | 'admin' | 'support';
}

export default function DashboardSidebar({ isOpen, onClose, role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadMessages, unreadNotifications, pendingMaintenance } = useDashboardCounts();
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

  // Initialize with empty Set to prevent hydration mismatch
  // Load from localStorage only on client after mount
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);

  // Helper to determine if a path is active (exact match or sub-path)
  // Modified to be more robust for nested routes
  const isPathActive = useCallback((targetPath: string) => {
    if (!pathname || !targetPath) return false;

    // Exact match
    if (pathname === targetPath) return true;

    // Dashboard home exception - only exact match
    if (targetPath === '/dashboard' && pathname !== '/dashboard') return false;

    // Sub-path match (e.g. /dashboard/users matching /dashboard/users/123)
    // The target path must be the prefix, followed by a slash or end of string
    return pathname.startsWith(targetPath + '/');
  }, [pathname]);

  // Load dropdown state from localStorage after mount (client-side only)
  // AND automatically expand nested menus based on current route
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`dashboard-dropdowns-${role}`);
        let initialDropdowns = new Set<string>();

        if (saved) {
          const parsed = JSON.parse(saved);
          initialDropdowns = new Set(Array.isArray(parsed) ? parsed : []);
        }

        // Auto-expand logic
        const currentMenu = navigationConfig[role] || navigationConfig['tenant'];
        if (currentMenu) {
          currentMenu.forEach(item => {
            if (item.type === 'dropdown' && item.items) {
              const hasActiveChild = item.items.some(subItem => isPathActive(subItem.href));
              if (hasActiveChild) {
                initialDropdowns.add(item.label);
              }
            }
          });
        }

        setOpenDropdowns(initialDropdowns);

      } catch (error) {
        console.error('Failed to load dropdown state:', error);
      }
    }
  }, [role, pathname, isPathActive]); // Re-run when pathname changes to auto-expand

  // Save dropdown state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `dashboard-dropdowns-${role}`,
          JSON.stringify(Array.from(openDropdowns))
        );
      } catch (error) {
        console.error('Failed to save dropdown state:', error);
      }
    }
  }, [openDropdowns, role]);

  const toggleDropdown = (label: string) => {
    const newDropdowns = new Set(openDropdowns);
    if (newDropdowns.has(label)) {
      newDropdowns.delete(label);
    } else {
      newDropdowns.add(label);
    }
    setOpenDropdowns(newDropdowns);
  };

  // Get menu items with dynamic badge counts
  const getMenuItemsWithBadges = () => {
    // Fallback to 'tenant' if role is undefined or not in navigationConfig
    const items = navigationConfig[role] || navigationConfig['tenant'];

    if (!items) return []; // Safety check

    return items.map(item => {
      if (item.type === 'link') {
        const itemHref = item.href || '';
        // Update badges based on href
        if (itemHref === '/dashboard/messages') {
          return { ...item, badge: unreadMessages > 0 ? unreadMessages.toString() : null };
        }
        if (itemHref === '/dashboard/notifications') {
          return { ...item, badge: unreadNotifications > 0 ? unreadNotifications.toString() : null };
        }
        if (itemHref === '/dashboard/maintenance') {
          return { ...item, badge: pendingMaintenance > 0 ? pendingMaintenance.toString() : null };
        }
        // Support-specific badges
        if (role === 'support') {
          if (itemHref === '/dashboard/support/tickets') {
            // Could be enhanced with actual support ticket count
            return item;
          }
          if (itemHref === '/dashboard/support/escalations') {
            // Could be enhanced with actual escalation count
            return item;
          }
        }
        // Admin-specific badges
        if (role === 'admin' && itemHref === '/dashboard/admin/support') {
          // Could be enhanced with actual support ticket count
          return item;
        }
      }
      return item;
    });
  };

  const menuItems = getMenuItemsWithBadges();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed h-full inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed h-full inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-white to-gray-50/80 border-r border-gray-200/60 backdrop-blur-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Enhanced Logo Section */}
        <div className="flex items-center justify-between h-24 p-6 border-b border-gray-200/40 bg-white/50 backdrop-blur-sm flex-shrink-0">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg hover:drop-shadow-xl inline-flex items-center space-x-4 hover:scale-105 transition-all duration-300">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                <TbHomeSearch className="text-xl text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex flex-col">
              <span className={`${pacifico.className}`}>HomeConnect</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Enhanced Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto mt-8 px-4 pb-24">
          <div className="space-y-2">
            {menuItems.map((item, idx) => {
              if (item.type === 'section') {
                return (
                  <div key={`${item.label}-${idx}`} className="px-4 py-2 mt-4 mb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {item.label}
                    </p>
                  </div>
                );
              }

              const IconComponent = item.icon;
              const isActive = item.href ? isPathActive(item.href) : false;
              const isDropdownOpen = openDropdowns.has(item.label);

              // Type guard for items with icons
              if (!IconComponent) return null;

              if (item.type === 'dropdown') {
                // Check if any child is active to highlight the parent dropdown button
                const isChildActive = item.items?.some(subItem => isPathActive(subItem.href));

                return (
                  <div key={item.label} className="rounded-xl transition-all duration-200 hover:bg-white/50">
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={clsx(
                        "flex items-center justify-between w-full px-4 py-4 text-sm font-semibold rounded-xl transition-all duration-200",
                        isChildActive
                          ? "text-blue-600 bg-blue-50/50" // Highlight parent if child is active
                          : "text-gray-700 hover:text-gray-900"
                      )}
                    >
                      <div className="flex items-center">
                        <IconComponent className={clsx("w-5 h-5 mr-3", isChildActive ? "text-blue-600" : "text-blue-600")} />
                        {item.label}
                      </div>
                      {isDropdownOpen ? (
                        <TbChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" />
                      ) : (
                        <TbChevronRight className="w-4 h-4 text-gray-400 transition-transform duration-200" />
                      )}
                    </button>

                    {isMounted && isDropdownOpen && (
                      <div className="ml-4 pl-8 border-l-2 border-gray-200/40 space-y-1 py-2">
                        {item.items?.map((subItem, index) => {
                          const isSubItemActive = isPathActive(subItem.href);
                          return (
                            <Link
                              key={`${subItem.href}-${subItem.label}-${index}`}
                              href={subItem.href}
                              className={clsx(
                                "flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200",
                                isSubItemActive
                                  ? "text-blue-600 bg-blue-50/50 font-medium"
                                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
                              )}
                              onClick={() => window.innerWidth < 1024 && onClose()}
                            >
                              <TbChevronRight className="w-3 h-3 mr-2" />
                              {subItem.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href || '#'}
                  className={clsx(
                    "flex items-center justify-between px-4 py-4 text-sm font-semibold rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-600 border-r-4 border-blue-600 shadow-sm"
                      : "text-gray-700 hover:bg-white/80 hover:text-gray-900 hover:shadow-md"
                  )}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                >
                  <div className="flex items-center">
                    <IconComponent className={clsx(
                      "w-5 h-5 mr-3 transition-colors duration-200",
                      isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"
                    )} />
                    {item.label}
                  </div>
                  {item.badge && (
                    <span className={clsx(
                      "px-2 py-1 text-xs font-bold rounded-full min-w-6 text-center",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-600"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Enhanced Footer Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200/40 bg-white/50 backdrop-blur-sm">
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50/80 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TbLogout className="w-5 h-5 mr-3" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}