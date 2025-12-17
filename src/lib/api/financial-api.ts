import { api } from './api';

// --- Interfaces & Types ---

export interface MonthlyFinancialData {
  month: string; // Format: "YYYY-MM"
  monthLabel: string; // Format: "January 2024"
  income: number;
  expenses: number;
  netProfit: number;
}

export interface FinancialSummary {
  // Totals
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  netProfitPercentage: number;

  // ROI Calculation (if investment data available)
  roi?: number;

  // Monthly Breakdown
  monthlyBreakdown: MonthlyFinancialData[];

  // Category Breakdowns
  incomeBySource: {
    rent: number;
    securityDeposits: number;
    lateFees: number;
    other: number;
  };
  expensesByCategory: Record<string, number>;

  // Property-wise Breakdown
  propertyBreakdown: Array<{
    propertyId: string;
    propertyTitle: string;
    income: number;
    expenses: number;
    netProfit: number;
  }>;

  // Date Range
  dateRange: {
    startDate: string;
    endDate: string;
  };

  // Additional Metrics
  metrics: {
    averageMonthlyIncome: number;
    averageMonthlyExpenses: number;
    averageMonthlyNetProfit: number;
    expenseToIncomeRatio: number;
    profitMargin: number;
  };
}

export interface FinancialSummaryFilters {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  months?: number;
}

// --- API Implementation ---

export const financialApi = {
  /**
   * Get financial summary (Net Profit/Loss, ROI)
   */
  getFinancialSummary: async (
    filters?: FinancialSummaryFilters
  ): Promise<FinancialSummary> => {
    const response = await api.get('/financial/net-summary', { params: filters });
    return response.data.data;
  },
};

