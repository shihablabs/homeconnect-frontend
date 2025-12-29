import { api } from './api';



export interface MonthlyFinancialData {
  month: string; 
  monthLabel: string; 
  income: number;
  expenses: number;
  netProfit: number;
}

export interface FinancialSummary {
  
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  netProfitPercentage: number;

  
  roi?: number;

  
  monthlyBreakdown: MonthlyFinancialData[];

  
  incomeBySource: {
    rent: number;
    securityDeposits: number;
    lateFees: number;
    other: number;
  };
  expensesByCategory: Record<string, number>;

  
  propertyBreakdown: Array<{
    propertyId: string;
    propertyTitle: string;
    income: number;
    expenses: number;
    netProfit: number;
  }>;

  
  dateRange: {
    startDate: string;
    endDate: string;
  };

  
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



export const financialApi = {
  
  getFinancialSummary: async (
    filters?: FinancialSummaryFilters
  ): Promise<FinancialSummary> => {
    const response = await api.get('/financial/net-summary', { params: filters });
    return response.data.data;
  },
};

