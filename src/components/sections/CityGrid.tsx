/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useGetContentQuery } from "@/redux/features/content/contentApi";
import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const fallbackCities = [
  { name: "Downtown", image: "/cities/1.jpg", properties: 124, q: "downtown" },
  { name: "University District", image: "/cities/2.jpg", properties: 89, q: "university-district" },
  { name: "Waterfront", image: "/cities/3.jpg", properties: 67, q: "waterfront" },
  { name: "Historic Quarter", image: "/cities/4.jpg", properties: 156, q: "historic-quarter" },
  { name: "Business Center", image: "/cities/5.jpg", properties: 203, q: "business-center" },
  { name: "Parkside", image: "/cities/6.jpg", properties: 78, q: "parkside" },
  { name: "Hillside", image: "/cities/7.jpg", properties: 92, q: "hillside" },
  { name: "Riverside", image: "/cities/8.jpg", properties: 115, q: "riverside" },
];

interface City {
  name: string;
  image: string;
  properties: string | number;
  q: string;
}

export default function CityGrid() {
  const { data: contentData, isLoading } = useGetContentQuery("home-prime-locations");
  const sectionData = contentData?.data;

  // Use dynamic items if available, otherwise fallback, or merge to ensure 8 items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dynamicCities = sectionData?.items?.map((item: any) => ({
    name: item.label,
    image: item.image,
    properties: item.description?.replace(/[^0-9]/g, "") || Math.floor(Math.random() * 100 + 50).toString(),
    q: item.value,
  })) || [];

  // Ensure we have at least 8 items by filling with fallbacks
  const cities: City[] = [...dynamicCities];
  if (cities.length < 8) {
    const needed = 8 - cities.length;
    // Filter out cities that are already present by loose name match
    const existingNames = new Set(cities.map(c => c.name.toLowerCase()));
    const availableFallbacks = fallbackCities.filter(c => !existingNames.has(c.name.toLowerCase()));

    cities.push(...availableFallbacks.slice(0, needed));
  }

  const title = sectionData?.title || "Discover Prime Locations";
  const subtitle = sectionData?.subtitle || "Explore our carefully curated selection of premium neighborhoods and find your perfect community.";

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50/80">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 rounded-full text-cyan-600 text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" />
            Why Choose HomeConnect
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title.split("Prime Locations")[0]}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {title.includes("Prime Locations") ? "Prime Locations" : title.split(" ").slice(-2).join(" ")}
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city, index) => (
            <Link
              key={city.q}
              href={`/properties?q=${encodeURIComponent(city.q)}`}
              className="group relative block overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
            >
              {/* Image Container */}
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={city.image || "/cities/1.jpg"} // Fallback image if CMS missing
                  alt={city.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Property Count Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-semibold text-gray-900">{city.properties}+</span>
                  <span className="text-xs text-gray-600 ml-1">properties</span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2 transition-transform duration-300 group-hover:translate-y-[-2px]">
                    {city.name}
                  </h3>

                  {/* CTA Arrow */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-sm font-medium">Explore Area</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Hover Effect Layer */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Border Glow Effect */}
              <div className="absolute inset-0 rounded-2xl border border-gray-200/50 group-hover:border-blue-300/50 transition-colors duration-500" />
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            href="/properties"
            className="flex items-center justify-center gap-2 max-w-80 mx-auto w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] group"
          >
            <span>View All Locations</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </section>
  );
}