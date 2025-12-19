'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { bookingsApi } from '@/lib/api/bookings-api';
import { paymentMethodsApi, type PaymentMethod } from '@/lib/api/payment-methods-api';
import { propertiesApi } from '@/lib/api/properties-api';
import { subscriptionsApi } from '@/lib/api/subscriptions-api';
import type { PropertyResponse } from '@/types/property.types';
import { ArrowLeft, CreditCard, Home, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
    leaseDurationInMonths: '12',
  });
  const [setupRecurringPayment, setSetupRecurringPayment] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoadingPaymentMethods(true);
        const methods = await paymentMethodsApi.getLivePaymentMethods();
        setPaymentMethods(methods);
        // Auto-select first payment method if available
        if (methods.length > 0 && !selectedPaymentMethodId) {
          setSelectedPaymentMethodId(methods[0].id);
        }
      } catch (error: unknown) {
        console.error('Failed to fetch payment methods:', error);
        toast.error('Failed to load payment methods');
      } finally {
        setLoadingPaymentMethods(false);
      }
    };

    // Fetch live payment methods on component mount
    fetchPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchProperties = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const response = await propertiesApi.getProperties({
        search: searchQuery,
        limit: 10,
      });
      setProperties(response.properties);
    } catch (error: unknown) {
      console.error('Failed to search properties:', error);
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

    const leaseDuration = parseInt(formData.leaseDurationInMonths);
    if (!leaseDuration || leaseDuration < 1 || leaseDuration > 120) {
      toast.error('Lease duration must be between 1 and 120 months');
      return;
    }

    try {
      setCreating(true);
      const booking = await bookingsApi.createBooking({
        propertyId: formData.propertyId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        specialRequests: formData.specialRequests || undefined,
        leaseDurationInMonths: leaseDuration,
        setupRecurringPayment: setupRecurringPayment,
      });
      toast.success('Booking created successfully!');

      // If setupRecurringPayment is checked, create subscription after booking is created
      // Note: Subscription can only be created for confirmed bookings
      if (setupRecurringPayment) {
        if (booking.status === 'confirmed') {
          // Booking is already confirmed, create subscription immediately
          try {
            await subscriptionsApi.createSubscription({ bookingId: booking.id });
            toast.success('Recurring payment subscription created successfully!');
          } catch (subscriptionError: unknown) {
            console.error('Failed to create subscription:', subscriptionError);
            const errorMessage = subscriptionError && typeof subscriptionError === 'object' && 'response' in subscriptionError
              ? (subscriptionError as { response?: { data?: { message?: string } } }).response?.data?.message
              : undefined;
            toast.error(errorMessage || 'Booking created but failed to setup recurring payment. You can set it up later from the booking details.');
          }
        } else {
          // Booking is pending, subscription will need to be created after payment/confirmation
          toast.info('Booking created. Please complete payment to activate recurring payment subscription.');
        }
      }

      router.push(`/dashboard/bookings/${booking.id}`);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to create booking');
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

          {/* Lease Duration - Required for rental properties */}
          {selectedProperty && selectedProperty.listingType === 'rent' && (
            <Card>
              <CardHeader>
                <CardTitle>Lease Duration</CardTitle>
                <CardDescription>Select the duration of your lease</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="leaseDuration">Lease Duration (Months) *</Label>
                  <Input
                    id="leaseDuration"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.leaseDurationInMonths}
                    onChange={(e) => setFormData({ ...formData, leaseDurationInMonths: e.target.value })}
                    placeholder="12"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 1 month, maximum 120 months (10 years)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Select your preferred payment method</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPaymentMethods ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading payment methods...</span>
                </div>
              ) : paymentMethods.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment methods available</p>
              ) : (
                <div className="space-y-4">
                  <Select
                    value={selectedPaymentMethodId}
                    onValueChange={setSelectedPaymentMethodId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          <div className="flex items-center gap-2">
                            {method.icon ? (
                              <Image
                                src={method.icon}
                                alt={method.name}
                                width={20}
                                height={20}
                                className="object-contain"
                                onError={(e) => {
                                  // Hide image on error
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>{method.name}</span>
                            {method.type === 'card' && (
                              <Badge variant="outline" className="ml-2">Stripe</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPaymentMethodId && (
                    <div className="p-3 bg-muted rounded-lg">
                      {(() => {
                        const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethodId);
                        return selectedMethod ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{selectedMethod.name}</p>
                            {selectedMethod.description && (
                              <p className="text-xs text-muted-foreground">{selectedMethod.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground capitalize">
                              Type: {selectedMethod.type.replace('_', ' ')}
                            </p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recurring Payment Option */}
          {selectedProperty && selectedProperty.listingType === 'rent' && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Options</CardTitle>
                <CardDescription>Choose how you want to pay for this rental</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="recurringPayment"
                    checked={setupRecurringPayment}
                    onCheckedChange={(checked) => setSetupRecurringPayment(checked === true)}
                  />
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="recurringPayment"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Setup Recurring Payment (Automated Monthly Rent)
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Your rent will be automatically charged monthly. You can cancel anytime.
                    </p>
                  </div>
                </div>
                {setupRecurringPayment && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Automated Billing:</strong> Your rent will be automatically
                      charged monthly on the 1st of each month. You can cancel anytime from your booking details.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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
            disabled={
              !formData.propertyId ||
              !formData.checkIn ||
              !formData.checkOut ||
              (selectedProperty?.listingType === 'rent' && !formData.leaseDurationInMonths) ||
              creating
            }
          >
            {creating ? 'Creating...' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </div>
  );
}

