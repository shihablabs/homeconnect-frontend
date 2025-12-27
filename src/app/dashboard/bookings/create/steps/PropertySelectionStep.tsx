import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { PropertyResponse } from '@/types/property.types';
import { Check, Home, Search } from 'lucide-react';
import Image from 'next/image';

interface PropertySelectionStepProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedProperty: PropertyResponse | null;
  setSelectedProperty: (property: PropertyResponse | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  properties: PropertyResponse[];
  loading: boolean;
  searchProperties: () => void;
  handleSelectProperty: (property: PropertyResponse) => void;
}

export function PropertySelectionStep({
  currentStep,
  setCurrentStep,
  selectedProperty,
  setSelectedProperty,
  searchQuery,
  setSearchQuery,
  properties,
  loading,
  searchProperties,
  handleSelectProperty,
}: PropertySelectionStepProps) {
  return (
    <Card className={`border-none shadow-md overflow-hidden transition-all duration-300 ${currentStep === 1 ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
      <div className="bg-primary/5 p-4 border-b border-primary/10 flex justify-between items-center cursor-pointer"
        onClick={() => setCurrentStep(1)}>
        <h2 className="font-semibold text-lg flex items-center gap-2 text-primary">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">1</span>
          Property Selection
        </h2>
        {currentStep > 1 && selectedProperty && <Check className="h-5 w-5 text-green-500" />}
      </div>

      {(currentStep === 1 || !selectedProperty) && (
        <CardContent className="p-6 space-y-4">
          {!selectedProperty ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, location, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchProperties())}
                  className="pl-10 h-12 text-base"
                />
                <Button
                  type="button"
                  onClick={searchProperties}
                  disabled={loading}
                  className="absolute right-1 top-1 h-10 px-4"
                >
                  {loading ? 'Searching...' : 'Find'}
                </Button>
              </div>

              {properties.length > 0 && (
                <div className="grid gap-3 pt-2">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      onClick={() => handleSelectProperty(property)}
                      className="flex items-start gap-4 p-3 rounded-xl border hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                    >
                      <div className="h-20 w-24 relative rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        {property.images?.[0] ? (
                          <Image
                            src={property.images[0]}
                            alt={property.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Home className="h-8 w-8 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                        <p className="text-sm text-gray-500 mb-1">{property.address}, {property.city}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{property.listingType}</Badge>
                          <span className="text-sm font-bold text-primary">
                            ৳{property.listingType === 'rent' ? (property as any).pricePerMonth?.toLocaleString() : (property as any).totalPrice?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="group relative rounded-xl border overflow-hidden">
              <div className="absolute top-2 right-2 z-10">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-8 px-3 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setSelectedProperty(null);
                    handleSelectProperty(null as any); // Ideally clear propertyId too
                    setCurrentStep(1);
                  }}
                >
                  Change
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-1/3 h-32 sm:h-auto relative bg-gray-100">
                  {selectedProperty.images?.[0] ? (
                    <Image src={selectedProperty.images[0]} alt={selectedProperty.title} fill className="object-cover" />
                  ) : (
                    <Home className="h-10 w-10 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <div className="p-4 sm:w-2/3">
                  <Badge variant="outline" className="mb-2 theme-blue">{selectedProperty.listingType}</Badge>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedProperty.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{selectedProperty.address}, {selectedProperty.city}</p>
                  <p className="text-lg font-bold text-primary">
                    ৳{selectedProperty.listingType === 'rent' ? (selectedProperty as any).pricePerMonth?.toLocaleString() : (selectedProperty as any).totalPrice?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedProperty && currentStep === 1 && (
            <div className="flex justify-end pt-4">
              <Button onClick={() => setCurrentStep(2)}>Next: Application Details</Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
