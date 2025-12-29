import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PropertyResponse } from '@/types/property.types';
import { ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface BookingSummaryProps {
  selectedProperty: PropertyResponse | null;
  calculateTotalDays: () => number;
}

export function BookingSummary({ selectedProperty, calculateTotalDays }: BookingSummaryProps) {
  return (
    <div className="sticky top-24 space-y-6">
      <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden">
        <CardHeader className="bg-gray-50/50 pb-4">
          <CardTitle className="text-lg">Application Summary</CardTitle>
          <CardDescription>Your request details</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {selectedProperty ? (
            <div className="divide-y">
              {}
              <div className="p-4 flex gap-3">
                <div className="h-16 w-16 relative rounded bg-gray-100 shrink-0 overflow-hidden">
                  {selectedProperty.images?.[0] && (
                    <Image src={selectedProperty.images[0]} alt="Prop" fill className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{selectedProperty.title}</p>
                  <p className="text-xs text-gray-500 truncate">{selectedProperty.city}</p>
                  <p className="text-xs font-medium text-primary mt-1">
                    ৳{selectedProperty.listingType === 'rent' ? (selectedProperty as any).pricePerMonth?.toLocaleString() : (selectedProperty as any).totalPrice?.toLocaleString()}
                  </p>
                </div>
              </div>

              {}
              {calculateTotalDays() > 0 && selectedProperty.listingType === 'rent' && (
                <div className="p-4 bg-primary/5">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-semibold text-gray-700">Estimated Advance<br /><span className="text-[10px] font-normal text-muted-foreground">(Security Deposit)</span></span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-primary">
                        ৳{((selectedProperty as any).securityDeposit || (selectedProperty as any).pricePerMonth)?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 text-center">Payable only after approval</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
              Select a property
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-100 shadow-none">
        <CardContent className="p-4 flex gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm text-blue-900">Secure Process</h4>
            <p className="text-xs text-blue-700 mt-1">
              Your data is encrypted. Landlords can only see your documents after you apply.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
