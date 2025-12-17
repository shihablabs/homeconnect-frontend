"use client";

import { ShareButton } from "@/components/property/ShareButton";
import { VoteButtons } from "@/components/property/VoteButtons";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PropertyResponse, isRentalResponse } from "@/types/property.types";
import { MapPin, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PropertyBadge } from "./PropertyBadge";
import {
  CommercialDetails,
  LandDetails,
  ResidentialDetails,
} from "./PropertyDetails";

interface PropertyCardProps {
  property: PropertyResponse;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const {
    id,
    title,
    images,
    listingType,
    isNew,
    featured,
    isVerified,
    neighborhood,
    city,
    propertyType,
  } = property;
  const placeholderImage = "/placeholder-property.jpg";
  const imageUrl =
    images && images.length > 0 ? images[0] : placeholderImage;

  const getPriceLabel = () => {
    const currency = property.currency || "BDT";
    if (isRentalResponse(property)) {
      const price = property.rentPrice;
      if (!price || price === 0) return `${currency} 00 /mo`;
      return `${currency} ${price.toLocaleString()} /mo`;
    }

    const price = property.salePrice;
    if (!price || price === 0) return `${currency} 00`;
    return `${currency} ${price.toLocaleString()}`;
  };

  const priceLabel = getPriceLabel();

  // Theme Logic
  const getThemeColor = () => {
    if (["land"].includes(propertyType)) return "border-emerald-500";
    if (["commercial", "office", "shop", "warehouse"].includes(propertyType))
      return "border-amber-500";
    return "border-indigo-600"; // Residential Default
  };

  const renderDetails = () => {
    if (["land"].includes(propertyType)) {
      return <LandDetails property={property} />;
    }
    if (["commercial", "office", "shop", "warehouse"].includes(propertyType)) {
      return <CommercialDetails property={property} />;
    }
    return <ResidentialDetails property={property} />;
  };

  const themeBorder = getThemeColor();

  return (
    <Link href={`/properties/${property.slug || id}`} className="group block">
      <Card
        className={cn(
          "relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-xl hover:-translate-y-1",
          "border-b-[5px] pt-0 gap-0 pb-2", // Status Line
          themeBorder
        )}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Badges */}
          <div className="absolute left-3 top-3 z-10">
            <PropertyBadge
              listingType={listingType}
              isNew={isNew}
              featured={featured}
            />
          </div>

          {/* Price Overlay */}
          <div className="absolute bottom-3 left-3 z-10">
            <p className="text-xl font-bold text-white drop-shadow-md">
              {priceLabel}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          {/* Header & Verification */}
          <div className="flex items-start justify-between gap-2 h-12">
            <h3 className="line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-primary transition-colors">
              {title}
            </h3>
            {isVerified && (
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" aria-label="Verified" />
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">
              {neighborhood}, {city}
            </span>
          </div>

          {/* Dynamic Details */}
          <div className="py-2 border-t border-gray-100 dark:border-gray-800">
            {renderDetails()}
          </div>

          {/* Footer Actions */}
          <div
            className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800"
            onClick={(e) => {
              e.preventDefault(); // Prevent link navigation for interactions
            }}
          >
            <div className="flex items-center gap-2">
              {/* Agent Avatar Placeholder - future improvement */}
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                AG
              </div>
              <span className="text-xs text-muted-foreground">Realtor</span>
            </div>

            <div className="flex items-center gap-2">
              <VoteButtons propertyId={id} compact showScore={false} />
              <ShareButton
                propertyId={id}
                propertySlug={property.slug}
                propertyTitle={title}
                size="icon"
                variant="ghost"
                showLabel={false}
                className="h-8 w-8"
              />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}