'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { bookingsApi, type Booking } from '@/lib/api/bookings-api';
import { Shield, CheckCircle2, XCircle, Clock, User, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ScreeningResult {
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  score: number;
  status: 'approved' | 'pending' | 'rejected';
  checks: {
    identity: boolean;
    income: boolean;
    references: boolean;
    credit: boolean;
    employment: boolean;
  };
  createdAt: string;
}

export function TenantScreeningClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await bookingsApi.getUserBookings('landlord');
      setBookings(response?.bookings || []);
      // TODO: Fetch screening results from API
      // const screeningData = await screeningApi.getScreeningResults();
      // setScreenings(screeningData);
      setScreenings([]);
    } catch (error: unknown) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to fetch data');
      setBookings([]); // Ensure bookings is always an array
      setScreenings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScreening = async (tenantId: string) => {
    try {
      // TODO: Implement screening API
      toast.info('Screening feature coming soon');
    } catch (error) {
      toast.error('Failed to run screening');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">Loading...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get unique tenants from bookings
  const uniqueTenants = Array.from(
    new Map((bookings || []).map((b) => [b.tenant.id, b.tenant])).values()
  );

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tenant Screening</h1>
        <p className="text-muted-foreground mt-1">
          Screen and verify potential tenants
        </p>
      </div>

      <Tabs defaultValue="tenants" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tenants">
            <User className="mr-2 h-4 w-4" />
            Tenants
          </TabsTrigger>
          <TabsTrigger value="screenings">
            <Shield className="mr-2 h-4 w-4" />
            Screening Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Potential Tenants</CardTitle>
              <CardDescription>
                Run background checks on tenants who have applied for your properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uniqueTenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tenants found</h3>
                  <p className="text-muted-foreground">
                    Tenants who apply for your properties will appear here
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Bookings</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uniqueTenants.map((tenant) => {
                        const tenantBookings = (bookings || []).filter((b) => b.tenant.id === tenant.id);
                        return (
                          <TableRow key={tenant.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">{tenant.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {tenant.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {tenant.email}
                                {tenant.phone && (
                                  <div className="text-muted-foreground">{tenant.phone}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{tenantBookings.length} booking(s)</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRunScreening(tenant.id)}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Run Screening
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screenings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Screening Results</CardTitle>
              <CardDescription>
                View detailed screening reports for tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {screenings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No screening results</h3>
                  <p className="text-muted-foreground">
                    Screening results will appear here after running background checks
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Checks</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {screenings.map((screening) => (
                        <TableRow key={screening.tenantId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{screening.tenant.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {screening.tenant.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-2xl font-bold">{screening.score}%</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {Object.entries(screening.checks).map(([key, value]) => (
                                <Badge
                                  key={key}
                                  variant={value ? 'default' : 'outline'}
                                  className="text-xs"
                                >
                                  {key}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(screening.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View Report
                            </Button>
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
      </Tabs>
      </div>
    </div>
  );
}

