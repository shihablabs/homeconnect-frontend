import { api } from './api';

// --- Interfaces & Types ---

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

// --- API Implementation ---

export const adminApi = {
  /**
   * Get admin dashboard statistics
   */
  getAdminStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data.data;
  },

  /**
   * Get properties pending verification
   */
  getPendingProperties: async (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'under_review' | 'approved' | 'rejected';
  }): Promise<{
    properties: PendingProperty[];
    pagination: {
      total: number;
      page: number;
      totalPages: number;
    };
  }> => {
    const response = await api.get('/admin/properties/pending', { params });
    // Backend returns: { data: properties[], meta: { total, page, totalPages, ... } }
    return {
      properties: response.data.data || [],
      pagination: {
        total: response.data.meta?.total || 0,
        page: response.data.meta?.page || 1,
        totalPages: response.data.meta?.totalPages || 1,
      },
    };
  },

  /**
   * Get property details for admin review
   */
  getPropertyForReview: async (
    id: string
  ): Promise<PropertyWithVerification> => {
    const response = await api.get(`/admin/properties/${id}`);
    return response.data.data;
  },

  /**
   * Verify (Approve/Reject) a property
   */
  verifyProperty: async (
    id: string,
    data: VerifyPropertyRequest
  ): Promise<PropertyWithVerification> => {
    const response = await api.patch(`/admin/properties/${id}/verify`, data);
    return response.data.data;
  },

  /**
   * Add verification document to property
   */
  addDocument: async (
    propertyId: string,
    data: AddDocumentRequest
  ): Promise<PropertyWithVerification> => {
    const response = await api.post(`/admin/properties/${propertyId}/documents`, data);
    return response.data.data;
  },

  /**
   * Remove verification document from property
   */
  removeDocument: async (
    propertyId: string,
    url: string
  ): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/properties/${propertyId}/documents`, {
      data: { url },
    });
    return response.data;
  },

  /**
   * Get all users with pagination and filters
   */
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
    // Backend returns: { data: User[], meta: PaginationInfo }
    // Frontend expects: { users: User[], pagination: PaginationInfo }
    const users = Array.isArray(response.data.data) ? response.data.data : [];
    const pagination = response.data.meta || {
      total: users.length,
      page: params?.page || 1,
      totalPages: 1,
    };
    return { users, pagination };
  },

  /**
   * Get user statistics
   */
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get('/admin/users/stats');
    return response.data.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.data;
  },

  /**
   * Update user status (activate/block)
   */
  updateUserStatus: async (
    id: string,
    data: UpdateUserStatusRequest
  ): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/status`, data);
    return response.data.data;
  },

  /**
   * Delete a user (soft delete)
   */
  deleteUser: async (
    id: string,
    reason?: string
  ): Promise<{ userId: string; deletedAt: string }> => {
    const response = await api.delete(`/admin/users/${id}`, {
      data: { reason },
    });
    return response.data.data;
  },

  /**
   * Restore a soft-deleted user
   */
  restoreUser: async (id: string): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/restore`);
    return response.data.data;
  },

  /**
   * Get escrow statistics
   */
  getEscrowStats: async (): Promise<EscrowStats> => {
    const response = await api.get('/admin/escrow/stats');
    return response.data.data;
  },

  /**
   * Get all disputed payments
   */
  getDisputedPayments: async (): Promise<DisputedPayment[]> => {
    const response = await api.get('/admin/escrow/disputed');
    return response.data.data;
  },

  /**
   * Resolve a disputed payment
   */
  resolveDispute: async (
    paymentId: string,
    data: ResolveDisputeRequest
  ): Promise<{ message: string }> => {
    const response = await api.post(`/admin/escrow/${paymentId}/resolve`, data);
    return response.data;
  },

  /**
   * Manually release funds to landlord
   */
  manualRelease: async (
    paymentId: string
  ): Promise<{ message: string }> => {
    const response = await api.post(`/admin/escrow/${paymentId}/release`);
    return response.data;
  },

  /**
   * Refund a payment
   */
  refundPayment: async (
    paymentId: string,
    reason?: string
  ): Promise<{ message: string }> => {
    const response = await api.post(`/admin/escrow/${paymentId}/refund`, {
      reason,
    });
    return response.data;
  },

  /**
   * Create support/admin staff account (Admin Only)
   */
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

