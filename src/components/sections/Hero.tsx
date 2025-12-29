"use client";

import { Heart, Shield, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import PropertySearchCard from "./PropertySearchCard";

const heroImages = [
  {
    src: "/hero/1.jpg",
    title: "Best Apartments",
    subtitle: "Premium apartments in Dhaka city"
  },
  {
    src: "/hero/2.jpg",
    title: "Quality Homes",
    subtitle: "New houses with modern design"
  },
  {
    src: "/hero/3.jpg",
    title: "Comfort Flats",
    subtitle: "Flats in good Dhaka locations"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      {}
      <div className="absolute inset-0 -z-10">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
          >
            <Image
              src={image.src}
              alt={image.title}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
              quality={100}
            />
            {}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          </div>
        ))}
      </div>

      {}
      <div className="absolute top-1/4 left-10 w-3 h-3 bg-cyan-400 rounded-full opacity-60 animate-pulse" />
      <div className="absolute bottom-1/3 right-16 w-4 h-4 bg-blue-400 rounded-full opacity-40 animate-bounce" />
      <div className="absolute top-1/2 left-20 w-2 h-2 bg-white rounded-full opacity-30 animate-ping" />

      {}
      <div className="relative z-10 flex items-center py-12 md:py-20 lg:py-28">
        <div className="container mx-auto px-4 w-full">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {}
            <div className="lg:col-span-7 text-white space-y-6 md:space-y-8">
              {}
              <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-2xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm sm:text-base font-semibold">Trusted by 10,000+ Clients</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-current" />
                  ))}
                  <span className="text-sm sm:text-base font-semibold ml-1 sm:ml-2">4.9/5</span>
                </div>
              </div>

              {}
              <div className="space-y-4 md:space-y-6">
                <div className="overflow-hidden">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black leading-none transform transition-all duration-700">
                    <div className="block text-white">Discover</div>
                    <div className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent py-1 md:py-2">
                      {heroImages[currentSlide].title}
                    </div>
                  </h1>
                </div>

                <div className="overflow-hidden">
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/95 leading-relaxed font-light max-w-2xl transform transition-all duration-700">
                    {heroImages[currentSlide].subtitle}
                  </p>
                </div>
              </div>

              {}
              <div className="flex flex-wrap gap-4 md:gap-6 lg:gap-8 pt-2 md:pt-4">
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400">1,000+</div>
                  <div className="text-white/90 text-sm sm:text-base md:text-lg font-medium">Premium Properties</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400">25+</div>
                  <div className="text-white/90 text-sm sm:text-base md:text-lg font-medium">Cities in Bangladesh</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400">24/7</div>
                  <div className="text-white/90 text-sm sm:text-base md:text-lg font-medium">Expert Support</div>
                </div>
              </div>

              {}
              <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-6 pt-2 md:pt-4">
                <div className="flex items-center gap-2 md:gap-3 text-white/95 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-2 md:py-3 rounded-xl">
                  <Shield className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                  <span className="text-sm md:text-base lg:text-lg font-medium">Verified Properties</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-white/95 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-2 md:py-3 rounded-xl">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                  <span className="text-sm md:text-base lg:text-lg font-medium">Best Price Guarantee</span>
                </div>
              </div>
            </div>

            {}
            <div className="lg:col-span-5 w-full">
              <PropertySearchCard />
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
              ? "bg-white w-8"
              : "bg-white/50 hover:bg-white/80"
              }`}
          />
        ))}
      </div>

      {}
      <div className="absolute bottom-16 right-8 z-20">
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-3 rounded-full backdrop-blur-md border border-white/30 transition-all duration-300 cursor-pointer ${isLiked
              ? 'bg-red-500/20 text-red-400 border-red-400/30'
              : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${isLiked ? 'fill-current scale-110' : ''
                }`}
            />
          </button>

          {}
          <div className="flex flex-col gap-2 items-center text-white/80 pt-3">
            <span className="text-sm mb-3 font-medium tracking-wider rotate-90 origin-center whitespace-nowrap">
              SCROLL
            </span>
            <div className="w-px h-20 bg-white/30 rounded-full overflow-hidden">
              <div className="w-full h-8 bg-white animate-bounce rounded-full" />
            </div>
            <span className="text-xs mt-2 font-light tracking-widest">EXPLORE</span>
          </div>
        </div>
      </div>
    </section>
  );
}