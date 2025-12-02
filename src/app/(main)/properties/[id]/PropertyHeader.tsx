/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  isRentalResponse,
  PropertyResponse,
} from "@/types/property.types";
import {
  Bath,
  Bed,
  Building,
  MapPin,
  Ruler,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { VoteButtons } from "@/components/property/VoteButtons";
import { ShareButton } from "@/components/property/ShareButton";

interface PropertyHeaderProps {
  property: PropertyResponse;
}

export function PropertyHeader({ property }: PropertyHeaderProps) {
  const {
    title,
    city,
    neighborhood,
    address,
    listingType,
    bedrooms,
    bathrooms,
    areaSize,
    areaUnit,
    isVerified,
    propertyType,
  } = property;

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

  const fullAddress = `${address}, ${neighborhood}, ${city}`;

  return (
    <Card className="p-6 md:p-8 border-none shadow-none">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{fullAddress}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="text-3xl font-bold text-primary">{getPriceLabel()}</div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 text-gray-700">
        <div className="flex items-center gap-2">
          <Bed className="h-5 w-5 text-primary" />
          <span className="font-medium">
            {bedrooms} Bed{bedrooms !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Bath className="h-5 w-5 text-primary" />
          <span className="font-medium">
            {bathrooms} Bath{bathrooms !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-primary" />
          <span className="font-medium">
            {areaSize} {areaUnit}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          <span className="font-medium capitalize">{propertyType}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {isVerified ? (
            <Badge
              variant="outline"
              className="border-green-600 bg-green-50 text-green-700"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Verified Listing
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-red-600 bg-red-50 text-red-700"
            >
              <ShieldOff className="mr-2 h-4 w-4" />
              Not Verified
            </Badge>
          )}
          <VoteButtons propertyId={property.id} />
        </div>
        <ShareButton 
          propertyId={property.id}
          propertyTitle={title}
        />
      </div>
    </Card>
  );
}