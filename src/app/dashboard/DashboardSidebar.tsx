'use client';

import { navigationConfig } from '@/config/navigationConfig';
import { useDashboardCounts } from '@/hooks/useDashboardCounts';
import { pacifico } from '@/lib/fonts';
import { logoutUser } from '@/redux/features/auth/authSlice';
import { useAppDispatch } from '@/redux/hooks';
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
  const dispatch = useAppDispatch();
  const { unreadMessages, unreadNotifications, pendingMaintenance } = useDashboardCounts();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully.");
      // Redirect handled by thunk
    } catch (err) {
      toast.error("Failed to log out. Please try again.");
      console.error('Failed to log out:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };



  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);



  const isPathActive = useCallback((targetPath: string) => {
    if (!pathname || !targetPath) return false;


    if (pathname === targetPath) return true;


    if (targetPath === '/dashboard' && pathname !== '/dashboard') return false;



    return pathname.startsWith(targetPath + '/');
  }, [pathname]);



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

        // Defensive check for navigationConfig
        if (!navigationConfig) {
          console.error("Navigation config is undefined");
          return;
        }

        const safeRole = role || 'tenant';
        const currentMenu = navigationConfig[safeRole] || navigationConfig['tenant'];

        if (currentMenu) {
          const findActiveDropdowns = (items: any[]) => {
            items.forEach(item => {
              if (item.type === 'dropdown' && item.items) {

                if (checkActiveRecursive(item.items, isPathActive)) {
                  initialDropdowns.add(item.label);

                  findActiveDropdowns(item.items);
                }
              }
            });
          };
          findActiveDropdowns(currentMenu);
        }

        setOpenDropdowns(initialDropdowns);

      } catch (error) {
        console.error('Failed to load dropdown state:', error);
      }
    }
  }, [role, pathname, isPathActive]);


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


  const getMenuItemsWithBadges = () => {

    const items = navigationConfig[role] || navigationConfig['tenant'];

    if (!items) return [];

    return items.map(item => {
      if (item.type === 'link') {
        const itemHref = item.href || '';

        if (itemHref === '/dashboard/messages') {
          return { ...item, badge: unreadMessages > 0 ? unreadMessages.toString() : null };
        }
        if (itemHref === '/dashboard/notifications') {
          return { ...item, badge: unreadNotifications > 0 ? unreadNotifications.toString() : null };
        }
        if (itemHref === '/dashboard/maintenance') {
          return { ...item, badge: pendingMaintenance > 0 ? pendingMaintenance.toString() : null };
        }

        if (role === 'support') {
          if (itemHref === '/dashboard/support/tickets') {

            return item;
          }
          if (itemHref === '/dashboard/support/escalations') {

            return item;
          }
        }

        if (role === 'admin' && itemHref === '/dashboard/admin/support') {

          return item;
        }
      }
      return item;
    });
  };

  const menuItems = getMenuItemsWithBadges();

  return (
    <>
      { }
      {isOpen && (
        <div
          className="fixed h-full inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      { }
      <div className={clsx(
        "fixed h-full inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-white to-gray-50/80 border-r border-gray-200/60 backdrop-blur-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        { }
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

        { }
        <nav className="flex-1 overflow-y-auto mt-8 px-4 pb-24">
          <div className="space-y-1">
            {menuItems.map((item, idx) => (
              <SidebarItem
                key={`${item.label}-${idx}`}
                item={item}
                depth={0}
                openDropdowns={openDropdowns}
                toggleDropdown={toggleDropdown}
                isPathActive={isPathActive}
                onClose={onClose}
              />
            ))}
          </div>
        </nav>

        { }
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


function SidebarItem({
  item,
  depth,
  openDropdowns,
  toggleDropdown,
  isPathActive,
  onClose
}: {
  item: any;
  depth: number;
  openDropdowns: Set<string>;
  toggleDropdown: (label: string) => void;
  isPathActive: (path: string) => boolean;
  onClose: () => void;
}) {
  if (item.type === 'section') {
    return (
      <div className="px-4 py-2 mt-4 mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {item.label}
        </p>
      </div>
    );
  }

  const IconComponent = item.icon;
  const isActive = item.href ? isPathActive(item.href) : false;
  const isDropdownOpen = openDropdowns.has(item.label);


  const paddingLeft = depth > 0 ? `${depth * 1 + 1}rem` : '1rem';

  if (item.type === 'dropdown') {

    const isChildActive = checkActiveRecursive(item.items, isPathActive);

    return (
      <div className="rounded-xl transition-all duration-200">
        <button
          onClick={() => toggleDropdown(item.label)}
          className={clsx(
            "flex items-center justify-between w-full py-3 text-sm font-semibold rounded-xl transition-all duration-200 hover:bg-white/50",
            isChildActive
              ? "text-blue-600"
              : "text-gray-700 hover:text-gray-900",
            depth === 0 ? "px-4" : "pr-4"
          )}
          style={{ paddingLeft: depth === 0 ? undefined : paddingLeft }}
        >
          <div className="flex items-center">
            {IconComponent && <IconComponent className={clsx("w-5 h-5 mr-3", isChildActive ? "text-blue-600" : "text-gray-500")} />}
            {!IconComponent && depth > 0 && <span className="w-5 h-5 mr-3 flex items-center justify-center">•</span>}
            {item.label}
          </div>
          {isDropdownOpen ? (
            <TbChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" />
          ) : (
            <TbChevronRight className="w-4 h-4 text-gray-400 transition-transform duration-200" />
          )}
        </button>

        {isDropdownOpen && item.items && (
          <div className="space-y-1 py-1">
            {item.items.map((subItem: any, index: number) => (
              <SidebarItem
                key={`${subItem.label}-${index}`}
                item={subItem}
                depth={depth + 1}
                openDropdowns={openDropdowns}
                toggleDropdown={toggleDropdown}
                isPathActive={isPathActive}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || '#'}
      onClick={() => window.innerWidth < 1024 && onClose()}
      className={clsx(
        "flex items-center justify-between py-3 text-sm font-semibold rounded-xl transition-all duration-200 group",
        isActive
          ? "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-600 border-r-4 border-blue-600 shadow-sm"
          : "text-gray-700 hover:bg-white/80 hover:text-gray-900 hover:shadow-md",
        depth === 0 ? "px-4" : "pr-4"
      )}
      style={{ paddingLeft: depth === 0 ? undefined : paddingLeft }}
    >
      <div className="flex items-center">
        {IconComponent && (
          <IconComponent className={clsx(
            "w-5 h-5 mr-3 transition-colors duration-200",
            isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"
          )} />
        )}
        {!IconComponent && depth > 0 && <span className="w-5 h-5 mr-3 flex items-center justify-center">•</span>}
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
}

function checkActiveRecursive(items: any[], isPathActive: (path: string) => boolean): boolean {
  if (!items) return false;
  return items.some(subItem => {
    if (subItem.href && isPathActive(subItem.href)) return true;
    if (subItem.items) return checkActiveRecursive(subItem.items, isPathActive);
    return false;
  });
}