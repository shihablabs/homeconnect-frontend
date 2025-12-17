"use client";

import { PropertyCard } from "@/components/cards/PropertyCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useGetPropertiesQuery } from "@/redux/features/property/propertyApiSlice";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewPropertiesPage() {
  const {
    data: searchResult,
    isLoading,
    isError,
  } = useGetPropertiesQuery({
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const properties = searchResult?.properties;

  return (
    <main className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Just Listed"
        description="Be the first to see the newest properties on the market."
        badge="New Arrivals"
      />

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-6">Failed to load new properties.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : !properties?.length ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No new properties found recently.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <Link href="/properties">Browse All Listings</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
