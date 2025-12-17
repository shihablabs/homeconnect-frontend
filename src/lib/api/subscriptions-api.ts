import { api } from './api';

// --- Interfaces & Types ---

export interface Subscription {
  id: string;
  status: string;
  customerId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  items: Array<{
    priceId: string;
    amount: number;
    currency: string;
    interval: string;
  }>;
}

export interface CreateSubscriptionRequest {
  bookingId: string;
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  customerId: string;
  nextBillingDate: string;
  status: string;
  currentPeriodEnd: string;
}

// --- API Implementation ---

export const subscriptionsApi = {
  /**
   * Create a recurring subscription for a booking
   */
  createSubscription: async (
    data: CreateSubscriptionRequest
  ): Promise<CreateSubscriptionResponse> => {
    const response = await api.post('/subscriptions', data);
    return response.data.data;
  },

  /**
   * Get subscription details for a booking
   */
  getSubscription: async (bookingId: string): Promise<Subscription> => {
    const response = await api.get(`/subscriptions/${bookingId}`);
    return response.data.data;
  },

  /**
   * Cancel a recurring subscription
   */
  cancelSubscription: async (
    bookingId: string
  ): Promise<{ message: string }> => {
    const response = await api.delete(`/subscriptions/${bookingId}`);
    return response.data;
  },
};

