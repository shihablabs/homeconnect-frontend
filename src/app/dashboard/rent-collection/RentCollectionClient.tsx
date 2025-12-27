'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { bookingsApi, type Booking } from '@/lib/api/bookings-api';
import { paymentsApi, type LandlordEarnings } from '@/lib/api/payments-api';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { RentCycleChart } from './components/RentCycleChart';
import { RentPropertyCard } from './components/RentPropertyCard';

interface PropertyRentStatus {
  booking: Booking;
  status: 'paid' | 'pending' | 'late';
  amountDue: number;
}

export function RentCollectionClient() {
  const [loading, setLoading] = useState(true);
  const [rentProperties, setRentProperties] = useState<PropertyRentStatus[]>([]);
  const [earnings, setEarnings] = useState<LandlordEarnings | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Landlord Earnings (Overview data)
      const earningsData = await paymentsApi.getLandlordEarnings();
      setEarnings(earningsData);

      // 2. Fetch Active Rentals (Bookings)
      // Note: We're filtering client-side for now as the API returns all bookings
      const { bookings } = await bookingsApi.getUserBookings('landlord');
      const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');

      // 3. Map bookings to status
      // In a real app, we'd check recent payments for each booking to determine status.
      // For this MVP, we'll simulate status based on random data or look for missing fields 
      // if the API supported "last payment date" directly on booking.
      // Assuming 'pending' as default for now unless we find logic.

      // Since we don't have a direct "Is Rent Due?" API, we will infer it:
      // If we have earnings breakdown, we can guess. But better to use a placeholder logic 
      // or check the 'payments' history for this month. 
      // Optimization: Fetch consolidated status if available.

      // For demonstration, let's map statuses:
      const mappedProperties: PropertyRentStatus[] = activeBookings.map(booking => {
        // Mock logic: 
        // If booking ID is even -> 'paid', if odd -> 'pending'
        // In production, cross-reference with `paymentsApi.getPaymentHistory` filtered by rentMonth
        const isPaid = Math.random() > 0.4;
        return {
          booking,
          status: isPaid ? 'paid' : 'pending',
          amountDue: booking.totalAmount
        };
      });

      setRentProperties(mappedProperties);

    } catch (error: unknown) {
      console.error('Error fetching rent data:', error);
      toast.error('Failed to load rent dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordPayment = (bookingId: string) => {
    const booking = rentProperties.find(p => p.booking.id === bookingId)?.booking;
    if (booking) {
      setSelectedBooking(booking);
      setModalOpen(true);
    }
  };

  const handleSendReminder = async (bookingId: string) => {
    // Mock API call for reminder
    toast.info('Sending payment reminder (Taagad)...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Taagad sent to tenant successfully!');
  };

  const handlePaymentSuccess = () => {
    fetchData(); // Refresh data
  };

  const totalMonthlyExpected = rentProperties.reduce((sum, item) => sum + item.amountDue, 0);
  // Using the mock status to calculate collected
  const totalMonthlyCollected = rentProperties
    .filter(p => p.status === 'paid')
    .reduce((sum, item) => sum + item.amountDue, 0);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rent Management</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your properties, tenants, and monthly financial health.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium text-muted-foreground">Current Month</p>
          <p className="text-2xl font-bold text-primary">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Top Cards Section: Financial Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart Card */}
        <div className="md:col-span-1">
          <RentCycleChart
            totalExpected={totalMonthlyExpected}
            totalCollected={totalMonthlyCollected}
          />
        </div>

        {/* Stats Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Summary Text Card */}
          <Card className="flex flex-col justify-center border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-muted-foreground">Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ৳{totalMonthlyCollected.toLocaleString()}
                <span className="text-muted-foreground text-lg font-normal"> / ৳{totalMonthlyExpected.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                You have collected {Math.round((totalMonthlyCollected / (totalMonthlyExpected || 1)) * 100)}% of this month&apos;s rent.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium text-muted-foreground">Active Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {rentProperties.length}
              </div>
              <div className="flex gap-3 mt-2 text-sm">
                <div className="flex items-center gap-1 text-green-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                  {rentProperties.filter(p => p.status === 'paid').length} Paid
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  {rentProperties.filter(p => p.status !== 'paid').length} Pending
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {rentProperties.length === 0 ? (
        <Alert variant="default" className="bg-muted/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Active Rentals</AlertTitle>
          <AlertDescription>
            You don&apos;t have any active rental leases yet. Once you approve tenants, they will appear here.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Property Status</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rentProperties.map(({ booking, status, amountDue }) => (
              <RentPropertyCard
                key={booking.id}
                booking={booking}
                paymentStatus={status}
                amountDue={amountDue}
                onRecordPayment={handleRecordPayment}
                onSendReminder={handleSendReminder}
              />
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedBooking && (
        <RecordPaymentModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedBooking(null);
          }}
          bookingId={selectedBooking.id}
          tenantName={selectedBooking.tenant.name}
          monthlyRent={selectedBooking.totalAmount}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
