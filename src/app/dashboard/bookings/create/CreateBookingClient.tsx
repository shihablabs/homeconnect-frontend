'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { bookingsApi } from '@/lib/api/bookings-api';
import { propertiesApi, type PropertyResponse } from '@/lib/api/properties-api';
import { ArrowLeft, Calendar, Home, Search } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

export function CreateBookingClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: '',
    checkIn: '',
    checkOut: '',
    specialRequests: '',
  });

  const searchProperties = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const response = await propertiesApi.getProperties({
        search: searchQuery,
        limit: 10,
      });
      setProperties(response.properties);
    } catch (error: any) {
      toast.error('Failed to search properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProperty = (property: PropertyResponse) => {
    setSelectedProperty(property);
    setFormData({ ...formData, propertyId: property.id });
    setProperties([]);
    setSearchQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.checkIn || !formData.checkOut) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    try {
      setCreating(true);
      const booking = await bookingsApi.createBooking({
        propertyId: formData.propertyId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        specialRequests: formData.specialRequests || undefined,
      });
      toast.success('Booking created successfully!');
      router.push(`/dashboard/bookings/${booking.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create booking');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/bookings">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Booking</h1>
          <p className="text-muted-foreground mt-1">
            Book a property for your stay
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Property Search */}
          <Card>
            <CardHeader>
              <CardTitle>Select Property</CardTitle>
              <CardDescription>Search and select a property to book</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties by name, city, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchProperties())}
                  className="pl-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={searchProperties}
                  disabled={loading}
                  className="mt-2"
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {properties.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      onClick={() => handleSelectProperty(property)}
                      className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {property.images && property.images.length > 0 ? (
                          <Image
                            src={property.images[0]}
                            alt={property.title}
                            width={64}
                            height={64}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                            <Home className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{property.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {property.address}, {property.city}
                          </div>
                          <div className="text-sm font-medium text-primary">
                            ৳{property.listingType === 'rent' ? property.rentPrice?.toLocaleString() : property.salePrice?.toLocaleString()}
                            {property.listingType === 'rent' && '/mo'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedProperty && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {selectedProperty.images && selectedProperty.images.length > 0 ? (
                      <Image
                        src={selectedProperty.images[0]}
                        alt={selectedProperty.title}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-md bg-background flex items-center justify-center">
                        <Home className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{selectedProperty.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedProperty.address}, {selectedProperty.city}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProperty(null);
                        setFormData({ ...formData, propertyId: '' });
                      }}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Dates</CardTitle>
              <CardDescription>Select your check-in and check-out dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check-in Date *</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check-out Date *</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Special Requests (Optional)</CardTitle>
              <CardDescription>Any special requirements or requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Need parking space, pet-friendly accommodation, etc."
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProperty && (
                <>
                  <div>
                    <Label className="text-muted-foreground">Property</Label>
                    <p className="font-medium">{selectedProperty.title}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <p className="text-sm">{selectedProperty.city}</p>
                  </div>
                  {formData.checkIn && formData.checkOut && (
                    <div>
                      <Label className="text-muted-foreground">Duration</Label>
                      <p className="text-sm">
                        {Math.ceil(
                          (new Date(formData.checkOut).getTime() -
                            new Date(formData.checkIn).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full"
            disabled={!formData.propertyId || !formData.checkIn || !formData.checkOut || creating}
          >
            {creating ? 'Creating...' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </div>
  );
}

