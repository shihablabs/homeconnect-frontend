'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Booking } from '@/lib/api/bookings-api';
import { Calendar, CheckCircle2, Clock, DollarSign, Home, MoreVertical, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface RentPropertyCardProps {
  booking: Booking;
  paymentStatus: 'paid' | 'pending' | 'late' | 'partial'; // simplified status for UI
  amountDue?: number;
  onRecordPayment: (bookingId: string) => void;
  onSendReminder: (bookingId: string) => void;
}

export function RentPropertyCard({
  booking,
  paymentStatus,
  amountDue,
  onRecordPayment,
  onSendReminder
}: RentPropertyCardProps) {

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case 'paid':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500 gap-1">
            <Clock className="h-3 w-3" />
            Due
          </Badge>
        );
      case 'late':
        return (
          <Badge variant="destructive" className="gap-1">
            <Clock className="h-3 w-3" />
            Overdue
          </Badge>
        );
      default:
        return <Badge variant="secondary">{paymentStatus}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Property Image Section */}
          <div className="relative w-full sm:w-48 h-32 sm:h-auto shrink-0 bg-muted">
            {booking.property.images?.[0] ? (
              <Image
                src={booking.property.images[0]}
                alt={booking.property.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Home className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 left-2">
              {getStatusBadge()}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 p-4 flex flex-col justify-between gap-4">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1" title={booking.property.title}>
                    {booking.property.title}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    {booking.property.address}, {booking.property.city}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/bookings/${booking.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/properties/${booking.property.id}`}>Property Page</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-secondary/30 px-2 py-1 rounded text-sm">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">{booking.tenant.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Lease ends {new Date(booking.checkOut).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Monthly Rent</span>
                <span className="font-bold">৳{booking.totalAmount.toLocaleString()}</span>
              </div>

              <div className="flex gap-2">
                {paymentStatus !== 'paid' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSendReminder(booking.id)}
                      className="text-xs h-8"
                    >
                      Send Taagad
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onRecordPayment(booking.id)}
                      className="text-xs h-8 gap-1"
                    >
                      <DollarSign className="h-3 w-3" /> Record Pay
                    </Button>
                  </>
                )}
                {paymentStatus === 'paid' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled
                    className="text-xs h-8 gap-1 opacity-70"
                  >
                    All Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
