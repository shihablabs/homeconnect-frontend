'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Plus, TrendingDown, Calendar, FileText, Home } from 'lucide-react';
import { toast } from 'sonner';

interface Expense {
  id: string;
  propertyId?: string;
  propertyName?: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  receipt?: string;
  createdAt: string;
}

export function ExpensesClient() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    propertyId: '',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    receipt: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      // TODO: Implement expenses API
      // const response = await expensesApi.getExpenses();
      // setExpenses(response.expenses);
      setExpenses([]);
    } catch (error: unknown) {
      console.error('Failed to fetch expenses:', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.category || !expenseForm.description || !expenseForm.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // TODO: Implement expense creation API
      // await expensesApi.createExpense(expenseForm);
      toast.success('Expense added successfully');
      setIsDialogOpen(false);
      setExpenseForm({
        propertyId: '',
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        receipt: '',
      });
      fetchExpenses();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to add expense');
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyExpenses = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage property-related expenses
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Record a new expense for your property
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={expenseForm.category}
                  onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="repairs">Repairs</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="taxes">Taxes</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the expense..."
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, description: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (৳) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt URL (Optional)</Label>
                <Input
                  id="receipt"
                  type="url"
                  placeholder="https://..."
                  value={expenseForm.receipt}
                  onChange={(e) => setExpenseForm({ ...expenseForm, receipt: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Expense</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{monthlyExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">Expense records</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No expenses recorded</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your property expenses
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Expense
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        {expense.propertyName || (
                          <span className="text-muted-foreground">General</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ৳{expense.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

