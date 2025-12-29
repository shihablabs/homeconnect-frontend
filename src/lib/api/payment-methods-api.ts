import { api } from './api';



export type PaymentMethodType =
  | 'card'
  | 'mobile_banking'
  | 'bank_transfer'
  | 'digital_wallet'
  | 'other';

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  isLive: boolean;
  displayOrder?: number;
  icon?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodData {
  name: string;
  type: PaymentMethodType;
  configurationDetails?: Record<string, unknown>;
  isLive?: boolean;
  displayOrder?: number;
  icon?: string;
  description?: string;
}

export interface UpdatePaymentMethodData {
  name?: string;
  type?: PaymentMethodType;
  configurationDetails?: Record<string, unknown>;
  isLive?: boolean;
  displayOrder?: number;
  icon?: string;
  description?: string;
}



export const paymentMethodsApi = {
  
  getLivePaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get('/payment-methods/live');
    return response.data.data;
  },

  
  getAllPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get('/payment-methods');
    return response.data.data;
  },

  
  getPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    const response = await api.get(`/payment-methods/${id}`);
    return response.data.data;
  },

  
  createPaymentMethod: async (
    data: CreatePaymentMethodData
  ): Promise<PaymentMethod> => {
    const response = await api.post('/payment-methods', data);
    return response.data.data;
  },

  
  updatePaymentMethod: async (
    id: string,
    data: UpdatePaymentMethodData
  ): Promise<PaymentMethod> => {
    const response = await api.patch(`/payment-methods/${id}`, data);
    return response.data.data;
  },

  
  deletePaymentMethod: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/payment-methods/${id}`);
    return response.data;
  },
};

