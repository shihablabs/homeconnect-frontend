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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Book, Plus, Edit, Trash2, Search, Eye, Download, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { userGuideApi, type UserGuide, type CreateUserGuideRequest, type GuideCategory } from '@/lib/api/support-api';


export function UserGuidesClient() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<UserGuide | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [guideForm, setGuideForm] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    targetAudience: 'all' as 'tenant' | 'landlord' | 'all',
    isPublished: true,
  });

  const {
    data: guidesData,
    isLoading: loading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['support', 'guides', categoryFilter],
    queryFn: async () => {
      const response = await userGuideApi.getUserGuides({
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

  const guides = guidesData || [];

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedGuide(null);
    setGuideForm({
      title: '',
      description: '',
      content: '',
      category: '',
      targetAudience: 'all',
      isPublished: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (guide: UserGuide) => {
    setIsEditMode(true);
    setSelectedGuide(guide);
    setGuideForm({
      title: guide.title,
      description: guide.description || '',
      content: guide.content,
      category: guide.category,
      targetAudience: guide.targetAudience,
      isPublished: guide.isPublished,
    });
    setIsDialogOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof guideForm) => {
      const payload: CreateUserGuideRequest = {
        title: data.title,
        description: data.description,
        content: data.content,
        category: data.category as GuideCategory,
        targetAudience: data.targetAudience,
        isPublished: data.isPublished,
      };
      return await userGuideApi.createUserGuide(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'guides'] });
      toast.success('Guide created successfully');
      setIsDialogOpen(false);
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : undefined;
      toast.error(errorMessage || 'Failed to create guide');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof guideForm }) => {
      const payload = {
        title: data.title,
        description: data.description,
        content: data.content,
        category: data.category as GuideCategory,
        targetAudience: data.targetAudience,
        isPublished: data.isPublished,
      };
      return await userGuideApi.updateUserGuide(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'guides'] });
      toast.success('Guide updated successfully');
      setIsDialogOpen(false);
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : undefined;
      toast.error(errorMessage || 'Failed to update guide');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await userGuideApi.deleteUserGuide(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'guides'] });
      toast.success('Guide deleted successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : undefined;
      toast.error(errorMessage || 'Failed to delete guide');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideForm.title || !guideForm.content || !guideForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditMode && selectedGuide) {
      updateMutation.mutate({ id: selectedGuide.id, data: guideForm });
    } else {
      createMutation.mutate(guideForm);
    }
  };

  const handleDelete = async (guideId: string) => {
    if (!confirm('Are you sure you want to delete this guide?')) return;
    deleteMutation.mutate(guideId);
  };

  const filteredGuides = guides.filter((guide) => {
    const matchesSearch =
      !searchQuery ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guide.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || guide.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Guides</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage user guides and tutorials
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
              Create Guide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Guide' : 'Create New Guide'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update user guide' : 'Create a new user guide or tutorial'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Guide title..."
                  value={guideForm.title}
                  onChange={(e) => setGuideForm({ ...guideForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description..."
                  value={guideForm.description}
                  onChange={(e) => setGuideForm({ ...guideForm, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={guideForm.category}
                    onValueChange={(value) => setGuideForm({ ...guideForm, category: value })}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="getting-started">Getting Started</SelectItem>
                      <SelectItem value="booking">Booking Guide</SelectItem>
                      <SelectItem value="payment">Payment Guide</SelectItem>
                      <SelectItem value="property">Property Management</SelectItem>
                      <SelectItem value="account">Account Settings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select
                    value={guideForm.targetAudience}
                    onValueChange={(value: 'tenant' | 'landlord' | 'all') =>
                      setGuideForm({ ...guideForm, targetAudience: value })
                    }
                  >
                    <SelectTrigger id="targetAudience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="tenant">Tenants</SelectItem>
                      <SelectItem value="landlord">Landlords</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Guide content (supports markdown)..."
                  value={guideForm.content}
                  onChange={(e) => setGuideForm({ ...guideForm, content: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                  required
                />
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
                  {isEditMode ? 'Update' : 'Create'} Guide
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
              <CardTitle>All Guides</CardTitle>
              <CardDescription>
                {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search guides..."
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
                  <SelectItem value="getting-started">Getting Started</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading guides...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load guides</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : filteredGuides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Book className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No guides found</h3>
              <p className="text-muted-foreground">
                {searchQuery || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first user guide'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuides.map((guide) => (
                    <TableRow key={guide.id}>
                      <TableCell className="font-medium">{guide.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {guide.category.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {guide.targetAudience}
                        </Badge>
                      </TableCell>
                      <TableCell>{guide.views}</TableCell>
                      <TableCell>
                        {guide.isPublished ? (
                          <Badge variant="default">Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(guide.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(guide)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(guide.id)}
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
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

