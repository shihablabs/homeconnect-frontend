'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { bookingsApi, type Booking } from '@/lib/api/bookings-api';
import { Users, Search, Mail, Phone, Home, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

export function TenantsManagementClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await bookingsApi.getUserBookings('landlord');
      const bookingsData = response?.bookings || [];
      // Get unique tenants from bookings
      const tenantMap = new Map();
      bookingsData.forEach((booking) => {
        if (!tenantMap.has(booking.tenant.id)) {
          tenantMap.set(booking.tenant.id, {
            ...booking.tenant,
            bookings: [],
            properties: new Set(),
          });
        }
        const tenant = tenantMap.get(booking.tenant.id);
        tenant.bookings.push(booking);
        tenant.properties.add(booking.property.id);
      });
      setBookings(bookingsData);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to fetch tenants');
      setBookings([]); // Ensure bookings is always an array
    } finally {
      setLoading(false);
    }
  };

  // Get unique tenants
  const getUniqueTenants = () => {
    const tenantMap = new Map();
    (bookings || []).forEach((booking) => {
      if (!tenantMap.has(booking.tenant.id)) {
        tenantMap.set(booking.tenant.id, {
          tenant: booking.tenant,
          bookings: [],
          properties: [],
        });
      }
      const entry = tenantMap.get(booking.tenant.id);
      entry.bookings.push(booking);
      if (!entry.properties.find((p: { id: string }) => p.id === booking.property.id)) {
        entry.properties.push(booking.property);
      }
    });
    return Array.from(tenantMap.values());
  };

  const filteredTenants = getUniqueTenants().filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.tenant.name.toLowerCase().includes(query) ||
      entry.tenant.email.toLowerCase().includes(query) ||
      entry.tenant.phone?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">Loading tenants...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Tenants</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your tenants
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Tenants</CardTitle>
              <CardDescription>
                {filteredTenants.length} tenant{filteredTenants.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tenants found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'You don\'t have any tenants yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Active Bookings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((entry) => (
                    <TableRow key={entry.tenant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{entry.tenant.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.tenant.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {entry.tenant.email}
                          </div>
                          {entry.tenant.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {entry.tenant.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {entry.properties.slice(0, 2).map((property: { id: string; title: string; address: string; city: string; images: string[] }) => (
                            <div key={property.id} className="flex items-center gap-2 text-sm">
                              <Home className="h-3 w-3 text-muted-foreground" />
                              <Link
                                href={`/properties/${property.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {property.title}
                              </Link>
                            </div>
                          ))}
                          {entry.properties.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{entry.properties.length - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {entry.bookings.filter((b: Booking) => b.status === 'confirmed').length}{' '}
                          active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/bookings?tenant=${entry.tenant.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
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

