'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetUserFavoritePropertiesQuery,
  useToggleFavoriteMutation
} from '@/redux/features/property/propertyApiSlice';
import { PropertyResponse } from '@/types/property.types';
import { Eye, Heart, Home, MapPin, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function FavoritesClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data, isLoading, isFetching, error } = useGetUserFavoritePropertiesQuery(
    {
      page: 1,
      limit: 100,
      // Removed type filter from API to handle it reliably on client side for favorites
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [toggleFavorite] = useToggleFavoriteMutation();

  const favorites = data?.properties || [];
  const loading = isLoading || isFetching;

  useEffect(() => {
    if (error) {
      const errorMessage = error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
        ? (error.data as { message?: string }).message
        : undefined;
      toast.error(errorMessage || 'Failed to fetch favorites');
    }
  }, [error]);

  const handleUnlike = async (propertyId: string) => {
    try {
      const result = await toggleFavorite(propertyId).unwrap();
      if (result.data.favorited) {
        toast.success('Added to favorites');
      } else {
        toast.success('Removed from favorites');
      }
      // RTK Query automatically refetches if tags are invalidated correctly
    } catch (error: unknown) {
      const errorMessage =
        error &&
          typeof error === 'object' &&
          'data' in error &&
          error.data &&
          typeof error.data === 'object' &&
          'message' in error.data
          ? (error.data as { message?: string }).message
          : undefined;
      toast.error(errorMessage || 'Failed to update favorites');
    }
  };

  const filteredFavorites = favorites.filter((property: PropertyResponse) => {
    // Client-side filtering for immediate and reliable results
    const matchesType = typeFilter === 'all' || property.listingType === typeFilter;
    const matchesSearch =
      !searchQuery ||
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  if (loading && favorites.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">Loading favorites...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              My Favorites
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your saved properties and collections
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by location or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px] bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredFavorites.length === 0 ? (
          <Card className="border-dashed border-2 bg-gray-50/50">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">No favorites found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  {searchQuery || typeFilter !== 'all'
                    ? 'No properties match your search criteria. Try adjusting your filters.'
                    : 'Start exploring our listings and save properties you love to see them here.'}
                </p>
                {!searchQuery && typeFilter === 'all' && (
                  <Link href="/properties">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md transition-all hover:shadow-lg">
                      <Search className="mr-2 h-4 w-4" />
                      Browse Properties
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredFavorites.map((property: any) => (
              <Card
                key={property.id}
                className="group relative overflow-hidden rounded-2xl bg-white border-0 shadow-sm hover:shadow-2xl transition-all duration-300 ring-1 ring-gray-100 p-0"
              >
                {/* Image Section */}
                <div className="relative h-[240px] w-full overflow-hidden">
                  <Link href={`/properties/${property.id}`}>
                    <Image
                      src={
                        property.images && property.images.length > 0
                          ? property.images[0]
                          : '/placeholder-property.jpg'
                      }
                      alt={property.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </Link>

                  {/* Overlay Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge
                      className={`${property.listingType === 'rent'
                        ? 'bg-blue-500/90 text-white'
                        : 'bg-emerald-500/90 text-white'
                        } backdrop-blur-md border-0 px-3 py-1 uppercase tracking-wider text-[10px] font-bold shadow-sm`}
                    >
                      {property.listingType}
                    </Badge>
                    {property.featured && (
                      <Badge className="bg-amber-500/90 text-white backdrop-blur-md border-0 px-3 py-1 uppercase tracking-wider text-[10px] font-bold shadow-sm">
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      handleUnlike(property.id);
                    }}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white text-rose-500 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>

                  {/* Price Overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="inline-flex items-baseline px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md shadow-lg">
                      <span className="text-lg font-bold text-gray-900">
                        ৳{property.listingType === 'rent'
                          ? (property.pricePerMonth || 0).toLocaleString()
                          : (property.totalPrice || 0).toLocaleString()}
                      </span>
                      {property.listingType === 'rent' && (
                        <span className="text-xs text-gray-500 font-medium ml-1">/mo</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-5">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wide">
                        {property.propertyType}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Eye className="h-3 w-3 mr-1" />
                        {property.views || 0} views
                      </div>
                    </div>
                    <Link href={`/properties/${property.id}`} className="block group-hover:text-blue-600 transition-colors">
                      <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1" title={property.title}>
                        {property.title}
                      </h3>
                    </Link>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-gray-400" />
                      <span className="line-clamp-1 text-xs">
                        {property.address}, {property.city}
                      </span>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-100">
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 group-hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center text-gray-700 font-semibold mb-0.5">
                        <Home className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                        <span className="text-sm">{property.bedrooms}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase font-medium">Beds</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 group-hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center text-gray-700 font-semibold mb-0.5">
                        <div className="h-3.5 w-3.5 mr-1.5 text-blue-500 grid place-items-center font-serif italic text-xs">🛁</div>
                        <span className="text-sm">{property.bathrooms}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase font-medium">Baths</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 group-hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center text-gray-700 font-semibold mb-0.5">
                        <div className="h-3.5 w-3.5 mr-1.5 text-blue-500 grid place-items-center text-xs">📐</div>
                        <span className="text-sm">{property.areaSize}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase font-medium">{property.areaUnit}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 mt-1">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${property.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                      property.status === 'Sold' ? 'bg-red-100 text-red-700' :
                        property.status === 'Rented' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {property.status}
                    </span>
                    <Link href={`/properties/${property.id}`} className="w-full ml-3">
                      <Button variant="default" size="sm" className="w-full bg-gray-900 hover:bg-black text-white h-8 text-xs shadow-none">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


