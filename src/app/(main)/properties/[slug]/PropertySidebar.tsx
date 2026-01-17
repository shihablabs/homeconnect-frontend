import { MaintenanceRequestForm } from "@/components/maintenance/MaintenanceRequestForm";
import { MakeOfferModal } from "@/components/modals/MakeOfferModal";
import { RequestInfoModal } from "@/components/modals/RequestInfoModal";
import { ScheduleVisitModal } from "@/components/modals/ScheduleVisitModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useMyToursQuery } from "@/hooks/useMyToursQuery";
import { bookingsApi } from "@/lib/api/bookings-api";
import { stripePromise } from "@/lib/stripe";
import { cn } from "@/lib/utils";
import { useGetMyInquiriesQuery } from "@/redux/features/inquiry/inquiryApiSlice";
import { RootState } from "@/redux/store";
import { OwnerAgentResponse } from "@/types/property.types";
import { MessageSquare, Share2, ShieldCheck, User as UserIcon, Wrench } from "lucide-react";
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
  const [isScheduleVisitOpen, setIsScheduleVisitOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const { hasPendingTour } = useMyToursQuery();

  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  // Check if user has already inquired about this property
  const { data: myInquiries } = useGetMyInquiriesQuery(undefined, {
    skip: !user
  });

  const hasInquired = myInquiries?.some(
    (inquiry: any) =>
      (inquiry.property?._id === propertyId) ||
      (inquiry.property?.id === propertyId)
  );

  const handleRentNow = async () => {
    checkAuth(async () => {
      if (!user) return;

      if (!user.isPhoneVerified) {
        toast.error("Please verify your phone number to proceed.");
        return;
      }

      setIsBookingLoading(true);
      try {
        const checkIn = new Date();
        const checkOut = new Date();
        checkOut.setFullYear(checkOut.getFullYear() + 1);

        const booking = await bookingsApi.createBooking({
          propertyId: propertyId!,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          leaseDurationInMonths: 12,
        });


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
      { }
      <div className="mb-8">
        <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-1 block">
          {listingType === "rent" ? "Monthly Rent" : "Asking Price"}
        </span>
        <div className="text-4xl font-black text-gray-900 tracking-tight leading-none">
          {getPriceLabel()}
        </div>
      </div>

      <Separator className="mb-8 bg-gray-100" />

      { }
      <div className="mb-8 space-y-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {agent ? "Listing Representative" : "Property Owner"}
        </h3>
        <div
          onClick={() => {
            checkAuth(() => {

              const profileIdentifier = contactPerson.username || contactPerson.slug || contactPerson.id;
              router.push(`/profile/${profileIdentifier}`);
            });
          }}
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

      { }
      <div className="space-y-3.5">
        {(!user || user.role === 'tenant') && (
          <>
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
            {/* Replaced Chat with Email Inquiry */}
            <Button
              size="lg"
              disabled={hasInquired}
              className={cn(
                "w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 mb-4",
                hasInquired && "opacity-70 cursor-not-allowed bg-gray-400 hover:bg-gray-400 shadow-none hover:scale-100"
              )}
              onClick={() => {
                if (hasInquired) return;
                checkAuth(() => setIsRequestInfoOpen(true));
              }}
            >
              <MessageSquare className="mr-2.5 h-5 w-5" />
              {hasInquired ? "Request Sent" : "Send Email Inquiry"}
            </Button>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-11 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 border-cyan-200 hover:text-white hover:from-cyan-600 hover:to-blue-600 hover:border-transparent transition-all font-semibold shadow-sm",
                    propertyId && hasPendingTour(propertyId) && "opacity-100 cursor-pointer bg-emerald-50 text-emerald-700 border-emerald-200 from-emerald-50 to-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 hover:border-emerald-300 hover:from-emerald-100 hover:to-emerald-100 shadow-none"
                  )}
                  onClick={() => {
                    if (propertyId && hasPendingTour(propertyId)) {
                      router.push('/dashboard/my-tours');
                      return;
                    }
                    checkAuth(() => setIsScheduleVisitOpen(true));
                  }}
                >
                  {propertyId && hasPendingTour(propertyId) ? "Visit Requested" : "Schedule visit"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 bg-gray-50 text-gray-700 border-gray-200 hover:bg-primary hover:text-white hover:border-transparent transition-all font-semibold"
                  onClick={() => checkAuth(() => setIsMaintenanceModalOpen(true))}
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  Report
                </Button>
              </div>

              {listingType === "sale" && (
                <Button
                  variant="outline"
                  className="w-full h-11 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-200 hover:text-white hover:from-purple-600 hover:to-indigo-600 hover:border-transparent transition-all font-semibold shadow-sm"
                  onClick={() => {
                    checkAuth(() => setIsOfferModalOpen(true));
                  }}
                >
                  Make an Offer
                </Button>
              )}
            </div>
          </>
        )}

        <div className="space-y-3.5 mt-4">
          { }
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

      {propertyId && (
        <ScheduleVisitModal
          propertyId={propertyId}
          propertyTitle={propertyTitle || "Property"}
          isOpen={isScheduleVisitOpen}
          onClose={() => setIsScheduleVisitOpen(false)}
        />
      )}
      {propertyId && (
        <RequestInfoModal
          propertyId={propertyId}
          propertyTitle={propertyTitle || "Property"}
          isOpen={isRequestInfoOpen}
          onClose={() => setIsRequestInfoOpen(false)}
        />
      )}

      {propertyId && (
        <Dialog open={isMaintenanceModalOpen} onOpenChange={setIsMaintenanceModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Maintenance</DialogTitle>
            </DialogHeader>
            <MaintenanceRequestForm
              propertyId={propertyId}
              onSuccess={() => setIsMaintenanceModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card >
  );
}