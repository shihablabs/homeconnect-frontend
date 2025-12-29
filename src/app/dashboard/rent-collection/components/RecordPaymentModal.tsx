'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { paymentsApi } from '@/lib/api/payments-api';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | null;
  tenantName?: string;
  monthlyRent?: number;
  onSuccess: () => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  bookingId,
  tenantName,
  monthlyRent,
  onSuccess,
}: RecordPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<string>(monthlyRent?.toString() || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;

    try {
      setLoading(true);
      await paymentsApi.createRentPayment({
        bookingId,
        amount: Number(amount),
        rentMonth: new Date(date).toISOString(), 
        notes,
        method: 'cash', 
      });

      toast.success('Payment recorded successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to record payment:', error);
      toast.error('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Manual Payment</DialogTitle>
          <DialogDescription>
            Record a payment received outside the platform (Cash, Bank Transfer, bKash).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tenant</Label>
            <div className="p-2 bg-muted rounded-md text-sm font-medium">
              {tenantName || 'Unknown Tenant'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (৳)</Label>
              <Input
                id="amount"
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date Received</Label>
              <Input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Received via bKash personal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
