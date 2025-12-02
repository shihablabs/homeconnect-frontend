"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  PropertyResponse,
  isRentalResponse,
} from "@/types/property.types";
import {
  Bath,
  Bed,
  MapPin,
  Ruler,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { VoteButtons } from "@/components/property/VoteButtons";
import { ShareButton } from "@/components/property/ShareButton";

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
    bedrooms,
    bathrooms,
    areaSize,
    areaUnit,
    neighborhood,
    city,
  } = property;
  const placeholderImage = "/placeholder-property.jpg";
  const imageUrl =
    images && images.length > 0
      ? images[0]
      : placeholderImage;

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

  return (
    <Link href={`/properties/${id}`} className="group block">
      <Card
        className="
          relative overflow-hidden rounded-2xl border
          bg-background/60 supports-[backdrop-filter]:backdrop-blur
          shadow-sm transition-all
          hover:-translate-y-0.5 hover:shadow-xl
          ring-1 ring-black/5 dark:ring-white/10
          focus-within:ring-2 focus-within:ring-primary/50 !pt-0
        "
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-indigo-500/50 via-blue-500/50 to-sky-500/50"
        />

        <div className="relative h-44 w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width:768px) h-full w-full, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

          <div className="absolute left-2 top-3 flex gap-2">
            <Badge
              variant="secondary"
              className="
                border border-white/30 bg-white/85 text-black shadow
                hover:bg-white/90
              "
            >
              {listingType === "rent" ? "For Rent" : "For Sale"}
            </Badge>
            {isNew && (
              <Badge className="border border-emerald-400/30 bg-emerald-500 text-white shadow">
                New
              </Badge>
            )}
            {featured && (
              <Badge className="border border-amber-400/30 bg-amber-500 text-white shadow">
                Featured
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <div className="text-base font-semibold text-primary">
              {priceLabel}
            </div>

            {isVerified ? (
              <span
                className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-100/80 border border-emerald-200"
                title="Verified listing"
              >
                <ShieldCheck
                  className="h-3 w-3 text-emerald-600"
                  aria-hidden="true"
                />
                Verified
              </span>
            ) : (
              <span
                className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100/80 border border-red-200"
                title="Not verified"
              >
                <ShieldOff
                  className="h-3 w-3 text-red-600"
                  aria-hidden="true"
                />
                Not Verified
              </span>
            )}
          </div>

          <h3 className="line-clamp-1 text-sm font-medium text-gray-800">
            {title}
          </h3>

          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Bed className="h-4 w-4" aria-hidden="true" /> {bedrooms}{" "}
              {bedrooms === 1 ? "bd" : "bds"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath className="h-4 w-4" aria-hidden="true" /> {bathrooms}{" "}
              {bathrooms === 1 ? "ba" : "bas"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Ruler className="h-4 w-4" aria-hidden="true" />{" "}
              {areaSize.toLocaleString()} {areaUnit}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span className="line-clamp-1">
              {neighborhood ? `${neighborhood}, ` : ""}
              {city}
            </span>
          </div>

          {/* Voting and Share Section */}
          <div 
            className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <VoteButtons 
                propertyId={id} 
                compact={true}
                showScore={false}
              />
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <ShareButton
                propertyId={id}
                propertyTitle={title}
                variant="ghost"
                size="sm"
                showLabel={false}
              />
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
            group-hover:opacity-100
            ring-1 ring-inset ring-transparent
            [background:radial-gradient(1200px_400px_at_100%_0%,rgba(99,102,241,0.10),transparent_40%),radial-gradient(1200px_400px_at_0%_100%,rgba(56,189,248,0.10),transparent_40%)]
          "
        />
      </Card>
    </Link>
  );
}