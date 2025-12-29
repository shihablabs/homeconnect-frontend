import { api } from './api';



export interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalPayments: number;
  propertiesByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  usersByRole: {
    tenant: number;
    landlord: number;
    admin: number;
    support: number;
  };
}

export interface PendingProperty {
  id: string;
  slug: string;
  title: string;
  address: string;
  city: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  verificationStatus: 'pending' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
}

export interface PropertyWithVerification extends PendingProperty {
  description: string;
  listingType: 'rent' | 'sale';
  propertyType: string;
  images: string[];
  documents: Array<{
    url: string;
    type: string;
    uploadedAt: string;
  }>;
  verificationNotes?: string;
  verificationDate?: string;
  verifiedBy?: {
    id: string;
    name: string;
    email: string;
  };
  verificationHistory: Array<{
    status: string;
    notes?: string;
    reviewedBy: string;
    reviewedAt: string;
  }>;
}

export interface VerifyPropertyRequest {
  verificationStatus: 'pending' | 'under_review' | 'approved' | 'rejected';
  verificationNotes?: string;
}

export interface AddDocumentRequest {
  url: string;
  type: string;
}

export interface User {
  id: string;
  slug: string; 
  name: string;
  email: string;
  role: 'tenant' | 'landlord' | 'admin' | 'support';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  deletedAt?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  deletedUsers: number;
  byRole: {
    tenant: number;
    landlord: number;
    admin: number;
    support: number;
  };
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
  reason?: string;
}

export interface EscrowStats {
  totalHeld: number;
  totalHeldAmount: number;
  totalDisputed: number;
  totalDisputedAmount: number;
  releasedToday: number;
  upcomingReleases: number;
}

export interface DisputedPayment {
  id: string;
  amount: number;
  tenant: {
    id: string;
    name: string;
  };
  landlord: {
    id: string;
    name: string;
  };
  disputeReason: string;
  disputedAt: string;
  booking?: {
    id: string;
    property: {
      title: string;
    };
  };
}

export interface ResolveDisputeRequest {
  resolution: 'release' | 'refund';
  adminNote?: string;
}



export const adminApi = {
  
  getAdminStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data.data;
  },

  
  getPendingProperties: async (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'under_review' | 'approved' | 'rejected';
    sort?: string;
  }): Promise<{
    properties: PendingProperty[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
    };
  }> => {
    const response = await api.get('/admin/properties/pending', { params });
    
    return {
      properties: response.data.data || [],
      pagination: {
        total: response.data.meta?.total || 0,
        page: response.data.meta?.page || 1,
        totalPages: response.data.meta?.totalPages || 1,
      },
    };
  },

  
  getPropertyForReview: async (
    id: string
  ): Promise<PropertyWithVerification> => {
    const response = await api.get(`/admin/properties/${id}`);
    return response.data.data;
  },

  
  verifyProperty: async (
    id: string,
    data: VerifyPropertyRequest
  ): Promise<PropertyWithVerification> => {
    const response = await api.patch(`/admin/properties/${id}/verify`, data);
    return response.data.data;
  },

  
  addDocument: async (
    propertyId: string,
    data: AddDocumentRequest
  ): Promise<PropertyWithVerification> => {
    const response = await api.post(`/admin/properties/${propertyId}/documents`, data);
    return response.data.data;
  },

  
  removeDocument: async (
    propertyId: string,
    url: string
  ): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/properties/${propertyId}/documents`, {
      data: { url },
    });
    return response.data;
  },

  
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'tenant' | 'landlord' | 'admin' | 'support';
    status?: 'active' | 'blocked' | 'all';
    sortBy?: 'createdAt' | 'name' | 'email' | 'lastLogin';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    users: User[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
    };
  }> => {
    const response = await api.get('/admin/users', { params });
    
    
    const users = Array.isArray(response.data.data) ? response.data.data : [];
    const pagination = response.data.meta || {
      total: users.length,
      page: params?.page || 1,
      totalPages: 1,
    };
    return { users, pagination };
  },

  
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get('/admin/users/stats');
    return response.data.data;
  },

  
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.data;
  },

  
  updateUserStatus: async (
    id: string,
    data: UpdateUserStatusRequest
  ): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/status`, data);
    return response.data.data;
  },

  
  deleteUser: async (
    id: string,
    reason?: string
  ): Promise<{ userId: string; deletedAt: string }> => {
    const response = await api.delete(`/admin/users/${id}`, {
      data: { reason },
    });
    return response.data.data;
  },

  
  restoreUser: async (id: string): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/restore`);
    return response.data.data;
  },

  
  getEscrowStats: async (): Promise<EscrowStats> => {
    const response = await api.get('/admin/escrow/stats');
    return response.data.data;
  },

  
  getDisputedPayments: async (): Promise<DisputedPayment[]> => {
    const response = await api.get('/admin/escrow/disputed');
    return response.data.data;
  },

  
  resolveDispute: async (
    paymentId: string,
    data: ResolveDisputeRequest
  ): Promise<{ message: string }> => {
    const response = await api.post(`/admin/escrow/${paymentId}/resolve`, data);
    return response.data;
  },

  
  manualRelease: async (
    paymentId: string
  ): Promise<{ message: string }> => {
    const response = await api.post(`/admin/escrow/${paymentId}/release`);
    return response.data;
  },

  
  refundPayment: async (
    paymentId: string,
    reason?: string
  ): Promise<{ message: string }> => {
    const response = await api.post(`/admin/escrow/${paymentId}/refund`, {
      reason,
    });
    return response.data;
  },

  
  createStaffAccount: async (data: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'support';
    phone?: string;
  }): Promise<User> => {
    const response = await api.post('/admin/users/create-staff', data);
    return response.data.data;
  },
};

