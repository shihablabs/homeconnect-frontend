"use client";

import { PropertyCard } from "@/components/cards/PropertyCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyResponse } from "@/lib/api/properties-api";
import { Home } from "lucide-react";

interface PropertyGalleryProps {
  properties: PropertyResponse[];
  saleProperties: PropertyResponse[];
  rentProperties: PropertyResponse[];
}

export function PropertyGallery({ properties, saleProperties, rentProperties }: PropertyGalleryProps) {
  const hasProperties = properties.length > 0;

  return (
    <div className="min-h-[400px]">
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-gray-100/50 p-1 rounded-xl h-auto w-full max-w-md grid grid-cols-3 gap-1">
            <TabsTrigger
              value="all"
              className="rounded-lg py-2 font-medium text-gray-500 data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="sale"
              className="rounded-lg py-2 font-medium text-gray-500 data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm"
            >
              For Sale
            </TabsTrigger>
            <TabsTrigger
              value="rent"
              className="rounded-lg py-2 font-medium text-gray-500 data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm"
            >
              For Rent
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          {hasProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <EmptyState message="This landlord hasn't listed any properties yet." />
          )}
        </TabsContent>

        <TabsContent value="sale" className="mt-0">
          {saleProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {saleProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <EmptyState message="No properties for sale." />
          )}
        </TabsContent>

        <TabsContent value="rent" className="mt-0">
          {rentProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {rentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <EmptyState message="No properties for rent." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-200 shadow-sm mt-2">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-50 mb-4">
        <Home className="w-8 h-8 text-cyan-500/50" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">No Active Listings</h3>
      <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
        {message}
      </p>
    </div>
  );
}
