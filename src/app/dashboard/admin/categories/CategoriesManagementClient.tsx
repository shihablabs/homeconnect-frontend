'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tag, Plus, Edit, Trash2, Building, Home, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { propertiesApi } from '@/lib/api/properties-api';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  propertyCount?: number;
  createdAt: string;
}

export function CategoriesManagementClient() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    categoryId?: string;
    categoryName?: string;
  }>({ open: false });

  const {
    data: filtersData,
    isLoading: loading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'categories', 'filters'],
    queryFn: async () => {
      const response = await propertiesApi.getAvailableFilters();
      return response;
    },
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: unknown) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 429) return false;
      }
      return failureCount < 2;
    },
  });

  // Transform propertyTypes array to Category format
  const propertyTypes: Category[] = (filtersData?.propertyTypes || []).map((type, index) => ({
    id: `type-${index}`,
    name: type,
    slug: type.toLowerCase().replace(/\s+/g, '-'),
    propertyCount: undefined, // Backend doesn't provide count
    createdAt: new Date().toISOString(),
  }));

  const amenities = filtersData?.amenities || [];

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedCategory(null);
    setCategoryForm({ name: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setIsEditMode(true);
    setSelectedCategory(category);
    setCategoryForm({ name: category.name, description: category.description || '' });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (isEditMode && selectedCategory) {
        // TODO: Implement category update API
        toast.info('Category update feature coming soon');
      } else {
        // TODO: Implement category creation API
        toast.info('Category creation feature coming soon');
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error: unknown) {
      console.error('Failed to save category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleDeleteClick = (categoryId: string, categoryName: string) => {
    setDeleteConfirm({
      open: true,
      categoryId,
      categoryName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.categoryId) return;

    try {
      // TODO: Implement category deletion API
      toast.info('Category deletion feature coming soon');
      refetch();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (loading && !filtersData) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
      : undefined;
    
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Building className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load categories</h3>
          <p className="text-muted-foreground text-center mb-4">
            {errorMessage || 'An error occurred while fetching categories'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories & Types</h1>
          <p className="text-muted-foreground mt-1">
            Manage property types and amenities
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="types" className="space-y-6">
        <TabsList>
          <TabsTrigger value="types">
            <Building className="mr-2 h-4 w-4" />
            Property Types
          </TabsTrigger>
          <TabsTrigger value="amenities">
            <Tag className="mr-2 h-4 w-4" />
            Amenities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Property Types</CardTitle>
                  <CardDescription>
                    {propertyTypes.length} type{propertyTypes.length !== 1 ? 's' : ''} defined
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {isEditMode ? 'Edit Property Type' : 'Add Property Type'}
                      </DialogTitle>
                      <DialogDescription>
                        {isEditMode
                          ? 'Update property type information'
                          : 'Create a new property type'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Type Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Villa, Townhouse"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          placeholder="Brief description..."
                          value={categoryForm.description}
                          onChange={(e) =>
                            setCategoryForm({ ...categoryForm, description: e.target.value })
                          }
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
                        <Button type="submit">{isEditMode ? 'Update' : 'Create'}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {propertyTypes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No property types</h3>
                  <p className="text-muted-foreground">Create property types for categorization</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Properties</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {propertyTypes.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell className="font-medium">{type.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{type.slug}</Badge>
                          </TableCell>
                          <TableCell>
                            {type.propertyCount || 0} properties
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(type)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(type.id, type.name)}
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
        </TabsContent>

        <TabsContent value="amenities" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Amenities</CardTitle>
                  <CardDescription>
                    {amenities.length} amenit{amenities.length !== 1 ? 'ies' : 'y'} defined
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Amenity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-sm py-2 px-4">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Delete Category"
        description={
          deleteConfirm.categoryName
            ? `Are you sure you want to delete "${deleteConfirm.categoryName}"? This action cannot be undone.`
            : 'Are you sure you want to delete this category? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

