"use client";

import { SimilarProperties } from "@/components/property/SimilarProperties";
import { Separator } from "@/components/ui/separator";
import { PropertyResponse } from "@/types/property.types";
import dynamic from "next/dynamic";
import { PropertyDetailsSection } from "./PropertyDetailsSection";
import { PropertyHeader } from "./PropertyHeader";
import { PropertyImageGallery } from "./PropertyImageGallery";
import { PropertySidebar } from "./PropertySidebar";
const PropertyMap = dynamic(
  () => import("./PropertyMap").then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => <div className="h-96 w-full rounded-lg bg-gray-100 animate-pulse" />,
  }
);

export function PropertyClientPage({
  property,
}: {
  property: PropertyResponse;
}) {
  console.log("Check Muster By Client: ", property);
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 pb-16">
        <PropertyImageGallery
          images={property?.images}
          title={property?.title}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PropertyHeader property={property} />
            <Separator />
            <PropertyDetailsSection property={property} />
          </div>

          <aside className="lg:col-span-1">
            <PropertySidebar
              agent={property.agent}
              owner={property.owner}
              price={
                property.listingType === "rent"
                  ? property.rentPrice
                  : property.salePrice
              }
              currency={property.currency}
              listingType={property.listingType}
              propertyId={property.id}
              propertySlug={property.slug}
              propertyTitle={property.title}
            />
          </aside>
        </div>
      </div>

      <Separator />

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-6">Location</h2>
        <PropertyMap
          position={[property.latitude, property.longitude]}
          address={property.address}
        />
      </section>

      <SimilarProperties
        currentPropertyId={property.id}
        listingType={property.listingType}
        propertyType={property.propertyType}
      />
    </div>
  );
}