
import { type PropertyResponse } from '@/types/property.types';
import { api } from './api';

export interface TourRequest {
  id: string;
  property: PropertyResponse;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  landlord?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  preferredDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  notes?: string;
  landlordNotes?: string;
  cancellationReason?: string;
  cancellationBy?: 'tenant' | 'landlord';
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export const toursApi = {
  // Submit a new tour request (Tenant)
  scheduleTour: async (propertyId: string, preferredDate: string, notes?: string) => {
    const response = await api.post(`/properties/${propertyId}/tour`, { preferredDate, notes });
    return response.data;
  },

  // Get tours specifically for a property (Landlord/Admin)
  getPropertyTours: async (propertyId: string): Promise<TourRequest[]> => {
    const response = await api.get(`/tours/property/${propertyId}`);
    return response.data.data;
  },

  // Get all tours requested BY the current user (Tenant)
  getMyTours: async (): Promise<TourRequest[]> => {
    const response = await api.get('/tours/my');
    return response.data.data;
  },

  // Get all incoming tours FOR the current user's properties (Landlord)
  getIncomingTours: async (): Promise<TourRequest[]> => {
    const response = await api.get('/tours/incoming');
    return response.data.data;
  },

  // Update tour status (Landlord)
  updateTourStatus: async (
    tourId: string,
    status: 'approved' | 'rejected' | 'completed' | 'cancelled',
    data?: { landlordNotes?: string; cancellationReason?: string; cancellationBy?: 'landlord'; feedback?: string }
  ) => {
    const response = await api.patch(`/tours/${tourId}/status`, { status, ...data });
    return response.data.data;
  },
  // Update tour details (Tenant)
  updateTour: async (tourId: string, updates: { preferredDate?: string; notes?: string }) => {
    const response = await api.patch(`/tours/${tourId}`, updates);
    return response.data.data;
  },

  // Cancel tour request (Tenant)
  cancelTour: async (tourId: string, data?: { cancellationReason?: string; feedback?: string }) => {
    // New endpoint for cancellation with reason
    const response = await api.patch(`/tours/${tourId}/cancel`, data);
    return response.data;
  },
};
