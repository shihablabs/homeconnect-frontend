// orderApiSlice.ts
import { apiSlice } from '../../api/apiSlice';

export interface OrderPackage {
  packageId: string;
  packageName: string;
  price: number;
  currency: string;
  features: string[];
  duration: number;
}

export interface OrderPreferences {
  preferredLocations?: string[];
  city?: string;
  neighborhood?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  areaUnit?: string;
  minBudget?: number;
  maxBudget?: number;
  currency?: string;
  furnished?: boolean;
  petFriendly?: boolean;
  parking?: boolean;
  amenities?: string[];
  moveInDate?: string;
  specialRequirements?: string;
}

export interface OrderHome {
  id: string;
  user: string | { name: string; email: string; phone?: string };
  listingType: 'rent' | 'sale' | 'both';
  preferences: OrderPreferences;
  package: OrderPackage;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'refunded' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  assignedTo?: string | { name: string; email: string };
  assignedAt?: string;
  response?: string;
  respondedAt?: string;
  orderDate: string;
  deadline: string;
  completedAt?: string;
  suggestions?: string[];
  suggestionsAddedAt?: string;
  refundEligible: boolean;
  refundRequested?: boolean;
  refundRequestedAt?: string;
  refundProcessed?: boolean;
  refundProcessedAt?: string;
  refundAmount?: number;
  paymentIntentId?: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  listingType: 'rent' | 'sale' | 'both';
  preferences: OrderPreferences;
  packageId: 'basic' | 'premium' | 'elite';
  paymentMethod?: string;
  notes?: string;
}

export interface RespondToOrderRequest {
  response: string;
  suggestions?: string[];
}

export const orderApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPackages: builder.query<{ packages: OrderPackage[] }, void>({
      query: () => '/orders/packages',
      transformResponse: (response: { status: string; data: { packages: OrderPackage[] } }) => response.data,
    }),

    createOrder: builder.mutation<{ order: OrderHome }, CreateOrderRequest>({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { status: string; data: { order: OrderHome } }) => response.data,
    }),

    getMyOrders: builder.query<{ orders: OrderHome[] }, void>({
      query: () => '/orders/my-orders',
      transformResponse: (response: { status: string; data: { orders: OrderHome[] } }) => response.data,
    }),

    getAllOrders: builder.query<
      { orders: OrderHome[] },
      { status?: string; assignedTo?: string; listingType?: string } | void
    >({
      query: (filters) => ({
        url: '/orders',
        params: filters || {},
      }),
      transformResponse: (response: { status: string; data: { orders: OrderHome[] } }) => response.data,
    }),

    getOrderById: builder.query<{ order: OrderHome }, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (response: { status: string; data: { order: OrderHome } }) => response.data,
    }),

    acceptOrder: builder.mutation<
      { order: OrderHome },
      { orderId: string; assignedTo: string }
    >({
      query: ({ orderId, assignedTo }) => ({
        url: `/orders/${orderId}/accept`,
        method: 'PATCH',
        body: { assignedTo },
      }),
      transformResponse: (response: { status: string; data: { order: OrderHome } }) => response.data,
    }),

    respondToOrder: builder.mutation<
      { order: OrderHome },
      { orderId: string; data: RespondToOrderRequest }
    >({
      query: ({ orderId, data }) => ({
        url: `/orders/${orderId}/respond`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: { status: string; data: { order: OrderHome } }) => response.data,
    }),

    completeOrder: builder.mutation<{ order: OrderHome }, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/complete`,
        method: 'PATCH',
      }),
      transformResponse: (response: { status: string; data: { order: OrderHome } }) => response.data,
    }),

    checkRefundEligibility: builder.query<
      { eligible: boolean; reason?: string },
      string
    >({
      query: (orderId) => `/orders/${orderId}/refund-eligibility`,
      transformResponse: (response: { status: string; data: { eligible: boolean; reason?: string } }) => response.data,
    }),

    requestRefund: builder.mutation<
      { order: OrderHome },
      { orderId: string; reason?: string }
    >({
      query: ({ orderId, reason }) => ({
        url: `/orders/${orderId}/request-refund`,
        method: 'POST',
        body: { reason },
      }),
      transformResponse: (response: { status: string; data: { order: OrderHome } }) => response.data,
    }),

    processRefund: builder.mutation<{ order: OrderHome }, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/process-refund`,
        method: 'POST',
      }),
      transformResponse: (response: { status: string; data: { order: OrderHome } }) => response.data,
    }),
  }),
});

export const {
  useGetPackagesQuery,
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useAcceptOrderMutation,
  useRespondToOrderMutation,
  useCompleteOrderMutation,
  useCheckRefundEligibilityQuery,
  useRequestRefundMutation,
  useProcessRefundMutation,
} = orderApiSlice;

