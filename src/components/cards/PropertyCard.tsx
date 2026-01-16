import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuthState } from "@/hooks/useAuthState";
import { useMyToursQuery } from "@/hooks/useMyToursQuery";
import { propertiesApi } from "@/lib/api/properties-api";
import { cn } from "@/lib/utils";
import { formatBDT } from "@/lib/utils/currencyHelper";
import { addToCompare, removeFromCompare } from "@/redux/features/property/compareSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { PropertyResponse, isRentalResponse } from "@/types/property.types";
import {
  Calendar,
  Eye,
  Flag,
  GitCompare,
  Heart,
  Info,
  Loader2,
  MapPin,
  Share2,
  ShieldCheck,
  User as UserIcon
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { QuickViewModal } from "../property/QuickViewModal";
import { PropertyBadge } from "./PropertyBadge";
import {
  CommercialDetails,
  LandDetails,
  ResidentialDetails,
} from "./PropertyDetails";

import { RequestInfoModal } from "../modals/RequestInfoModal";
import { ScheduleVisitModal } from "../modals/ScheduleVisitModal";

interface PropertyCardProps {
  property: PropertyResponse;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { user } = useAuthState();
  const { checkAuth } = useAuthGuard();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: compareItems } = useAppSelector((state) => state.compare);
  const { hasPendingTour } = useMyToursQuery();

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
    owner,
    agent,
    savedBy = []
  } = property;

  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isScheduleVisitOpen, setIsScheduleVisitOpen] = useState(false);
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);

  const isInCompare = compareItems.some((item) => item.id === id);

  useEffect(() => {
    if (user && savedBy.includes(user.id)) {
      setIsFavorited(true);
    }
  }, [user, savedBy]);

  const author = agent || owner;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    checkAuth(async () => {
      setLoading(true);
      try {
        const response = await propertiesApi.toggleFavorite(id);
        setIsFavorited(response.favorited);
        toast.success(response.favorited ? "Added to favorites" : "Removed from favorites");
      } catch (error: unknown) {
        console.error("Favorite toggle error:", error);
        toast.error("Failed to update favorites");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCompare) {
      dispatch(removeFromCompare(id));
      toast.success("Removed from comparison");
    } else {
      if (compareItems.length >= 3) {
        toast.error("You can only compare up to 3 properties");
        return;
      }


      if (compareItems.length > 0) {
        const currentType = compareItems[0].listingType;
        if (property.listingType !== currentType) {
          toast.error(`You can only compare ${currentType} properties together`);
          return;
        }
      }

      dispatch(addToCompare(property));
      toast.success("Added to comparison");
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!author?.id) {
      console.warn('Author ID is missing', author);
      return;
    }

    checkAuth(() => {

      const profileIdentifier = author.slug || author.username || author.id;
      router.push(`/profile/${profileIdentifier}`);
    });
  };

  const handleReport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    checkAuth(() => {
      toast.info("Report system under maintenance");
    });
  };

  const [imgSrc, setImgSrc] = useState(() => {
    return images && images.length > 0 ? images[0] : "/placeholder-property.jpg";
  });

  useEffect(() => {
    setImgSrc(images && images.length > 0 ? images[0] : "/placeholder-property.jpg");
  }, [images]);

  const getPriceLabel = () => {
    if (isRentalResponse(property)) {
      const price = property.pricePerMonth;
      if (!price || price === 0) return `৳ 00 /mo`;
      return `${formatBDT(price)} /mo`;
    }

    if ('totalPrice' in property) {
      const price = property.totalPrice;
      if (!price || price === 0) return `৳ 00`;
      return `${formatBDT(price)}`;
    }
    return "Price on Request";
  };

  const priceLabel = getPriceLabel();

  const getThemeColor = () => {
    if (["land"].includes(propertyType)) return "border-emerald-400";
    if (["commercial", "office", "shop", "warehouse"].includes(propertyType))
      return "border-amber-400";
    return "border-primary/40";
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

  return (
    <>
      <div
        onClick={() => router.push(`/properties/${property.slug || id}`)}
        className="group block cursor-pointer"
      >
        <Card
          className={cn(
            "relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-xl hover:-translate-y-1",
            "border-b-[5px] pt-0 gap-0 pb-2",
            getThemeColor()
          )}
        >
          { }
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-gray-50">
            <Image
              src={imgSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgSrc("/placeholder-property.jpg")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

            { }
            <div className="absolute left-3 top-3 z-10">
              <PropertyBadge
                listingType={listingType}
                isNew={isNew}
                featured={featured}
              />
            </div>

            { }
            <div className="absolute right-3 top-3 z-30 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm border border-black/5 shadow-sm transition-all hover:scale-105 active:scale-95 hover:bg-blue-50 hover:text-blue-500"
                      onClick={handleQuickView}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Quick View</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {(!user || user.role === 'tenant') && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className={cn(
                          "h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm border border-black/5 shadow-sm transition-all hover:scale-105 active:scale-95",
                          isInCompare ? "text-emerald-500 bg-emerald-50 hover:bg-emerald-100" : "hover:bg-emerald-50 hover:text-emerald-500"
                        )}
                        onClick={handleToggleCompare}
                      >
                        <GitCompare className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{isInCompare ? "Remove from Compare" : "Add to Compare"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {(!user || user.role === 'tenant') && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className={cn(
                          "h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm border border-black/5 shadow-sm transition-all hover:scale-105 active:scale-95",
                          isFavorited && "text-red-500 bg-red-50 hover:bg-red-100"
                        )}
                        onClick={handleToggleFavorite}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Heart
                            className={cn(
                              "h-3.5 w-3.5",
                              isFavorited && "fill-current"
                            )}
                          />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>
                        {isFavorited
                          ? "Remove from Favorites"
                          : "Save to Favorites"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {(!user || user.role === 'tenant') && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-white/95 backdrop-blur-sm border border-black/5 shadow-sm transition-all hover:scale-105 active:scale-95 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReport(e);
                        }}
                      >
                        <Flag className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Report Property</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            { }
            <div className="absolute bottom-3 left-3 z-10">
              <div className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/20">
                <h4 className="text-lg font-bold text-white leading-tight">
                  {priceLabel}
                </h4>
              </div>
            </div>
          </div>

          { }
          <div className="p-4 space-y-3.5">
            <div className="flex items-start justify-between gap-2 h-11">
              <h3 className="line-clamp-2 text-[15px] md:text-[17px] lg:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug">
                {title}
              </h3>
              {isVerified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <ShieldCheck
                        className="h-5 w-5 text-green-600 shrink-0 mt-0.5"
                        aria-label="Verified"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Verified Property</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            { }
            <div className="pt-1 flex flex-col gap-3">
              { }
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleAuthorClick}
                  className="flex items-center gap-2 group/author hover:opacity-80 transition-opacity min-w-0"
                >
                  <Avatar className="h-6 w-6 border border-gray-100 shrink-0">
                    <AvatarImage src={author.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256"} />
                    <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                      <UserIcon className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start leading-tight min-w-0">
                    <span className="text-[11px] font-semibold text-gray-900 group-hover/author:text-primary transition-colors truncate w-full">{author.name}</span>
                  </div>
                </button>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium min-w-0">
                  <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                  <span className="truncate">
                    {neighborhood}, {city}
                  </span>
                </div>
              </div>
              <div className="py-2.5 border-y border-gray-100/80 dark:border-gray-800/50">
                {renderDetails()}
              </div>
              <div
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                {(!user || user.role === 'tenant') && (
                  listingType === "rent" ? (
                    <Button
                      className={cn(
                        "flex-1 text-[11px] h-9 bg-primary/10 hover:bg-primary text-primary hover:text-white border-none shadow-none font-semibold transition-all duration-300",
                        hasPendingTour(id) && "opacity-100 cursor-pointer bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                      )}
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasPendingTour(id)) {
                          router.push('/dashboard/my-tours');
                          return;
                        }
                        checkAuth(() => {
                          setIsScheduleVisitOpen(true);
                        });
                      }}
                    >
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {hasPendingTour(id) ? "Visit Requested" : "Schedule Visit"}
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 text-[11px] h-9 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border-none shadow-none font-semibold transition-all duration-300"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        checkAuth(() => {
                          setIsRequestInfoOpen(true);
                        });
                      }}
                    >
                      <Info className="h-3.5 w-3.5 mr-1.5" />
                      Request Info
                    </Button>
                  )
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                  title="Share Property"
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: property.title,
                          text: property.description,
                          url: `${window.location.origin}/properties/${property.slug || id}`,
                        });
                      } catch (err) {
                        console.error("Error sharing:", err);
                      }
                    } else {
                      navigator.clipboard.writeText(`${window.location.origin}/properties/${property.slug || id}`);
                      toast.success("Link copied to clipboard!");
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <QuickViewModal
        property={property}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
      <ScheduleVisitModal
        propertyId={id}
        propertyTitle={title}
        isOpen={isScheduleVisitOpen}
        onClose={() => setIsScheduleVisitOpen(false)}
      />
      <RequestInfoModal
        propertyId={id}
        propertyTitle={title}
        isOpen={isRequestInfoOpen}
        onClose={() => setIsRequestInfoOpen(false)}
      />
    </>
  );
}