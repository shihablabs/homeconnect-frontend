"use client";

import { Card } from "@/components/ui/card";
import {
  isRentalResponse,
  PropertyResponse,
} from "@/types/property.types";

interface PropertyDetailsSectionProps {
  property: PropertyResponse;
}

interface DetailItem {
  label: string;
  value: string | number | undefined;
  transform?: "capitalize";
}

export function PropertyDetailsSection({
  property,
}: PropertyDetailsSectionProps) {
  const { description, amenities } = property;

  const details: DetailItem[] = [
    {
      label: "Property Type",
      value: property.propertyType,
      transform: "capitalize",
    },
    { label: "Status", value: property.status, transform: "capitalize" },
    { label: "Bedrooms", value: property.bedrooms },
    { label: "Bathrooms", value: property.bathrooms },
    { label: "Area Size", value: `${property.areaSize} ${property.areaUnit}` },
    { label: "Year Built", value: property.yearBuilt || "N/A" },
  ];

  if (isRentalResponse(property)) {
    details.push(
      { label: "Furnished", value: property.isFurnished ? "Yes" : "No" },
      { label: "Minimum Stay", value: `${property.minimumStay} months` },
      {
        label: "Pet Policy",
        value: property.petPolicy,
        transform: "capitalize",
      },
      {
        label: "Smoking Policy",
        value: property.smokingPolicy,
        transform: "capitalize",
      }
    );
  } else {
    details.push(
      {
        label: "Condition",
        value: property.propertyCondition,
        transform: "capitalize",
      },
      {
        label: "Ownership",
        value: property.ownershipType,
        transform: "capitalize",
      },
      {
        label: "Mortgage",
        value: property.mortgageAvailable ? "Available" : "Not Available",
      }
    );
  }

  return (
    <Card className="p-6 md:p-8 border-none shadow-none">
      <h2 className="text-2xl font-semibold mb-4">About this property</h2>
      <p className="text-gray-600 leading-relaxed">{description}</p>

      <h3 className="text-xl font-semibold mt-8 mb-4">Details</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
        {details.map((item) => (
          <div key={item.label}>
            <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
            <dd
              className={`text-gray-900 font-semibold ${item.transform || ""
                }`}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-10 mb-6 font-heading border-b border-gray-100 pb-2">Amenities</h3>
      {amenities.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
          {amenities.map((amenity) => (
            <li
              key={amenity}
              className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors group"
            >
              <div className="h-2 w-2 rounded-full bg-cyan-500 group-hover:scale-125 transition-transform shrink-0" />
              <span className="text-base font-medium font-sans border-b border-transparent group-hover:border-gray-200 leading-relaxed">
                {amenity}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-6 text-gray-500 italic font-medium">
          No specific amenities listed.
        </div>
      )}
    </Card>
  );
}