"use client";

import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useGetPropertiesQuery } from "@/redux/features/property/propertyApiSlice";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { PropertyCard } from "../cards/PropertyCard";

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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

export function NewArrivals() {
  const {
    data: searchResult,
    isLoading,
    isError,
  } = useGetPropertiesQuery({
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    listingType: 'sale'
  });

  const properties = searchResult?.properties;

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-purple-600 text-sm font-medium mb-4">
              <Clock className="w-4 h-4" />
              Fresh on Market
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              New Arrivals <span className="text-purple-600">For Sale</span>
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Be the first to browse our latest property additions. Exclusive homes and investment opportunities just listed.
            </p>
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
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-4">
            <Clock className="w-4 h-4" />
            Fresh on Market
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            New Arrivals <span className="text-primary">For Sale</span>
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Be the first to browse our latest property additions. Exclusive homes and investment opportunities just listed.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full relative group mb-12"
        >
          <div className="absolute -top-[100px] right-0 flex gap-2 invisible md:visible">
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
          {}
          <div className="flex justify-center gap-4 mt-4 md:hidden">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>

        <div className="text-center">
          <Link
            href="/properties?listingType=sale&sort=createdAt"
            className="flex items-center justify-center gap-2 max-w-80 mx-auto w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            <span>View All New Arrivals</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </section>
  );
}
