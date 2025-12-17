'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { expensesApi, type Expense } from '@/lib/api/expenses-api';
import { propertiesApi, type PropertyResponse } from '@/lib/api/properties-api';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Form Schema
const expenseFormSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  amount: z
    .number()
    .positive('Amount must be positive')
    .min(0.01, 'Amount must be at least 0.01'),
  currency: z.enum(['BDT', 'USD', 'EUR', 'GBP']).default('BDT'),
  category: z.enum([
    'tax',
    'utility',
    'maintenance',
    'renovation',
    'marketing',
    'insurance',
    'legal',
    'management',
    'other',
  ]),
  dateIncurred: z.string().min(1, 'Date incurred is required'),
  attachmentURL: z.string().url('Invalid URL').optional().or(z.literal('')),
  isRecurring: z.boolean().default(false),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  expense?: Expense;
  propertyId?: string;
  onSuccess?: () => void;
}

export function ExpenseForm({
  expense,
  propertyId,
  onSuccess,
}: ExpenseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const isEditMode = !!expense;

  const form = useForm<ExpenseFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(expenseFormSchema) as any,
    defaultValues: {
      propertyId: expense?.propertyId || propertyId || '',
      title: expense?.title || '',
      description: expense?.description || '',
      amount: expense?.amount || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currency: (expense?.currency as any) || 'BDT',
      category: expense?.category || 'other',
      dateIncurred: expense?.dateIncurred
        ? new Date(expense.dateIncurred).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      attachmentURL: expense?.attachmentURL || '',
      isRecurring: expense?.isRecurring || false,
    },
  });

  // Load user's properties for selection
  useEffect(() => {
    if (!propertyId && !expense) {
      loadProperties();
    }
  }, [propertyId, expense]);

  const loadProperties = async () => {
    try {
      setLoadingProperties(true);
      const response = await propertiesApi.getProperties({
        limit: 100,
      });
      setProperties(response.properties);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const url = await expensesApi.uploadAttachment(file);
      form.setValue('attachmentURL', url);
      toast.success('Receipt/invoice uploaded successfully');
    } catch (error: unknown) {
      console.error('File upload error:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).response?.data?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      setIsSubmitting(true);

      const expenseData = {
        ...data,
        dateIncurred: new Date(data.dateIncurred).toISOString(),
        attachmentURL: data.attachmentURL || undefined,
      };

      if (isEditMode && expense) {
        await expensesApi.updateExpense(expense.id, expenseData);
        toast.success('Expense updated successfully!');
      } else {
        await expensesApi.createExpense(expenseData);
        toast.success('Expense created successfully!');
      }

      form.reset();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/expenses');
      }
    } catch (error: unknown) {
      console.error('Error saving expense:', error);
      toast.error(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.data?.message ||
        `Failed to ${isEditMode ? 'update' : 'create'} expense. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Property Selection */}
        {!propertyId && !expense && (
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loadingProperties}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title} - {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the property this expense is related to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Title and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Property Tax Payment"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A brief description of the expense
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tax">Tax</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="renovation">Renovation</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Amount, Currency, and Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BDT">BDT (৳)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateIncurred"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Incurred *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add detailed notes about this expense..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Additional details about the expense (max 1000 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Recurring Expense */}
        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Recurring Expense</FormLabel>
                <FormDescription>
                  Mark this expense as recurring (e.g., monthly utilities, annual taxes)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Attachment Upload */}
        <div className="space-y-2">
          <FormLabel>Receipt/Invoice (Optional)</FormLabel>
          <FormDescription>
            Upload a receipt or invoice document for this expense
          </FormDescription>

          {form.watch('attachmentURL') ? (
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Document uploaded
                    </p>
                    <a
                      href={form.watch('attachmentURL')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View document
                    </a>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => form.setValue('attachmentURL', '')}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Click to upload receipt/invoice
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, DOC, or Image files
                </p>
              </div>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                disabled={isUploading}
              />
            </label>
          )}

          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading document...
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
            }}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {isEditMode ? 'Update Expense' : 'Create Expense'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

