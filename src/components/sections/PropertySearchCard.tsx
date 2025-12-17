"use client";

import { ArrowRight, MapPin, Search, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

const popularLocations = ['Gulshan', 'Banani', 'Uttara', 'Dhanmondi', 'Bashundhara', 'Mirpur'];

export default function PropertySearchCard() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [searchQuery, setSearchQuery] = useState("");

  // Handle form submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    params.set("lt", listingType);
    router.push(`/properties?${params.toString()}`);
  };

  // Handle popular location click
  const handleLocationClick = (location: string) => {
    const params = new URLSearchParams();
    params.set("q", location);
    params.set("lt", listingType);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Clean White Card with Subtle Effects */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
        
        {/* Perfect Gradient Border - Thicker and More Visible */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-t-2xl"></div>
        
        {/* Content */}
        <div className="space-y-6 md:space-y-8">
          
          {/* Header - Clean and Professional */}
          <div className="text-center space-y-3">
            {/* Improved Search Icon with Gradient Border */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl mb-3 relative group">
              {/* Gradient Border Ring */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              {/* Icon Container */}
              <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                <Search className="h-6 w-6 text-white" />
              </div>
              
              {/* Decorative Dots */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full"></div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Find Your Perfect Property
            </h2>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
              Search through thousands of verified properties across Bangladesh&apos;s most trusted real estate platform
            </p>
          </div>

          {/* Search Form - Industrial Clean */}
          <form onSubmit={handleSearch} className="space-y-6">
            
            {/* Location Input */}
            <div className="relative group">
              {/* Improved MapPin Icon */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-cyan-600 transition-colors group-focus-within:text-blue-600" />
                </div>
              </div>
              
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter location, city, project name, or landmark..."
                className="pl-16 pr-4 py-7 text-base bg-gray-50 border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl transition-all duration-200 text-gray-900 placeholder:text-gray-400"
              />
              
              {/* Decorative Corner */}
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-300 rounded-tr-lg opacity-50"></div>
            </div>

            {/* Property Type Toggle - Clean Industrial */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to:
              </label>
              <div className="bg-gray-50 rounded-xl p-1.5">
                <ToggleGroup
                  type="single"
                  value={listingType}
                  onValueChange={(v) => v && setListingType(v as "sale" | "rent")}
                  className="grid grid-cols-2 gap-2"
                >
                  <ToggleGroupItem
                    value="sale"
                    className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-cyan-500 data-[state=on]:to-blue-500 data-[state=on]:text-white data-[state=on]:shadow-md py-4 text-base font-semibold rounded-lg transition-all duration-200 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 data-[state=on]:border-transparent"
                  >
                    Buy Property
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="rent"
                    className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-cyan-500 data-[state=on]:to-blue-500 data-[state=on]:text-white data-[state=on]:shadow-md py-4 text-base font-semibold rounded-lg transition-all duration-200 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 data-[state=on]:border-transparent"
                  >
                    Rent Property
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 rounded-xl group"
            >
              <Search className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
              Search Properties
              <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          {/* Popular Locations - Small Tag Style */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-cyan-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Popular Areas in Bangladesh:
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {popularLocations.map((location) => (
                <button
                  key={location}
                  type="button"
                  onClick={() => handleLocationClick(location)}
                  className="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:border-cyan-400 hover:text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200 text-xs font-medium hover:scale-[1.03] hover:shadow-sm"
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements - Industrial Style */}
        <div className="absolute top-4 right-4 w-16 h-16 opacity-5">
          <div className="absolute inset-0 border-2 border-gray-400 rounded-lg transform rotate-45"></div>
        </div>
        <div className="absolute bottom-4 left-4 w-12 h-12 opacity-5">
          <div className="absolute inset-0 border border-gray-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}