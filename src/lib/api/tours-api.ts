
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
  
  scheduleTour: async (propertyId: string, preferredDate: string, notes?: string) => {
    const response = await api.post(`/properties/${propertyId}/tour`, { preferredDate, notes });
    return response.data;
  },

  
  getPropertyTours: async (propertyId: string): Promise<TourRequest[]> => {
    const response = await api.get(`/tours/property/${propertyId}`);
    return response.data.data;
  },

  
  getMyTours: async (): Promise<TourRequest[]> => {
    const response = await api.get('/tours/my');
    return response.data.data;
  },

  
  getIncomingTours: async (): Promise<TourRequest[]> => {
    const response = await api.get('/tours/incoming');
    return response.data.data;
  },

  
  updateTourStatus: async (
    tourId: string,
    status: 'approved' | 'rejected' | 'completed' | 'cancelled',
    data?: { landlordNotes?: string; cancellationReason?: string; cancellationBy?: 'landlord'; feedback?: string }
  ) => {
    const response = await api.patch(`/tours/${tourId}/status`, { status, ...data });
    return response.data.data;
  },
  
  updateTour: async (tourId: string, updates: { preferredDate?: string; notes?: string }) => {
    const response = await api.patch(`/tours/${tourId}`, updates);
    return response.data.data;
  },

  
  cancelTour: async (tourId: string, data?: { cancellationReason?: string; feedback?: string }) => {
    
    const response = await api.patch(`/tours/${tourId}/cancel`, data);
    return response.data;
  },
};
