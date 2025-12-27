import { api } from './api';

// --- Interfaces & Types ---

export interface Booking {
  id: string;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    images: string[];
  };
  tenant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  landlord: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripeSessionId?: string;
  specialRequests?: string;
  leaseDurationInMonths?: number;
  leaseDocumentURL?: string;
  // Recurring Payment Fields
  isRecurringPayment?: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  nextBillingDate?: string;
  documents?: { name: string; type: string; url: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  specialRequests?: string;
  leaseDurationInMonths?: number;
  leaseDocumentURL?: string;
  setupRecurringPayment?: boolean; // Frontend option to setup recurring payment
  documents?: { name: string; type: string; url: string }[];
}

export interface CreatePaymentSessionRequest {
  bookingId: string;
  returnUrl: string;
}

export interface PaymentSessionResponse {
  sessionId: string;
  url: string;
}

export interface CancelBookingRequest {
  reason: string;
}

// --- API Implementation ---

export const bookingsApi = {
  /**
   * Create a new booking (Tenant Only)
   */
  createBooking: async (data: CreateBookingRequest): Promise<Booking> => {
    const response = await api.post('/bookings', data);
    return response.data.data.booking;
  },

  /**
   * Create Stripe payment session for booking
   */
  createPaymentSession: async (
    data: CreatePaymentSessionRequest
  ): Promise<PaymentSessionResponse> => {
    const response = await api.post('/bookings/payment', data);
    return response.data.data;
  },

  /**
   * Get user's bookings
   * @param type - 'tenant' (bookings made) or 'landlord' (bookings received)
   */
  getUserBookings: async (
    type: 'tenant' | 'landlord' = 'tenant'
  ): Promise<{ bookings: Booking[] }> => {
    const response = await api.get('/bookings/my-bookings', {
      params: { type },
    });
    // Backend returns array directly, wrap it in bookings property
    const bookings = Array.isArray(response.data.data)
      ? response.data.data
      : response.data.data?.bookings || [];
    return { bookings };
  },

  /**
   * Get booking by ID
   */
  getBooking: async (id: string): Promise<Booking> => {
    const response = await api.get(`/bookings/${id}`);
    return response.data.data.booking;
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (
    id: string,
    data: CancelBookingRequest
  ): Promise<Booking> => {
    const response = await api.post(`/bookings/${id}/cancel`, data);
    return response.data.data.booking;
  },

  approveBooking: async (id: string): Promise<Booking> => {
    const response = await api.patch(`/bookings/${id}/approve`);
    return response.data.data.booking;
  },

  rejectBooking: async (id: string, reason: string): Promise<Booking> => {
    const response = await api.patch(`/bookings/${id}/reject`, { reason });
    return response.data.data.booking;
  },
};

