"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { propertiesApi, PropertyResponse } from "@/lib/api/properties-api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PropertyGallery } from "./PropertyGallery";

interface LandlordPropertiesProps {
  userId: string;
}

export function LandlordProperties({ userId }: LandlordPropertiesProps) {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [saleProperties, setSaleProperties] = useState<PropertyResponse[]>([]);
  const [rentProperties, setRentProperties] = useState<PropertyResponse[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        // Fetch separate categories to populate tabs directly
        const [allProps, saleProps, rentProps] = await Promise.all([
          propertiesApi.getProperties({
            ownerId: userId,
            limit: 50
          }),
          propertiesApi.getProperties({
            ownerId: userId,
            listingType: 'sale',
            limit: 50
          }),
          propertiesApi.getProperties({
            ownerId: userId,
            listingType: 'rent',
            limit: 50
          })
        ]);

        setProperties(allProps?.properties || []);
        setSaleProperties(saleProps?.properties || []);
        setRentProperties(rentProps?.properties || []);

      } catch (error) {
        console.error("Failed to fetch landlord properties:", error);
        toast.error("Could not load properties");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProperties();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 space-y-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Property Listings</h3>
      <PropertyGallery
        properties={properties}
        saleProperties={saleProperties}
        rentProperties={rentProperties}
      />
    </div>
  );
}
