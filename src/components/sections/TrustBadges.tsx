"use client";

import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Headphones, Lock, ShieldCheck, Sparkles } from "lucide-react";

type TrustBadgeItem = {
  label: string;
  description?: string;
  icon: LucideIcon;
};

type TrustBadgesProps = {
  className?: string;
  align?: "left" | "center";
  items?: TrustBadgeItem[];
};

const DEFAULT_ITEMS: TrustBadgeItem[] = [
  {
    label: "Verified Listings",
    description: "Manual and automated checks before going live.",
    icon: ShieldCheck,
  },
  {
    label: "Secure Payments",
    description: "Encrypted transactions via trusted processors.",
    icon: Lock,
  },
  {
    label: "24/7 Support",
    description: "Emergency help for tenants around the clock.",
    icon: Headphones,
  },
  {
    label: "Trusted Landlords",
    description: "Onboarded owners with identity verification.",
    icon: BadgeCheck,
  },
];

export default function TrustBadges({
  className,
  align = "center",
  items = DEFAULT_ITEMS,
}: TrustBadgesProps) {
  const alignment =
    align === "left" ? "justify-start md:justify-between" : "justify-center";

  return (
    <section
      aria-labelledby="trust-badges-title"
      className={`py-12 md:py-16 ${className ?? ""}`}
    >
      <h2 id="trust-badges-title" className="sr-only">
        Trust badges
      </h2>
      <div className="container mx-auto max-w-6xl px-4">
        {}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 rounded-full text-cyan-600 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Why Choose HomeConnect
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Built on <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Trust & Security</span>
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your safety and satisfaction are our top priorities. We have built every feature with security and reliability in mind.
          </p>
        </div>

        {}
        <div className="relative">
          {}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5 rounded-3xl blur-xl" />

          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg shadow-blue-500/5 p-8">
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${alignment}`}>
              {items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="group relative flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-500 hover:bg-white hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-200/50 border border-transparent"
                  >
                    {}
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                      <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-500 group-hover:scale-110">
                        <Icon className="w-7 h-7" />
                      </div>
                    </div>

                    {}
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-cyan-700 transition-colors duration-300">
                      {item.label}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>

                    {}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 group-hover:w-12 transition-all duration-500" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Trusted by 5,000+ users</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>4.9/5 customer rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}