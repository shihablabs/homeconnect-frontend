'use client';

import { useDashboardCounts } from '@/hooks/useDashboardCounts';
import { pacifico } from '@/lib/fonts';
import { useLogoutMutation } from '@/redux/features/auth/authApiSlice';
import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  TbBell,
  TbBook,
  TbBuilding,
  TbCalendar,
  TbChartBar,
  TbChevronDown,
  TbChevronRight,
  TbCreditCard,
  TbFileText,
  TbHeart,
  TbHelp,
  TbHome,
  TbHomeSearch,
  TbLogout,
  TbMessage,
  TbPackage,
  TbSettings,
  TbUser,
  TbUsers
} from 'react-icons/tb';
import { toast } from 'sonner';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'tenant' | 'landlord' | 'admin' | 'support';
}

// Role-based menu configuration
const menuConfig = {
  tenant: [
    {
      type: 'link',
      href: '/dashboard',
      label: 'Dashboard',
      icon: TbChartBar,
      badge: null
    },
    {
      type: 'section',
      label: 'Rental Management'
    },
    {
      type: 'dropdown',
      label: 'My Rentals',
      icon: TbHome,
      items: [
        { href: '/dashboard/my-rentals', label: 'Current Rentals' },
        { href: '/dashboard/rental-history', label: 'Rental History' },
        { href: '/dashboard/lease-agreements', label: 'Lease Agreements' },
      ]
    },
    {
      type: 'link',
      href: '/dashboard/bookings',
      label: 'Bookings & Tours',
      icon: TbCalendar,
      badge: null
    },
    {
      type: 'link',
      href: '/dashboard/payments',
      label: 'Payments',
      icon: TbCreditCard,
      badge: null
    },
    {
      type: 'section',
      label: 'Discovery'
    },
    {
      type: 'link',
      href: '/dashboard/search',
      label: 'Find Properties',
      icon: TbHomeSearch,
      badge: null
    },
    {
      type: 'link',
      href: '/dashboard/favorites',
      label: 'Favorites',
      icon: TbHeart,
      badge: null
    },
    {
      type: 'section',
      label: 'Services'
    },
    {
      type: 'link',
      href: '/dashboard/order-home',
      label: 'Service Requisition',
      icon: TbPackage,
      badge: null
    },
    {
      type: 'link',
      href: '/dashboard/my-orders',
      label: 'My Requisitions',
      icon: TbFileText,
      badge: null
    },
    {
      type: 'section',
      label: 'Support'
    },
    {
      type: 'link',
      href: '/dashboard/messages',
      label: 'Messages',
      icon: TbMessage,
      badge: '5'
    },
    {
      type: 'link',
      href: '/dashboard/support',
      label: 'Get Support',
      icon: TbHelp,
      badge: null
    },
    {
      type: 'link',
      href: '/dashboard/profile',
      label: 'Settings',
      icon: TbUser,
      badge: null
    }
  ],
  landlord: [
    {
      type: 'link',
      href: '/dashboard',
      label: 'Overview',
      icon: TbChartBar,
      badge: null
    },
    {
      type: 'section',
      label: 'Property Management'
    },
    {
      type: 'dropdown',
      label: 'Properties',
      icon: TbBuilding,
      items: [
        { href: '/dashboard/properties', label: 'All Properties' },
        { href: '/dashboard/add-property', label: 'List New Property' },
        { href: '/dashboard/property-tours', label: 'Tour Requests' },
      ]
    },
    {
      type: 'dropdown',
      label: 'Tenants & Leases',
      icon: TbUsers,
      items: [
        { href: '/dashboard/tenants', label: 'Active Tenants' },
        { href: '/dashboard/tenant-applications', label: 'Applications' },
        { href: '/dashboard/tenant-screening', label: 'Screening' },
        { href: '/dashboard/lease-templates', label: 'Lease Templates' },
      ]
    },
    {
      type: 'link',
      href: '/dashboard/maintenance',
      label: 'Maintenance',
      icon: TbSettings,
      badge: '3'
    },
    {
      type: 'section',
      label: 'Financials'
    },
    {
      type: 'dropdown',
      label: 'Finances',
      icon: TbCreditCard,
      items: [
        { href: '/dashboard/rent-collection', label: 'Rent Collection' },
        { href: '/dashboard/expenses', label: 'Expense Tracking' },
        { href: '/dashboard/reports', label: 'Financial Reports' },
      ]
    },
    {
      type: 'section',
      label: 'Communication'
    },
    {
      type: 'link',
      href: '/dashboard/messages',
      label: 'Messages',
      icon: TbMessage,
      badge: '12'
    },
    {
      type: 'link',
      href: '/dashboard/notifications',
      label: 'Notifications',
      icon: TbBell,
      badge: null
    },
    {
      type: 'link',
      href: '/dashboard/profile',
      label: 'Settings',
      icon: TbUser,
      badge: null
    }
  ],
  admin: [
    {
      type: 'link',
      href: '/dashboard',
      label: 'Overview',
      icon: TbChartBar,
      badge: null
    },
    {
      type: 'section',
      label: 'System Management'
    },
    {
      type: 'link',
      href: '/dashboard/admin/users',
      label: 'Users & Roles',
      icon: TbUsers,
      badge: null
    },
    {
      type: 'dropdown',
      label: 'Properties',
      icon: TbBuilding,
      items: [
        { href: '/dashboard/admin/properties', label: 'Verification Queue' },
        { href: '/dashboard/admin/categories', label: 'Categories' },
      ]
    },
    {
      type: 'section',
      label: 'Operations'
    },
    {
      type: 'link',
      href: '/dashboard/admin/orders',
      label: 'Order Management',
      icon: TbPackage,
      badge: null
    },
    {
      type: 'dropdown',
      label: 'Financials',
      icon: TbCreditCard,
      items: [
        { href: '/dashboard/admin/transactions', label: 'Transactions' },
        { href: '/dashboard/admin/commissions', label: 'Platform Fees' },
        { href: '/dashboard/admin/escrow', label: 'Escrow Management' },
        { href: '/dashboard/admin/reports', label: 'Global Reports' },
      ]
    },
    {
      type: 'section',
      label: 'Content & Support'
    },

    {
      type: 'link',
      href: '/dashboard/blogs',
      label: 'Blog Management',
      icon: TbBook,
      badge: null
    },
    {
      type: 'link',
      href: '/dashboard/newsletter-subscribers',
      label: 'Newsletter List',
      icon: TbMessage,
      badge: null
    },
    {
      type: 'link',
      href: '/dashboard/admin/support',
      label: 'Support Center',
      icon: TbHelp,
      badge: '25'
    },
    {
      type: 'section',
      label: 'Configuration'
    },
    {
      type: 'link',
      href: '/dashboard/admin/site-settings',
      label: 'Site Settings',
      icon: TbSettings,
      badge: null
    },
    {
      type: 'link',
      href: '/dashboard/admin/analytics',
      label: 'Platform Analytics',
      icon: TbChartBar,
      badge: null
    }
  ],
  support: [
    {
      type: 'link',
      href: '/dashboard',
      label: 'Overview',
      icon: TbChartBar,
      badge: null
    },
    {
      type: 'section',
      label: 'Ticket Management'
    },
    {
      type: 'link',
      href: '/dashboard/support/tickets',
      label: 'All Tickets',
      icon: TbMessage,
      badge: null
    },
    {
      type: 'link',
      href: '/dashboard/maintenance',
      label: 'Maintenance Requests',
      icon: TbSettings,
      badge: null
    },
    {
      type: 'link',
      href: '/dashboard/support/orders',
      label: 'Order Processing',
      icon: TbPackage,
      badge: null
    },
    {
      type: 'section',
      label: 'User Assistance'
    },
    {
      type: 'link',
      href: '/dashboard/users',
      label: 'User Lookup',
      icon: TbUsers,
      badge: null
    },
    {
      type: 'dropdown',
      label: 'Help Resources',
      icon: TbHelp,
      items: [
        { href: '/dashboard/support/knowledge-base', label: 'Knowledge Base' },
        { href: '/dashboard/support/faqs', label: 'Manage FAQs' },
        { href: '/dashboard/support/guides', label: 'User Guides' },
      ]
    },
    {
      type: 'link',
      href: '/dashboard/blogs',
      label: 'Blog Management',
      icon: TbBook,
      badge: null
    },
    {
      type: 'link',
      href: '/dashboard/newsletter-subscribers',
      label: 'Newsletter List',
      icon: TbMessage,
      badge: null
    }
  ]
};

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

  // Load dropdown state from localStorage after mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`dashboard-dropdowns-${role}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setOpenDropdowns(new Set(Array.isArray(parsed) ? parsed : []));
        }
      } catch (error) {
        console.error('Failed to load dropdown state:', error);
      }
    }
  }, [role]);

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
    // Fallback to 'tenant' if role is undefined or not in menuConfig
    const items = menuConfig[role] || menuConfig['tenant'];

    if (!items) return []; // Safety check

    return items.map(item => {
      if (item.type === 'link') {
        // Update badges based on href
        if (item.href === '/dashboard/messages') {
          return { ...item, badge: unreadMessages > 0 ? unreadMessages.toString() : null };
        }
        if (item.href === '/dashboard/notifications') {
          return { ...item, badge: unreadNotifications > 0 ? unreadNotifications.toString() : null };
        }
        if (item.href === '/dashboard/maintenance') {
          return { ...item, badge: pendingMaintenance > 0 ? pendingMaintenance.toString() : null };
        }
        // Support-specific badges
        if (role === 'support') {
          if (item.href === '/dashboard/support/tickets') {
            // Could be enhanced with actual support ticket count
            return item;
          }
          if (item.href === '/dashboard/support/escalations') {
            // Could be enhanced with actual escalation count
            return item;
          }
        }
        // Admin-specific badges
        if (role === 'admin' && item.href === '/dashboard/admin/support') {
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
              const isActive = pathname === item.href;
              const isDropdownOpen = openDropdowns.has(item.label);

              // Type guard for items with icons
              if (!IconComponent) return null;

              if (item.type === 'dropdown') {
                return (
                  <div key={item.label} className="rounded-xl transition-all duration-200 hover:bg-white/50">
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className="flex items-center justify-between w-full px-4 py-4 text-sm font-semibold text-gray-700 rounded-xl hover:text-gray-900 transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <IconComponent className="w-5 h-5 mr-3 text-blue-600" />
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
                        {item.items?.map((subItem, index) => (
                          <Link
                            key={`${subItem.href}-${subItem.label}-${index}`}
                            href={subItem.href}
                            className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
                            onClick={() => window.innerWidth < 1024 && onClose()}
                          >
                            <TbChevronRight className="w-3 h-3 mr-2" />
                            {subItem.label}
                          </Link>
                        ))}
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