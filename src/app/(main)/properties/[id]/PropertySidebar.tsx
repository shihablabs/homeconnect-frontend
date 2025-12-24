"use client";

import { PhoneVerification } from "@/components/auth/PhoneVerification";
import { MakeOfferModal } from "@/components/modals/MakeOfferModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { bookingsApi } from "@/lib/api/bookings-api";
import { stripePromise } from "@/lib/stripe";
import { RootState } from "@/redux/store";
import { OwnerAgentResponse } from "@/types/property.types";
import { MessageSquare, Phone, Share2, ShieldCheck, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface PropertySidebarProps {
  owner: OwnerAgentResponse;
  agent?: OwnerAgentResponse;
  price: number;
  currency: string;
  listingType: "rent" | "sale";
  propertyId?: string;
  propertySlug?: string;
  propertyTitle?: string;
}

export function PropertySidebar({
  owner,
  agent,
  price,
  currency,
  listingType,
  propertyId,
  propertySlug,
  propertyTitle,
}: PropertySidebarProps) {
  const contactPerson = agent || owner;
  const { checkAuth } = useAuthGuard();
  const router = useRouter();
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleRentNow = async () => {
    checkAuth(async () => {
      if (!user) return;

      if (!user.isPhoneVerified) {
        setIsPhoneModalOpen(true);
        return;
      }

      setIsBookingLoading(true);
      try {
        // Create a booking
        // For simplicity, we assume a standard 12-month lease from today
        const checkIn = new Date();
        const checkOut = new Date();
        checkOut.setFullYear(checkOut.getFullYear() + 1);

        const booking = await bookingsApi.createBooking({
          propertyId: propertyId!,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          leaseDurationInMonths: 12,
        });

        // Create Stripe checkout session
        const session = await bookingsApi.createPaymentSession({
          bookingId: booking.id,
          returnUrl: `${window.location.origin}/dashboard/bookings/${booking.id}/complete`,
        });

        const stripe = await stripePromise;
        if (stripe) {
          await (stripe as any).redirectToCheckout({ sessionId: session.sessionId });
        }
      } catch (error: any) {
        console.error("Booking failed:", error);
        toast.error(error.response?.data?.message || "Failed to initiate payment. Please try again.");
      } finally {
        setIsBookingLoading(false);
      }
    });
  };

  const getPriceLabel = () => {
    const formattedPrice = price ? price.toLocaleString() : "00";
    const suffix = listingType === "rent" ? " /mo" : "";
    return `${currency} ${formattedPrice}${suffix}`;
  };

  const handleProfileClick = () => {
    checkAuth(() => {
      router.push(`/profile/${contactPerson.id}`);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle || "Property Details",
          url: `${window.location.origin}/properties/${propertySlug || propertyId}`,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/properties/${propertySlug || propertyId}`);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <Card className="p-8 sticky top-24 shadow-2xl border-gray-100 rounded-2xl overflow-hidden group">
      {/* Price Header Section */}
      <div className="mb-8">
        <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-1 block">
          {listingType === "rent" ? "Monthly Rent" : "Asking Price"}
        </span>
        <div className="text-4xl font-black text-gray-900 tracking-tight leading-none">
          {getPriceLabel()}
        </div>
      </div>

      <Separator className="mb-8 bg-gray-100" />

      {/* Author Section */}
      <div className="mb-8 space-y-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {agent ? "Listing Representative" : "Property Owner"}
        </h3>
        <div
          onClick={handleProfileClick}
          className="flex items-center gap-4 cursor-pointer group/author"
        >
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-primary/10 shadow-sm transition-transform group-hover/author:scale-105">
              <AvatarImage src={contactPerson.avatar} alt={contactPerson.name} />
              <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold uppercase">
                <UserIcon className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            {agent && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full shadow-lg border-2 border-white">
                <ShieldCheck className="h-3 w-3" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900 group-hover/author:text-primary transition-colors text-lg truncate">
              {contactPerson.name}
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-tighter">
              {agent ? (contactPerson.company || "Certified Agent") : "Verified Owner"}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-3.5">
        {listingType === "rent" && (
          <Button
            size="lg"
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-lg rounded-xl shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 mb-4"
            onClick={handleRentNow}
            disabled={isBookingLoading}
          >
            {isBookingLoading ? "Processing..." : "Rent This Home Now"}
          </Button>
        )}
        <Button
          size="lg"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
          onClick={() => {
            checkAuth(() => {
              router.push(`/dashboard/messages?partner=${contactPerson.id}&property=${propertyId}`);
            });
          }}
        >
          <MessageSquare className="mr-2.5 h-5 w-5" />
          Message {agent ? "Agent" : "Owner"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full h-12 border-2 border-gray-100 hover:border-primary/20 hover:bg-primary/5 text-gray-900 font-bold rounded-xl transition-all"
          onClick={() => contactPerson.phone ? toast.info(`Phone: ${contactPerson.phone}`) : toast.info("Requesting phone number...")}
        >
          <Phone className="mr-2.5 h-5 w-5 text-primary/70" />
          {contactPerson.phone || "Call Now"}
        </Button>

        {/* Secondary Actions */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          {listingType === "rent" ? (
            <Button
              variant="outline"
              className="w-full h-11 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border-cyan-200 hover:text-white hover:from-cyan-600 hover:to-blue-600 hover:border-transparent transition-all font-semibold shadow-sm"
              onClick={() => toast.info("Schedule Visit form coming soon")}
            >
              Schedule a Visit
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full h-11 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border-cyan-200 hover:text-white hover:from-cyan-600 hover:to-blue-600 hover:border-transparent transition-all font-semibold shadow-sm"
              onClick={() => setIsOfferModalOpen(true)}
            >
              Make an Offer
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full h-11 border border-dashed border-gray-200 text-gray-500 hover:text-cyan-600 hover:border-cyan-200 hover:bg-cyan-50 transition-all font-medium text-xs uppercase tracking-wider"
            onClick={() => toast.info("Feature coming soon")}
          >
            {listingType === "rent" ? "Ask a Question" : "Inquiry Info"}
          </Button>
        </div>

        <div className="space-y-3.5 mt-4">
          {/* Share Button (moved down) */}
          <Button
            variant="ghost"
            size="lg"
            className="w-full h-12 text-gray-500 font-semibold hover:text-primary transition-colors flex items-center justify-center gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Share Property
          </Button>
        </div>
      </div>
      <MakeOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        propertyId={propertyId || ""}
        propertyTitle={propertyTitle || "Property"}
        price={price}
        currency={currency}
      />
      <PhoneVerification
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={handleRentNow}
      />
    </Card >
  );
}