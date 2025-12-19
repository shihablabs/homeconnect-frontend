"use client";

import { PropertyCard } from "@/components/cards/PropertyCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { propertiesApi } from "@/lib/api/properties-api";
import { ListingType, PropertyResponse } from "@/types/property.types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface SimilarPropertiesProps {
  currentPropertyId: string;
  listingType: ListingType;
  propertyType?: string;
}

export function SimilarProperties({
  currentPropertyId,
  listingType,
}: SimilarPropertiesProps) {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["similar-properties", listingType],
    queryFn: async () => {
      const response = await propertiesApi.getProperties({
        listingType,
        page: 1,
        limit: 6, // Fetch 6 to ensure we have 5 after filtering current
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      // Handle API inconsistency: check if response is array or PropertySearchResult object
      if (Array.isArray(response)) {
        return response;
      }
      return response?.properties || [];
    },
  });

  useEffect(() => {
    if (data) {
      // Filter out current property and take max 5
      const filtered = data.filter((p) => p.id !== currentPropertyId).slice(0, 5);
      setProperties(filtered);
    }
  }, [data, currentPropertyId]);

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-16 border-t border-gray-100">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      </section>
    );
  }

  // If we have no properties after filtering, show a message instead of nothing
  if (properties.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16 border-t border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-heading mb-2">
          Similar Properties
        </h2>
        <p className="text-gray-500 mb-8">
          Latest {listingType === "rent" ? "rental" : "sale"} properties just for you
        </p>
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No similar properties found at this moment.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-16 border-t border-gray-100">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-heading">
            Similar Properties
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            Other {listingType === "rent" ? "rental" : "sale"} properties you might like
          </p>
        </div>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full relative group"
      >
        <div className="absolute -top-16 right-0 flex gap-2">
          <CarouselPrevious className="static translate-y-0 h-10 w-10 border-gray-200 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 transition-all font-bold shadow-sm" />
          <CarouselNext className="static translate-y-0 h-10 w-10 border-gray-200 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 transition-all font-bold shadow-sm" />
        </div>
        <CarouselContent className="-ml-4 pb-4">
          {properties.map((property) => (
            <CarouselItem
              key={property.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <PropertyCard property={property} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
