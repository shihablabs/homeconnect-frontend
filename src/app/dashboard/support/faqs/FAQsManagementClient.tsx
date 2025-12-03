'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { HelpCircle, Plus, Edit, Trash2, Search, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { faqApi, type FAQ, type CreateFAQRequest, type FAQCategory } from '@/lib/api/support-api';


export function FAQsManagementClient() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'accordion'>('table');
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: '',
    order: 0,
    isPublished: true,
  });

  const {
    data: faqsData,
    isLoading: loading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['support', 'faqs', categoryFilter],
    queryFn: async () => {
      const response = await faqApi.getFAQs({
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        page: 1,
        limit: 100,
      });
      return response.data;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
    refetchInterval: false, // Disable auto-refetch by default
    retry: (failureCount, error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 429) return false;
      }
      return failureCount < 2;
    },
  });

  const faqs = faqsData || [];

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedFAQ(null);
    setFaqForm({
      question: '',
      answer: '',
      category: '',
      order: 0,
      isPublished: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (faq: FAQ) => {
    setIsEditMode(true);
    setSelectedFAQ(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isPublished: faq.isPublished,
    });
    setIsDialogOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof faqForm) => {
      const payload: CreateFAQRequest = {
        question: data.question,
        answer: data.answer,
        category: data.category as FAQCategory,
        order: data.order,
        isPublished: data.isPublished,
      };
      return await faqApi.createFAQ(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'faqs'] });
      toast.success('FAQ created successfully');
      setIsDialogOpen(false);
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : undefined;
      toast.error(errorMessage || 'Failed to create FAQ');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof faqForm }) => {
      const payload = {
        question: data.question,
        answer: data.answer,
        category: data.category as FAQCategory,
        order: data.order,
        isPublished: data.isPublished,
      };
      return await faqApi.updateFAQ(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'faqs'] });
      toast.success('FAQ updated successfully');
      setIsDialogOpen(false);
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : undefined;
      toast.error(errorMessage || 'Failed to update FAQ');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await faqApi.deleteFAQ(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'faqs'] });
      toast.success('FAQ deleted successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : undefined;
      toast.error(errorMessage || 'Failed to delete FAQ');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question || !faqForm.answer || !faqForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditMode && selectedFAQ) {
      updateMutation.mutate({ id: selectedFAQ.id, data: faqForm });
    } else {
      createMutation.mutate(faqForm);
    }
  };

  const handleDelete = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    deleteMutation.mutate(faqId);
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">FAQs Management</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage frequently asked questions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit FAQ' : 'Create New FAQ'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update FAQ information' : 'Create a new frequently asked question'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  placeholder="Enter the question..."
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  placeholder="Enter the answer..."
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  rows={6}
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={faqForm.category}
                    onValueChange={(value) => setFaqForm({ ...faqForm, category: value })}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={faqForm.order}
                    onChange={(e) =>
                      setFaqForm({ ...faqForm, order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? 'Update' : 'Create'} FAQ
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
          </div>
        </div>

        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All FAQs</CardTitle>
              <CardDescription>
                {filteredFAQs.length} FAQ{filteredFAQs.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                </SelectContent>
              </Select>
              <Select value={viewMode} onValueChange={(v: 'table' | 'accordion') => setViewMode(v)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="accordion">Accordion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading FAQs...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load FAQs</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : filteredFAQs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
              <p className="text-muted-foreground">
                {searchQuery || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first FAQ'}
              </p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFAQs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell className="font-medium">{faq.question}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {faq.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{faq.order}</TableCell>
                      <TableCell>{faq.views}</TableCell>
                      <TableCell>
                        {faq.isPublished ? (
                          <Badge variant="default">Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(faq)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(faq.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">{faq.answer}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {faq.category}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(faq)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(faq.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

