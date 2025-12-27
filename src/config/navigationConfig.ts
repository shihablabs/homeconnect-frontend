
import {
  TbBook,
  TbBuilding,
  TbCertificate,
  TbChartBar,
  TbCreditCard,
  TbGavel,
  TbHeart,
  TbHelp,
  TbHome,
  TbHomeSearch,
  TbMessage,
  TbPackage,
  TbReportMoney,
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
  items?: { href: string; label: string }[];
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
      label: 'RENT & LEASE'
    },
    {
      type: 'dropdown',
      label: 'My Rentals',
      icon: TbHome,
      items: [
        { href: '/dashboard/my-rentals', label: 'Current Home' },
        { href: '/dashboard/rental-history', label: 'Rental History' },
        { href: '/dashboard/lease-agreements', label: 'Lease & Documents' },
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
      type: 'link',
      label: 'Maintenance',
      href: '/dashboard/maintenance',
      icon: TbSettings, // Using Settings as a "repair" icon proxy or we can use Wrench if available in react-icons/tb. TbSettings is fine for now.
      badge: null
    },
    {
      type: 'section',
      label: 'BUYING & INTERESTS'
    },
    {
      type: 'link',
      label: 'Find Properties',
      href: '/properties',
      icon: TbHomeSearch,
      badge: null
    },
    {
      type: 'dropdown',
      label: 'My Purchases',
      icon: TbCertificate,
      items: [
        { href: '/dashboard/my-offers', label: 'My Offers' },
        { href: '/dashboard/saved-sales', label: 'Saved for Sale' },
        { href: '/dashboard/purchase-history', label: 'Purchase Documents' },
      ]
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
      label: 'ACCOUNT & SUPPORT'
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
      label: 'Get Support',
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
      label: 'RENTAL MANAGEMENT'
    },
    {
      type: 'dropdown',
      label: 'Properties (Rent)',
      icon: TbBuilding,
      items: [
        { href: '/dashboard/properties?type=rent', label: 'Rental Listings' },
        { href: '/dashboard/add-property?type=rent', label: 'Post Rental' },
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
        { href: '/dashboard/lease-templates', label: 'Lease Templates' },
        { href: '/dashboard/lease-agreements', label: 'Active Leases' },
      ]
    },
    {
      type: 'link',
      label: 'Rent Collection',
      href: '/dashboard/rent-collection',
      icon: TbReportMoney,
      badge: null
    },
    {
      type: 'link',
      label: 'Maintenance',
      href: '/dashboard/maintenance',
      icon: TbSettings,
      badge: '3'
    },
    {
      type: 'section',
      label: 'PROPERTY SALES'
    },
    {
      type: 'dropdown',
      label: 'Sales Inventory',
      icon: TbCertificate, // Using Certificate as a proxy for deed/sales
      items: [
        { href: '/dashboard/properties?type=sale', label: 'For Sale Listings' },
        { href: '/dashboard/add-property?type=sale', label: 'Post for Sale' },
      ]
    },
    {
      type: 'dropdown',
      label: 'Sales Operations',
      icon: TbGavel, // Gavel for negotiation/legal
      items: [
        { href: '/dashboard/sales/offers', label: 'Offers Received' },
        { href: '/dashboard/sales/contracts', label: 'Sales Contracts' },
        { href: '/dashboard/sales/closings', label: 'Closing Actions' },
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
        { href: '/dashboard/expenses', label: 'Expense Tracking' },
        { href: '/dashboard/reports', label: 'Profit & Loss' },
        { href: '/dashboard/taxes', label: 'Tax Documents' },
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
      type: 'dropdown',
      label: 'Property Verification',
      icon: TbBuilding,
      items: [
        { href: '/dashboard/admin/properties?type=rent', label: 'Rental Approvals' },
        { href: '/dashboard/admin/properties?type=sale', label: 'Sales Approvals' },
        { href: '/dashboard/admin/categories', label: 'Categories' },
      ]
    },
    {
      type: 'dropdown',
      label: 'Financials',
      icon: TbCreditCard,
      items: [
        { href: '/dashboard/admin/transactions', label: 'All Transactions' },
        { href: '/dashboard/admin/commissions', label: 'Platform Fees' },
        { href: '/dashboard/admin/escrow', label: 'Escrow Management' },
      ]
    },
    {
      type: 'section',
      label: 'CONTENT & CONFIG'
    },
    {
      type: 'link',
      label: 'Blog Posts',
      href: '/dashboard/blogs',
      icon: TbBook,
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
      type: 'dropdown',
      label: 'Resources',
      icon: TbHelp,
      items: [
        { href: '/dashboard/support/knowledge-base', label: 'Knowledge Base' },
        { href: '/dashboard/support/faqs', label: 'Manage FAQs' },
      ]
    }
  ]
};
