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
import { BookOpen, Plus, Edit, Trash2, Search, Eye, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { knowledgeBaseApi, type KnowledgeArticle, type CreateKnowledgeArticleRequest, type KnowledgeBaseCategory } from '@/lib/api/support-api';


export function KnowledgeBaseClient() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    isPublished: false,
  });

  const {
    data: articlesData,
    isLoading: loading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['support', 'knowledge-base', categoryFilter],
    queryFn: async () => {
      const response = await knowledgeBaseApi.getKnowledgeBaseArticles({
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

  const articles = articlesData || [];

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedArticle(null);
    setArticleForm({
      title: '',
      content: '',
      category: '',
      tags: '',
      isPublished: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (article: KnowledgeArticle) => {
    setIsEditMode(true);
    setSelectedArticle(article);
    setArticleForm({
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags.join(', '),
      isPublished: article.isPublished,
    });
    setIsDialogOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof articleForm) => {
      const tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [];
      const payload: CreateKnowledgeArticleRequest = {
        title: data.title,
        content: data.content,
        category: data.category as KnowledgeBaseCategory,
        tags,
        isPublished: data.isPublished,
      };
      return await knowledgeBaseApi.createKnowledgeBaseArticle(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'knowledge-base'] });
      toast.success('Article created successfully');
      setIsDialogOpen(false);
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : undefined;
      toast.error(errorMessage || 'Failed to create article');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof articleForm }) => {
      const tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [];
      const payload = {
        title: data.title,
        content: data.content,
        category: data.category as KnowledgeBaseCategory,
        tags,
        isPublished: data.isPublished,
      };
      return await knowledgeBaseApi.updateKnowledgeBaseArticle(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'knowledge-base'] });
      toast.success('Article updated successfully');
      setIsDialogOpen(false);
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : undefined;
      toast.error(errorMessage || 'Failed to update article');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await knowledgeBaseApi.deleteKnowledgeBaseArticle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'knowledge-base'] });
      toast.success('Article deleted successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : undefined;
      toast.error(errorMessage || 'Failed to delete article');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.title || !articleForm.content || !articleForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditMode && selectedArticle) {
      updateMutation.mutate({ id: selectedArticle.id, data: articleForm });
    } else {
      createMutation.mutate(articleForm);
    }
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    deleteMutation.mutate(articleId);
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage knowledge base articles
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
                  Create Article
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? 'Edit Article' : 'Create New Article'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? 'Update knowledge base article'
                  : 'Create a new knowledge base article'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Article title..."
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={articleForm.category}
                  onValueChange={(value) => setArticleForm({ ...articleForm, category: value })}
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
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Article content (supports markdown)..."
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="tag1, tag2, tag3"
                  value={articleForm.tags}
                  onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
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
                  {isEditMode ? 'Update' : 'Create'} Article
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
              <CardTitle>All Articles</CardTitle>
              <CardDescription>
                {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
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
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load articles</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                {searchQuery || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first knowledge base article'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {article.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{article.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{article.views}</TableCell>
                      <TableCell>
                        {article.isPublished ? (
                          <Badge variant="default">Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(article.updatedAt).toLocaleDateString()}
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
                            onClick={() => handleEdit(article)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(article.id)}
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

