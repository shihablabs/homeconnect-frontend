"use client";

import { Card } from "@/components/ui/card";
import { useGetPropertiesQuery } from "@/redux/features/property/propertyApiSlice";
import { ArrowRight, Sparkles, Tag } from "lucide-react";
import Link from "next/link";
import { PropertyCard } from "../cards/PropertyCard";

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse pt-0">
          <div className="h-56 bg-gray-200 rounded-t-lg" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function GoodDeals() {
  
  const {
    data: searchResult,
    isLoading,
    isError,
  } = useGetPropertiesQuery({
    limit: 4,
    sortBy: 'price',
    sortOrder: 'asc', 
    listingType: 'sale' 
  });

  const properties = searchResult?.properties;

  if (isLoading) {
    return (
      <section className="py-12 md:py-20 relative overflow-hidden">
        {}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white -z-10" />

        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Hot Deals
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Best Value <span className="text-orange-600">Properties</span>
            </h3>
          </div>
          <LoadingSkeleton />
        </div>
      </section>
    );
  }

  if (isError || !properties || properties.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-4 shadow-sm border border-orange-200">
            <Tag className="w-4 h-4" />
            Unbeatable Prices
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Best Deals <span className="text-orange-600">For You</span>
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover incredible value with our hand-picked selection of affordable properties.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-12">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/properties?sort=price&sortOrder=asc"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-white border-2 border-orange-100 text-orange-600 font-semibold shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 hover:border-orange-200 hover:bg-orange-50 transition-all duration-200"
          >
            <span>View All Deals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </section>
  );
}
