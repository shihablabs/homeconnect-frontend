import { api } from './api';



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



export const subscriptionsApi = {
  
  createSubscription: async (
    data: CreateSubscriptionRequest
  ): Promise<CreateSubscriptionResponse> => {
    const response = await api.post('/subscriptions', data);
    return response.data.data;
  },

  
  getSubscription: async (bookingId: string): Promise<Subscription> => {
    const response = await api.get(`/subscriptions/${bookingId}`);
    return response.data.data;
  },

  
  cancelSubscription: async (
    bookingId: string
  ): Promise<{ message: string }> => {
    const response = await api.delete(`/subscriptions/${bookingId}`);
    return response.data;
  },
};

