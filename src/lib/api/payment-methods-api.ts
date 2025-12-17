import { api } from './api';

// --- Interfaces & Types ---

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

// --- API Implementation ---

export const paymentMethodsApi = {
  /**
   * Get live payment methods (Public)
   * Used by frontend to display available payment options
   */
  getLivePaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get('/payment-methods/live');
    return response.data.data;
  },

  /**
   * Get all payment methods (Admin only)
   */
  getAllPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get('/payment-methods');
    return response.data.data;
  },

  /**
   * Get a single payment method by ID (Admin only)
   */
  getPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    const response = await api.get(`/payment-methods/${id}`);
    return response.data.data;
  },

  /**
   * Create a new payment method (Admin only)
   */
  createPaymentMethod: async (
    data: CreatePaymentMethodData
  ): Promise<PaymentMethod> => {
    const response = await api.post('/payment-methods', data);
    return response.data.data;
  },

  /**
   * Update payment method (Admin only)
   */
  updatePaymentMethod: async (
    id: string,
    data: UpdatePaymentMethodData
  ): Promise<PaymentMethod> => {
    const response = await api.patch(`/payment-methods/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete payment method (Admin only)
   */
  deletePaymentMethod: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/payment-methods/${id}`);
    return response.data;
  },
};

