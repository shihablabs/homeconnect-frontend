'use client';

import { FinancialChart } from '@/components/dashboard/FinancialChart';
import { NetProfitChart } from '@/components/dashboard/NetProfitChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { financialApi, type FinancialSummary } from '@/lib/api/financial-api';
import { paymentsApi, type LandlordEarnings } from '@/lib/api/payments-api';
import { BarChart3, Calendar, DollarSign, Download, FileText, Loader2, Percent, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ReportData {
  period: string;
  income: number;
  expenses: number;
  netProfit: number;
  bookings: number;
  occupancyRate: number;
}

export function FinancialReportsClient() {
  const [earnings, setEarnings] = useState<LandlordEarnings | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [months, setMonths] = useState(12);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        
        const earningsData = await paymentsApi.getLandlordEarnings();
        setEarnings(earningsData || {
          totalEarnings: 0,
          totalPaid: 0,
          pendingPayments: 0,
          breakdown: {
            rent: 0,
            securityDeposit: 0,
            other: 0,
          },
        });

        
        const summary = await financialApi.getFinancialSummary({ months });
        setFinancialSummary(summary);

        
        
        
        setReports([]);
      } catch (error: unknown) {
        console.error('Failed to fetch reports:', error);
        toast.error('Failed to fetch reports');
        setEarnings({
          totalEarnings: 0,
          totalPaid: 0,
          pendingPayments: 0,
          breakdown: {
            rent: 0,
            securityDeposit: 0,
            other: 0,
          },
        });
        setFinancialSummary(null);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, months]);

  const handleGenerateReport = async () => {
    try {
      
      toast.info('Report generation feature coming soon');
    } catch {
      toast.error('Failed to generate report');
    }
  };

  const handleExportReport = async (format: 'pdf' | 'excel') => {
    try {
      
      toast.info(`${format.toUpperCase()} export feature coming soon`);
    } catch {
      toast.error(`Failed to export ${format}`);
    }
  };

  if (loading && !earnings) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <p className="text-muted-foreground mt-1">
              Analyze your property financial performance
            </p>
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center text-muted-foreground">Loading financial reports...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <p className="text-muted-foreground mt-1">
              Analyze your property financial performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExportReport('pdf')}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('excel')}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : financialSummary ? (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ৳{financialSummary.totalIncome.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last {months} months
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ৳{financialSummary.totalExpenses.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last {months} months
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <DollarSign className={`h-4 w-4 ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ৳{financialSummary.netProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {financialSummary.netProfitPercentage >= 0 ? '+' : ''}{financialSummary.netProfitPercentage.toFixed(1)}% margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                <Percent className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${financialSummary.metrics.profitMargin >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {financialSummary.metrics.profitMargin.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Expense ratio: {(financialSummary.metrics.expenseToIncomeRatio * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>
        ) : earnings ? (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ৳{(earnings?.totalEarnings ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ৳{(earnings?.totalPaid ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Received</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ৳{(earnings?.pendingPayments ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rent Income</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ৳{(earnings?.breakdown?.rent ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Rent payments</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No financial data</h3>
            <p className="text-muted-foreground">Financial data will appear here</p>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Report</TabsTrigger>
              <TabsTrigger value="custom">Custom Report</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Select value={months.toString()} onValueChange={(value) => setMonths(parseInt(value))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                  <SelectItem value="24">24 Months</SelectItem>
                </SelectContent>
              </Select>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {}
            <FinancialChart />

            {}
            {financialSummary && financialSummary.monthlyBreakdown.length > 0 && (
              <NetProfitChart data={financialSummary.monthlyBreakdown} />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>
                  Summary of your financial performance for the last {months} months
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading financial overview...</p>
                  </div>
                ) : financialSummary ? (
                  <div className="space-y-6">
                    {}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Average Monthly Income</div>
                        <div className="text-2xl font-bold text-green-600">
                          ৳{financialSummary.metrics.averageMonthlyIncome.toLocaleString()}
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Average Monthly Expenses</div>
                        <div className="text-2xl font-bold text-red-600">
                          ৳{financialSummary.metrics.averageMonthlyExpenses.toLocaleString()}
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Average Monthly Net Profit</div>
                        <div className={`text-2xl font-bold ${financialSummary.metrics.averageMonthlyNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ৳{financialSummary.metrics.averageMonthlyNetProfit.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="border rounded-lg p-4">
                      <div className="text-sm font-medium text-muted-foreground mb-3">Income by Source</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Rent</span>
                          <span className="font-medium">৳{financialSummary.incomeBySource.rent.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Security Deposits</span>
                          <span className="font-medium">
                            ৳{financialSummary.incomeBySource.securityDeposits.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Late Fees</span>
                          <span className="font-medium">৳{financialSummary.incomeBySource.lateFees.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Other</span>
                          <span className="font-medium">৳{financialSummary.incomeBySource.other.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {}
                    {Object.keys(financialSummary.expensesByCategory).length > 0 && (
                      <div className="border rounded-lg p-4">
                        <div className="text-sm font-medium text-muted-foreground mb-3">Expenses by Category</div>
                        <div className="space-y-2">
                          {Object.entries(financialSummary.expensesByCategory)
                            .filter(([, amount]) => amount > 0)
                            .sort(([, a], [, b]) => b - a)
                            .map(([category, amount]) => (
                              <div key={category} className="flex items-center justify-between">
                                <span className="capitalize">{category.replace('_', ' ')}</span>
                                <span className="font-medium">৳{amount.toLocaleString()}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : earnings ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Total Income</div>
                        <div className="text-2xl font-bold text-green-600">
                          ৳{(earnings?.totalEarnings ?? 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Pending Payments</div>
                        <div className="text-2xl font-bold">
                          ৳{(earnings?.pendingPayments ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-2">Income Breakdown</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Rent</span>
                          <span className="font-medium">৳{(earnings?.breakdown?.rent ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Security Deposit</span>
                          <span className="font-medium">
                            ৳{(earnings?.breakdown?.securityDeposit ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Other</span>
                          <span className="font-medium">৳{(earnings?.breakdown?.other ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No financial data</h3>
                    <p className="text-muted-foreground">Financial data will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Financial Report</CardTitle>
                <CardDescription>
                  Comprehensive breakdown of income and expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No detailed reports available</h3>
                    <p className="text-muted-foreground">
                      Detailed reports will be generated based on your transactions
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">{report.period}</h4>
                          <Badge variant="outline">{report.bookings} bookings</Badge>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Income</div>
                            <div className="text-xl font-bold text-green-600">
                              ৳{report.income.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Expenses</div>
                            <div className="text-xl font-bold text-red-600">
                              ৳{report.expenses.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Net Profit</div>
                            <div className="text-xl font-bold">
                              ৳{report.netProfit.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Custom Report</CardTitle>
                <CardDescription>
                  Create a custom financial report for a specific date range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleGenerateReport} className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

