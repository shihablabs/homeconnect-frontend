
import {
  TbBook,
  TbBuilding,
  TbCalendar,
  TbCertificate,
  TbChartBar,
  TbCreditCard,
  TbHeart,
  TbHelp,
  TbHome,
  TbHomeSearch,
  TbMail,
  TbMessage,
  TbPackage,
  TbSettings,
  TbUser,
  TbUsers
} from 'react-icons/tb';

export type NavItemType = 'link' | 'dropdown' | 'section';

export interface NavItem {
  type: NavItemType;
  label: string;
  href?: string;
  icon?: React.ElementType;
  badge?: string | null;
  items?: NavItem[]; 
}

export interface RoleConfig {
  [key: string]: NavItem[];
}

export const navigationConfig: RoleConfig = {
  tenant: [
    {
      type: 'link',
      label: 'Dashboard',
      href: '/dashboard',
      icon: TbChartBar,
      badge: null
    },
    {
      type: 'section',
      label: 'RENTAL MANAGEMENT'
    },
    {
      type: 'link',
      label: 'My Bookings',
      href: '/dashboard/bookings',
      icon: TbBook,
      badge: null
    },
    {
      type: 'dropdown',
      label: 'My Rentals',
      icon: TbHome,
      items: [
        { type: 'link', href: '/dashboard/my-rentals', label: 'Current Home' },
        { type: 'link', href: '/dashboard/rental-history', label: 'Rental History' },
        { type: 'link', href: '/dashboard/lease-agreements', label: 'Lease & Documents' },
      ]
    },
    {
      type: 'link',
      label: 'Payments',
      href: '/dashboard/payments',
      icon: TbCreditCard,
      badge: null
    },
    {
      type: 'dropdown',
      label: 'Maintenance',
      icon: TbSettings,
      items: [
        { type: 'link', href: '/dashboard/maintenance', label: 'My Requests' },
        { type: 'link', href: '/dashboard/maintenance?action=create', label: 'New Request' },
      ]
    },
    {
      type: 'section',
      label: 'DISCOVERY & PLANNING'
    },
    {
      type: 'link',
      label: 'Find Properties',
      href: '/properties',
      icon: TbHomeSearch,
      badge: null
    },
    {
      type: 'link',
      label: 'My Tours',
      href: '/dashboard/my-tours',
      icon: TbCalendar,
      badge: null
    },
    {
      type: 'link',
      label: 'Favorites',
      href: '/dashboard/favorites',
      icon: TbHeart,
      badge: null
    },
    {
      type: 'section',
      label: 'SUPPORT & ACCOUNT'
    },
    {
      type: 'link',
      label: 'Messages',
      href: '/dashboard/messages',
      icon: TbMessage,
      badge: '5'
    },
    {
      type: 'link',
      label: 'Service Requests',
      href: '/dashboard/my-orders',
      icon: TbPackage,
      badge: null
    },
    {
      type: 'link',
      label: 'Help & Support',
      href: '/dashboard/support',
      icon: TbHelp,
      badge: null
    },
    {
      type: 'link',
      label: 'Settings',
      href: '/dashboard/profile',
      icon: TbUser,
      badge: null
    }
  ],
  landlord: [
    {
      type: 'link',
      label: 'Overview',
      href: '/dashboard',
      icon: TbChartBar,
      badge: null
    },
    {
      type: 'section',
      label: 'PROPERTY MANAGEMENT'
    },
    {
      type: 'dropdown',
      label: 'Properties',
      icon: TbBuilding,
      items: [
        {
          type: 'link',
          label: 'All Properties',
          href: '/dashboard/properties',
        },
        {
          type: 'link',
          label: 'Add New Property',
          href: '/dashboard/add-property',
        },
        {
          type: 'dropdown',
          label: 'Rent Management',
          icon: TbHome,
          items: [
            { type: 'link', href: '/dashboard/rent-collection', label: 'Rent Collection' },
            { type: 'link', href: '/dashboard/tenants', label: 'Active Tenants' },
            { type: 'link', href: '/dashboard/tenant-applications', label: 'Applications' },
            { type: 'link', href: '/dashboard/lease-agreements', label: 'Lease Agreements' },
            { type: 'link', href: '/dashboard/lease-templates', label: 'Lease Templates' },
            { type: 'link', href: '/dashboard/property-tours', label: 'Tour Requests' },
          ]
        },
        {
          type: 'dropdown',
          label: 'Sale Management',
          icon: TbCertificate,
          items: [
            { type: 'link', href: '/dashboard/sales/offers', label: 'Offers Received' },
            { type: 'link', href: '/dashboard/sales/contracts', label: 'Sales Contracts' },
            { type: 'link', href: '/dashboard/sales/closings', label: 'Closing Actions' },
          ]
        }
      ]
    },
    {
      type: 'dropdown',
      label: 'Maintenance',
      icon: TbSettings,
      items: [
        { type: 'link', href: '/dashboard/maintenance', label: 'All Requests' },
        { type: 'link', href: '/dashboard/maintenance?status=pending', label: 'Pending Requests' },
      ]
    },
    {
      type: 'dropdown',
      label: 'Newsletter',
      icon: TbMail,
      items: [
        { type: 'link', href: '/dashboard/newsletter?tab=subscribers', label: 'Subscribers' },
        { type: 'link', href: '/dashboard/newsletter?tab=history', label: 'Campaigns' },
        { type: 'link', href: '/dashboard/newsletter?tab=compose', label: 'Compose' },
      ]
    },
    {
      type: 'section',
      label: 'FINANCE & TOOLS'
    },
    {
      type: 'dropdown',
      label: 'Financials',
      icon: TbCreditCard,
      items: [
        { type: 'link', href: '/dashboard/expenses', label: 'Expense Tracking' },
        { type: 'link', href: '/dashboard/reports', label: 'Profit & Loss' },
        { type: 'link', href: '/dashboard/taxes', label: 'Tax Documents' },
      ]
    },
    {
      type: 'link',
      label: 'Messages',
      href: '/dashboard/messages',
      icon: TbMessage,
      badge: '12'
    },
    {
      type: 'link',
      label: 'Settings',
      href: '/dashboard/profile',
      icon: TbUser,
      badge: null
    }
  ],
  admin: [
    {
      type: 'link',
      label: 'Overview',
      href: '/dashboard',
      icon: TbChartBar,
      badge: null
    },
    {
      type: 'section',
      label: 'PLATFORM OPERATIONS'
    },
    {
      type: 'link',
      label: 'User Management',
      href: '/dashboard/admin/users',
      icon: TbUsers,
      badge: null
    },
    {
      type: 'link',
      label: 'Contact Inquiries',
      href: '/dashboard/contacts',
      icon: TbMessage,
      badge: null
    },
    {
      type: 'dropdown',
      label: 'Property Verification',
      icon: TbBuilding,
      items: [
        { type: 'link', href: '/dashboard/admin/properties', label: 'Property Approvals' },
        { type: 'link', href: '/dashboard/admin/categories', label: 'Categories' },
      ]
    },
    {
      type: 'dropdown',
      label: 'Financials',
      icon: TbCreditCard,
      items: [
        { type: 'link', href: '/dashboard/admin/transactions', label: 'All Transactions' },
        { type: 'link', href: '/dashboard/admin/commissions', label: 'Platform Fees' },
        { type: 'link', href: '/dashboard/admin/escrow', label: 'Escrow Management' },
      ]
    },
    {
      type: 'section',
      label: 'CONTENT & CONFIG'
    },
    {
      type: 'dropdown',
      label: 'Blog Posts',
      icon: TbBook,
      items: [
        { type: 'link', href: '/dashboard/blogs', label: 'All Blogs' },
        { type: 'link', href: '/dashboard/blogs/create', label: 'Create New' },
      ]
    },
    {
      type: 'link',
      label: 'Newsletter Manager',
      href: '/dashboard/newsletter',
      icon: TbMail,
      badge: null
    },
    {
      type: 'link',
      label: 'Site Settings',
      href: '/dashboard/admin/site-settings',
      icon: TbSettings,
      badge: null
    }
  ],
  support: [
    {
      type: 'link',
      label: 'Overview',
      href: '/dashboard',
      icon: TbChartBar,
      badge: null
    },
    {
      type: 'section',
      label: 'TICKETS & HELP'
    },
    {
      type: 'link',
      label: 'All Tickets',
      href: '/dashboard/support/tickets',
      icon: TbMessage,
      badge: null
    },
    {
      type: 'link',
      label: 'Contact Inquiries',
      href: '/dashboard/contacts',
      icon: TbMessage,
      badge: null
    },
    {
      type: 'link',
      label: 'Newsletter Manager',
      href: '/dashboard/newsletter',
      icon: TbMail,
      badge: null
    },
    {
      type: 'dropdown',
      label: 'Resources',
      icon: TbHelp,
      items: [
        { type: 'link', href: '/dashboard/support/knowledge-base', label: 'Knowledge Base' },
        { type: 'link', href: '/dashboard/support/faqs', label: 'Manage FAQs' },
      ]
    }
  ]
};
