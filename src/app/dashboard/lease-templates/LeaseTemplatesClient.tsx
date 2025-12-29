'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, Edit, FileText, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface LeaseTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export function LeaseTemplatesClient() {
  const [templates, setTemplates] = useState<LeaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LeaseTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    content: '',
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      
      

      
      setTemplates([
        {
          id: '1',
          name: 'Standard Lease Agreement',
          description: 'Standard residential lease agreement template',
          content: 'Standard lease agreement content...',
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } catch (error: unknown) {
      console.error('Failed to fetch templates:', error);
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedTemplate(null);
    setTemplateForm({
      name: '',
      description: '',
      content: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (template: LeaseTemplate) => {
    setIsEditMode(true);
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description,
      content: template.content,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name || !templateForm.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (isEditMode && selectedTemplate) {
        
        
        toast.success('Template updated successfully');
      } else {
        
        
        toast.success('Template created successfully');
      }
      setIsDialogOpen(false);
      fetchTemplates();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to save template');
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm(`Are you sure you want to delete template ${templateId}?`)) return;

    try {
      
      
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error: unknown) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  
  const handleDownload = async (template: LeaseTemplate) => {
    try {
      
      toast.info('Template download feature coming soon');
    } catch {
      toast.error('Failed to download template');
    }
  };

  const handleCopy = (template: LeaseTemplate) => {
    navigator.clipboard.writeText(template.content);
    toast.success('Template content copied to clipboard');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">Loading templates...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lease Templates</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage lease agreement templates
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? 'Update your lease agreement template'
                  : 'Create a new lease agreement template'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Standard Residential Lease"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this template..."
                  value={templateForm.description}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Template Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Enter the lease agreement template content..."
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use placeholders like {'{tenantName}'}, {'{propertyAddress}'}, {'{rentAmount}'} etc.
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">{isEditMode ? 'Update' : 'Create'} Template</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Templates</CardTitle>
          <CardDescription>
            {templates.length} template{templates.length !== 1 ? 's' : ''} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first lease agreement template
              </p>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="font-medium">{template.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {template.description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {template.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(template)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(template)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          {!template.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(template.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          )}
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
  );
}

