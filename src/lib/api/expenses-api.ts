import { api } from './api';
import { uploadApi } from './upload-api';

// --- Interfaces & Types ---

export type ExpenseCategory =
  | 'tax'
  | 'utility'
  | 'maintenance'
  | 'renovation'
  | 'marketing'
  | 'insurance'
  | 'legal'
  | 'management'
  | 'other';

export interface Expense {
  id: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    address: string;
  };
  landlordId: string;
  landlord: {
    id: string;
    name: string;
    email: string;
  };
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  dateIncurred: string;
  attachmentURL?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  propertyId: string;
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  category: ExpenseCategory;
  dateIncurred: string;
  attachmentURL?: string;
  isRecurring?: boolean;
}

export interface UpdateExpenseData {
  title?: string;
  description?: string;
  amount?: number;
  currency?: string;
  category?: ExpenseCategory;
  dateIncurred?: string;
  attachmentURL?: string;
  isRecurring?: boolean;
}

export interface ExpenseFilters {
  propertyId?: string;
  landlordId?: string;
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'dateIncurred' | 'amount' | 'createdAt' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalByCategory: Record<ExpenseCategory, number>;
  totalByProperty: Array<{
    propertyId: string;
    propertyTitle: string;
    total: number;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    monthLabel: string;
    total: number;
  }>;
  recurringExpenses: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

// --- API Implementation ---

export const expensesApi = {
  /**
   * Upload attachment for expense (receipt/invoice)
   */
  uploadAttachment: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('images', file);

    const response = await uploadApi.post('/upload/images', formData, {
      params: { folder: 'expenses' },
    });

    return response.data.data[0]?.url;
  },

  /**
   * Create a new expense
   */
  createExpense: async (data: CreateExpenseData): Promise<Expense> => {
    const response = await api.post('/expenses', data);
    return response.data.data;
  },

  /**
   * Get expenses with filters
   */
  getExpenses: async (filters?: ExpenseFilters): Promise<ExpenseListResponse> => {
    const response = await api.get('/expenses', { params: filters });
    return {
      expenses: response.data.data,
      total: response.data.pagination?.total || 0,
      totalPages: response.data.pagination?.totalPages || 0,
      page: response.data.pagination?.page || 1,
      limit: response.data.pagination?.limit || 10,
    };
  },

  /**
   * Get a single expense by ID
   */
  getExpense: async (id: string): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data.data;
  },

  /**
   * Update expense
   */
  updateExpense: async (
    id: string,
    data: UpdateExpenseData
  ): Promise<Expense> => {
    const response = await api.patch(`/expenses/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete expense (soft delete)
   */
  deleteExpense: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  /**
   * Get expense summary/aggregation
   */
  getExpenseSummary: async (
    filters?: {
      propertyId?: string;
      landlordId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ExpenseSummary> => {
    const response = await api.get('/expenses/summary', { params: filters });
    return response.data.data;
  },
};

