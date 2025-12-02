'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { dashboardApi, type IMaintenanceRequestResponse } from '@/lib/api/dashboard';
import { useAuthState } from '@/hooks/useAuthState';
import { Wrench, Plus, Eye, CheckCircle2, Clock, AlertCircle, XCircle, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export function MaintenanceDashboardClient() {
  const { user } = useAuthState();
  const [requests, setRequests] = useState<IMaintenanceRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<IMaintenanceRequestResponse | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    property: '',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter, priorityFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;

      const response = await dashboardApi.getMaintenanceRequests(params);
      setRequests(response?.requests || []);
      setTotalPages(response?.totalPages || 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch maintenance requests');
      setRequests([]); // Ensure requests is always an array
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.property || !createForm.title || !createForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      await dashboardApi.createMaintenanceRequest({
        property: createForm.property,
        title: createForm.title,
        description: createForm.description,
        priority: createForm.priority,
      });
      toast.success('Maintenance request created successfully');
      setIsCreateDialogOpen(false);
      setCreateForm({ property: '', title: '', description: '', priority: 'medium' });
      fetchRequests();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create maintenance request');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: string) => {
    try {
      setUpdating(true);
      await dashboardApi.updateMaintenanceRequest(requestId, { status });
      toast.success('Maintenance request updated successfully');
      fetchRequests();
      if (selectedRequest?.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update maintenance request');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="default" className="gap-1 bg-blue-500">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const canCreate = user?.role === 'tenant';
  const canUpdate = user?.role === 'landlord' || user?.role === 'admin';

  if (loading && (!requests || requests.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Requests</h1>
            <p className="text-muted-foreground mt-1">
              {canCreate ? 'Submit and track maintenance requests' : 'Manage maintenance requests'}
            </p>
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center text-muted-foreground">Loading maintenance requests...</div>
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
          <h1 className="text-3xl font-bold">Maintenance Requests</h1>
          <p className="text-muted-foreground mt-1">
            {canCreate ? 'Submit and track maintenance requests' : 'Manage maintenance requests'}
          </p>
        </div>
        {canCreate && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Maintenance Request</DialogTitle>
                <DialogDescription>
                  Submit a new maintenance request for your property
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="property">Property *</Label>
                  <Input
                    id="property"
                    placeholder="Enter property ID"
                    value={createForm.property}
                    onChange={(e) => setCreateForm({ ...createForm, property: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., HVAC making loud noise"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={createForm.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') =>
                      setCreateForm({ ...createForm, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Request'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${(requests || []).length} request${(requests || []).length !== 1 ? 's' : ''} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading maintenance requests...</p>
            </div>
          ) : (!requests || requests.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No maintenance requests</h3>
              <p className="text-muted-foreground">
                {canCreate
                  ? 'Create your first maintenance request'
                  : 'No requests match your filters'}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(requests || []).map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {request.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.property?.title || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">
                              {request.property?.address || ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{request.tenant?.name || 'N/A'}</div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {new Date(request.reportedAt || request.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            {canUpdate && request.status === 'pending' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleUpdateStatus(request.id, 'in_progress')}
                                disabled={updating}
                              >
                                Start
                              </Button>
                            )}
                            {canUpdate && request.status === 'in_progress' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleUpdateStatus(request.id, 'completed')}
                                disabled={updating}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Maintenance Request Details</DialogTitle>
            <DialogDescription>View and manage maintenance request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Title</Label>
                  <p className="font-medium">{selectedRequest.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <div>{getPriorityBadge(selectedRequest.priority)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reported At</Label>
                  <p className="text-sm">
                    {new Date(selectedRequest.reportedAt || selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{selectedRequest.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Property</Label>
                <p className="font-medium">{selectedRequest.property?.title || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{selectedRequest.property?.address || ''}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Tenant</Label>
                <p className="font-medium">{selectedRequest.tenant?.name || 'N/A'}</p>
              </div>
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Images</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedRequest.images.map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        alt={`Maintenance image ${idx + 1}`}
                        width={200}
                        height={200}
                        className="rounded-md object-cover h-32 w-full"
                      />
                    ))}
                  </div>
                </div>
              )}
              {selectedRequest.completedAt && (
                <div>
                  <Label className="text-muted-foreground">Completed At</Label>
                  <p className="text-sm">
                    {new Date(selectedRequest.completedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {canUpdate && selectedRequest && selectedRequest.status === 'pending' && (
              <Button
                onClick={() => {
                  handleUpdateStatus(selectedRequest.id, 'in_progress');
                  setIsDetailsDialogOpen(false);
                }}
                disabled={updating}
              >
                Start Work
              </Button>
            )}
            {canUpdate && selectedRequest && selectedRequest.status === 'in_progress' && (
              <Button
                onClick={() => {
                  handleUpdateStatus(selectedRequest.id, 'completed');
                  setIsDetailsDialogOpen(false);
                }}
                disabled={updating}
              >
                Mark as Completed
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

