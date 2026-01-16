import { api } from './api';



export interface Payment {
  id: string;
  booking?: {
    id: string;
    property: {
      title: string;
      address: string;
    };
  };
  tenant: {
    id: string;
    name: string;
    email: string;
  };
  landlord: {
    id: string;
    name: string;
    email: string;
  };
  type: 'rent' | 'security_deposit' | 'booking' | 'maintenance';
  amount: number;
  amountBDT?: number;
  amountUSD?: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  method?: string;
  rentMonth?: string;
  dueDate?: string;
  paidAt?: string;
  notes?: string;
  escrowStatus?: 'not_applicable' | 'held' | 'released' | 'disputed' | 'refunded';
  escrowReleaseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRentPaymentRequest {
  bookingId: string;
  amount: number;
  rentMonth: string;
  method?: string;
  notes?: string;
}

export interface CreatePaymentSessionRequest {
  returnUrl: string;
}

export interface PaymentSessionResponse {
  sessionId: string;
  sessionUrl: string;
  payment: Payment;
}

export interface PaymentHistoryParams {
  type?: 'rent' | 'security_deposit' | 'booking' | 'maintenance';
  status?: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaymentHistoryResponse {
  payments: Payment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UpcomingPayment {
  id: string;
  booking: {
    id: string;
    property: {
      title: string;
      address: string;
    };
  };
  amount: number;
  dueDate: string;
  rentMonth: string;
  daysUntilDue: number;
}

export interface LandlordEarnings {
  totalEarnings: number;
  pendingPayments: number;
  totalPaid: number;
  breakdown: {
    rent: number;
    securityDeposit: number;
    other: number;
  };
}

export interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  onTimeCount: number;
  lateCount: number;
}

export interface MonthlyPaymentSummary {
  month: string;
  monthLabel: string;
  totalPaid: number;
  totalDue: number;
  totalLateFees: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

export interface EscrowStatus {
  escrowStatus: 'not_applicable' | 'held' | 'released' | 'disputed' | 'refunded';
  holdStartedAt?: string;
  releaseDate?: string;
  releasedAt?: string;
  timeRemaining?: number;
  isReleasable: boolean;
}



export const paymentsApi = {

  createRentPayment: async (
    data: CreateRentPaymentRequest
  ): Promise<Payment> => {
    const response = await api.post('/payments/rent', data);
    return response.data.data;
  },


  createPaymentSession: async (
    paymentId: string,
    data: CreatePaymentSessionRequest
  ): Promise<PaymentSessionResponse> => {
    const response = await api.post(`/payments/rent/${paymentId}/pay`, data);
    return response.data.data;
  },


  getPaymentHistory: async (
    params?: PaymentHistoryParams
  ): Promise<PaymentHistoryResponse> => {
    const response = await api.get('/payments/history', { params });
    return response.data.data;
  },


  getUpcomingPayments: async (
    days: number = 30
  ): Promise<UpcomingPayment[]> => {
    const response = await api.get('/payments/upcoming', {
      params: { days },
    });
    return response.data.data;
  },


  getLandlordEarnings: async (): Promise<LandlordEarnings> => {
    const response = await api.get('/payments/earnings');
    return response.data.data;
  },


  getPaymentSummary: async (): Promise<PaymentSummary> => {
    const response = await api.get('/payments/summary');
    return response.data.data;
  },


  getPayment: async (id: string): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data.data;
  },


  cancelPayment: async (
    id: string,
    reason?: string
  ): Promise<Payment> => {
    const response = await api.patch(`/payments/${id}/cancel`, { reason });
    return response.data.data;
  },


  getEscrowStatus: async (paymentId: string): Promise<EscrowStatus> => {
    const response = await api.get(`/payments/${paymentId}/escrow`);
    return response.data.data;
  },


  raiseDispute: async (
    paymentId: string,
    reason: string
  ): Promise<{ message: string }> => {
    const response = await api.post(`/payments/${paymentId}/dispute`, {
      reason,
    });
    return response.data;
  },


  getStripeConfig: async (): Promise<{ publishableKey: string }> => {
    const response = await api.get('/payments/config');
    return response.data.data;
  },


  getMonthlySummary: async (
    months: number = 12
  ): Promise<MonthlyPaymentSummary[]> => {
    const response = await api.get('/payments/monthly-summary', {
      params: { months },
    });
    return response.data.data;
  },
};

