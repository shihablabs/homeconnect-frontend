"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OwnerAgentResponse } from "@/types/property.types";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { MessageSquare, Phone } from "lucide-react";
import { ShareButton } from "@/components/property/ShareButton";

interface PropertySidebarProps {
  owner: OwnerAgentResponse;
  agent?: OwnerAgentResponse;
  price: number;
  currency: string;
  listingType: "rent" | "sale";
  propertyId?: string;
  propertyTitle?: string;
}

export function PropertySidebar({
  owner,
  agent,
  price,
  currency,
  listingType,
  propertyId,
  propertyTitle,
}: PropertySidebarProps) {
  const contactPerson = agent || owner;

  const getPriceLabel = () => {
    const formattedPrice = price ? price.toLocaleString() : "00";
    const suffix = listingType === "rent" ? " /mo" : "";
    return `${currency} ${formattedPrice}${suffix}`;
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ").filter(Boolean);
    return (parts[0]?.[0] ?? "").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
  };

  return (
    <Card className="p-6 sticky top-24 shadow-lg">
      <div className="mb-4">
        <span className="text-sm text-gray-500">
          {listingType === "rent" ? "Monthly Rent" : "Asking Price"}
        </span>
        <div className="text-3xl font-bold text-primary">{getPriceLabel()}</div>
      </div>

      <Separator className="my-6" />

      <h3 className="text-lg font-semibold mb-4">
        {agent ? "Listing Agent" : "Property Owner"}
      </h3>
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          <AvatarImage src={contactPerson.avatar} alt={contactPerson.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
            {getInitials(contactPerson.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-lg text-gray-900">
            {contactPerson.name}
          </div>
          <div className="text-sm text-gray-500">
            {contactPerson.company || "Private Owner"}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button size="lg" className="w-full">
          <MessageSquare className="mr-2 h-4 w-4" />
          Send Message
        </Button>
        <Button size="lg" variant="outline" className="w-full">
          <Phone className="mr-2 h-4 w-4" />
          {contactPerson.phone || "Request Phone"}
        </Button>
        {propertyId && propertyTitle && (
          <ShareButton
            propertyId={propertyId}
            propertyTitle={propertyTitle}
            variant="outline"
            size="lg"
            className="w-full"
          />
        )}
      </div>
    </Card>
  );
}