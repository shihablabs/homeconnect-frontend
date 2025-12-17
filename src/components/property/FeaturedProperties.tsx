"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGetFeaturedPropertiesQuery } from "@/redux/features/property/propertyApiSlice";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { PropertyCard } from "../cards/PropertyCard";

function LoadingSkeleton() {
  return (
    <div className=" gap-6 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
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

export function FeaturedProperties() {
  const {
    data: searchResult,
    isLoading,
    isError,
  } = useGetFeaturedPropertiesQuery({ limit: 3 });

  const featuredProperties = searchResult?.properties;

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 rounded-full text-cyan-600 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Premium Featured Properties
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Curated <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Exclusive Listings</span>
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hand-selected premium properties featuring exceptional quality, prime locations,
              and outstanding investment value across Bangladesh&apos;s most sought-after areas.
            </p>
          </div>
          <LoadingSkeleton />
        </div>
      </section>
    );
  }

  if (isError || !featuredProperties || featuredProperties.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 rounded-full text-cyan-600 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Premium Featured Properties
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Curated <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Exclusive Listings</span>
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hand-selected premium properties featuring exceptional quality, prime locations,
            and outstanding investment value across Bangladesh&apos;s most sought-after areas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/properties">
              View All Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}