
export interface PropertyStats {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'maintenance' | 'inquiry';
  title: string;
  description: string;
  timestamp: Date;
  propertyId?: string;
  userId?: string;
}

export interface QuickStats {
  monthlyRevenue: number;
  occupancyRate: number;
  pendingApplications: number;
  maintenanceRequests: number;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: 'apartment' | 'house' | 'studio' | 'condo';
  bedrooms: number;
  bathrooms: number;
  status: 'available' | 'rented' | 'maintenance';
  image: string;
  lastUpdated: Date;
}