'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreateOrderRequest, OrderPackage, useCreateOrderMutation, useGetPackagesQuery } from '@/redux/features/order/orderApiSlice';
import { ArrowRight, Check, Loader2, MapPin, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ServiceRequisitionClient() {
  const router = useRouter();
  const { data: packagesData, isLoading: isLoadingPackages } = useGetPackagesQuery();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  const [selectedPackage, setSelectedPackage] = useState<OrderPackage | null>(null);
  const [listingType, setListingType] = useState<'rent' | 'sale' | 'both'>('rent');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [notes, setNotes] = useState('');

  const packages = packagesData?.packages || [];

  const handleSelectPackage = (pkg: OrderPackage) => {
    setSelectedPackage(pkg);
  };

  const handleSubmit = async () => {
    if (!selectedPackage) return;
    if (!city) {
      toast.error("Please enter a preferred city");
      return;
    }

    try {
      const orderData: CreateOrderRequest = {
        packageId: selectedPackage.packageId as 'basic' | 'premium' | 'elite', 
        listingType,
        preferences: {
          city,
          neighborhood: neighborhood || undefined,
        },
        notes: notes || undefined,
      };

      await createOrder(orderData).unwrap();
      toast.success("Service requisition submitted successfully!");
      router.push('/dashboard/my-orders');
    } catch (error: unknown) {
      console.error("Failed to create requisition:", error);
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { message?: string } }).data?.message
        : "Failed to submit requisition";
      toast.error(errorMessage);
    }
  };

  if (isLoadingPackages) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 mb-2">
          Service Requisition
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select a service package that best fits your housing needs. We will assist you in finding the perfect property.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <Card
            key={pkg.packageId}
            className={`flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${selectedPackage?.packageId === pkg.packageId ? 'ring-2 ring-primary border-primary' : ''
              }`}
          >
            {pkg.packageId === 'premium' && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold">{pkg.packageName}</CardTitle>
              <CardDescription className="flex justify-center items-baseline mt-2">
                <span className="text-3xl font-bold text-foreground">
                  {pkg.currency} {pkg.price}
                </span>
                <span className="text-muted-foreground ml-1">/ request</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3 mt-4">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-3 bg-muted/50 rounded-lg text-sm text-center text-muted-foreground">
                <span className="font-semibold block mb-1">Estimated Duration</span>
                {pkg.duration} days support
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={selectedPackage?.packageId === pkg.packageId ? "default" : "outline"}
                onClick={() => handleSelectPackage(pkg)}
              >
                {selectedPackage?.packageId === pkg.packageId ? 'Selected' : 'Select Package'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedPackage} onOpenChange={(open) => !open && setSelectedPackage(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Your Requisition</DialogTitle>
            <DialogDescription>
              Please provide details for your {selectedPackage?.packageName} request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="listingType">Requisition Type</Label>
              <Select value={listingType} onValueChange={(val: 'rent' | 'sale' | 'both') => setListingType(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Rental</SelectItem>
                  <SelectItem value="sale">Purchase</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Preferred City</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="city"
                    placeholder="e.g. Dhaka"
                    className="pl-9"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Neighborhood</Label>
                <Input
                  id="neighborhood"
                  placeholder="e.g. Gulshan"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Requirements (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Specific amenities, budget range, floor preference..."
                className="resize-none"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Service Fee:</span>
              <span className="font-bold text-lg">{selectedPackage?.currency} {selectedPackage?.price}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPackage(null)} disabled={isCreatingOrder}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isCreatingOrder}>
              {isCreatingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Confirm Requisition
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
