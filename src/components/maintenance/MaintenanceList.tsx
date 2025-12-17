'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { maintenanceApi, type MaintenanceFilters, type MaintenanceRequest } from '@/lib/api/maintenance-api';
import { vendorsApi, type Vendor } from '@/lib/api/vendors-api';
import { AlertCircle, Building2, Calendar, CheckCircle2, DollarSign, Loader2, Star, Wrench, XCircle, type LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
// Format date helper (using native Date methods)
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

interface MaintenanceListProps {
  userRole?: 'tenant' | 'landlord' | 'admin' | 'support';
}

export function MaintenanceList({ userRole = 'tenant' }: MaintenanceListProps) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MaintenanceFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
  });

  // Vendor assignment state
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await maintenanceApi.getMaintenanceRequests(filters);
      setRequests(response.requests);
      setPagination({
        total: response.total,
        totalPages: response.totalPages,
        page: response.page,
        limit: response.limit,
      });
    } catch (error: unknown) {
      console.error('Failed to fetch maintenance requests:', error);
      toast.error('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: LucideIcon }> = {
      reported: { variant: 'default', icon: AlertCircle },
      in_progress: { variant: 'secondary', icon: Wrench },
      completed: { variant: 'outline', icon: CheckCircle2 },
      cancelled: { variant: 'destructive', icon: XCircle },
    };

    const config = variants[status] || variants.reported;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800 border-red-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300',
    };

    return (
      <Badge variant="outline" className={colors[priority] || colors.medium}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      hvac: 'HVAC',
      appliances: 'Appliances',
      structural: 'Structural',
      pest_control: 'Pest Control',
      cleaning: 'Cleaning',
      other: 'Other',
    };
    return labels[category] || category;
  };

  const fetchVendors = async (category: string) => {
    try {
      setLoadingVendors(true);
      const response = await vendorsApi.getVendors({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceCategory: category as any,
        isVerified: true, // Only show verified vendors
        sortBy: 'rating',
        sortOrder: 'desc',
        limit: 50,
      });
      setVendors(response.vendors);
    } catch (error: unknown) {
      console.error('Failed to fetch vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleOpenDialog = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setSelectedVendorId(request.assignedVendorId || '');
    if (request.category) {
      fetchVendors(request.category);
    }
    setIsDialogOpen(true);
  };

  const handleUpdateMaintenance = async () => {
    if (!selectedRequest) return;

    try {
      setIsUpdating(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        status: selectedRequest.status,
        estimatedCost: selectedRequest.estimatedCost,
      };

      // Include vendor assignment if changed
      if (selectedVendorId !== selectedRequest.assignedVendorId) {
        updateData.assignedVendorId = selectedVendorId || null;
      }

      await maintenanceApi.updateMaintenanceRequest(selectedRequest.id, updateData);
      toast.success('Maintenance request updated successfully');

      // Refresh list
      await fetchRequests();
      setIsDialogOpen(false);
      setSelectedRequest(null);
      setSelectedVendorId('');
    } catch (error: unknown) {
      console.error('Failed to update maintenance request:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to update maintenance request';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setFilters({ ...filters, status: value === 'all' ? undefined : value as any, page: 1 })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setFilters({ ...filters, priority: value === 'all' ? undefined : value as any, page: 1 })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.category || 'all'}
              onValueChange={(value) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setFilters({ ...filters, category: value === 'all' ? undefined : value as any, page: 1 })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="appliances">Appliances</SelectItem>
                <SelectItem value="structural">Structural</SelectItem>
                <SelectItem value="pest_control">Pest Control</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy || 'createdAt'}
              onValueChange={(value) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setFilters({ ...filters, sortBy: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="completionDate">Completion Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">No maintenance requests found</p>
            <p className="text-sm text-muted-foreground">
              {userRole === 'tenant'
                ? 'You have not submitted any maintenance requests yet.'
                : 'No maintenance requests match your filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                    </div>
                    <CardDescription>
                      {request.property.title} • {request.property.address}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{request.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium">{getCategoryLabel(request.category)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reported</p>
                      <p className="font-medium">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                    {request.estimatedCost && (
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Estimated Cost
                        </p>
                        <p className="font-medium">৳{request.estimatedCost.toLocaleString()}</p>
                      </div>
                    )}
                    {request.completionDate && (
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Completed
                        </p>
                        <p className="font-medium">
                          {formatDate(request.completionDate)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Images */}
                  {request.images && request.images.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Images</p>
                      <div className="grid grid-cols-4 gap-2">
                        {request.images.slice(0, 4).map((imageUrl, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden border"
                          >
                            <Image
                              src={imageUrl}
                              alt={`Maintenance image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {request.images.length > 4 && (
                          <div className="relative aspect-square rounded-lg border-2 border-dashed flex items-center justify-center text-sm text-muted-foreground">
                            +{request.images.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vendor Assignment Display */}
                  {(userRole === 'landlord' || userRole === 'admin' || userRole === 'support') && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-2">Assigned Vendor</p>
                          {request.assignedVendor ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {request.assignedVendor.name}
                              </Badge>
                              {request.assignedVendor.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                {request.assignedVendor.rating.toFixed(1)}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No vendor assigned</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(request)}
                        >
                          {request.assignedVendor ? 'Change Vendor' : 'Assign Vendor'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex items-center gap-4 text-sm pt-2 border-t">
                    <div>
                      <p className="text-muted-foreground">Tenant</p>
                      <p className="font-medium">{request.tenant.name}</p>
                    </div>
                    {userRole === 'tenant' && (
                      <div>
                        <p className="text-muted-foreground">Landlord</p>
                        <p className="font-medium">{request.landlord.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} requests
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Vendor Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Maintenance Request</DialogTitle>
            <DialogDescription>
              Update status, estimated cost, or assign a vendor
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Status Update */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selectedRequest.status}
                  onValueChange={(value) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setSelectedRequest({ ...selectedRequest, status: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Estimated Cost */}
              <div className="space-y-2">
                <Label>Estimated Cost (৳)</Label>
                <Input
                  type="number"
                  min="0"
                  value={selectedRequest.estimatedCost || ''}
                  onChange={(e) =>
                    setSelectedRequest({
                      ...selectedRequest,
                      estimatedCost: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Enter estimated cost"
                />
              </div>

              {/* Vendor Assignment */}
              <div className="space-y-2">
                <Label>Assign Vendor</Label>
                {loadingVendors ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading vendors...</span>
                  </div>
                ) : vendors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No verified vendors available for {getCategoryLabel(selectedRequest.category)}
                  </p>
                ) : (
                  <Select
                    value={selectedVendorId}
                    onValueChange={setSelectedVendorId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Unassign)</SelectItem>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{vendor.name}</span>
                              {vendor.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm">{vendor.rating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">
                                ({vendor.completedAssignments}/{vendor.totalAssignments})
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Selected Vendor Details */}
                {selectedVendorId && (
                  <div className="p-3 bg-muted rounded-lg">
                    {(() => {
                      const vendor = vendors.find((v) => v.id === selectedVendorId);
                      return vendor ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{vendor.name}</span>
                            {vendor.isVerified && (
                              <Badge variant="secondary">Verified</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Contact: {vendor.contactPerson}</p>
                            <p>Phone: {vendor.phoneNumber}</p>
                            <p>Email: {vendor.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span>Rating: {vendor.rating.toFixed(1)}/5.0</span>
                              <span className="text-xs">
                                ({vendor.completedAssignments} completed)
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Current Vendor Display */}
                {selectedRequest.assignedVendor && selectedVendorId !== selectedRequest.assignedVendor.id && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Currently Assigned:
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {selectedRequest.assignedVendor.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedRequest(null);
                setSelectedVendorId('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateMaintenance} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

