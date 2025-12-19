"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Home,
  ShieldCheck,
  Star,
  Users,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function LandlordCTA() {
  return (
    <section aria-labelledby="join-homeconnect-title" className="py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div
          className="
            relative overflow-hidden rounded-2xl border
            bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600
            text-white shadow-lg ring-1 ring-white/10
          "
        >
          {/* Decorative glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl"
          />

          <div className="relative grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide">
                Join our community
                <span className="h-1 w-1 rounded-full bg-white/70" />
                Start your journey
              </div>

              <h3
                id="join-homeconnect-title"
                className="mt-4 text-3xl font-bold leading-tight sm:text-4xl"
              >
                Manage your properties with ease. We&apos;ll handle the marketing,
                screenings, and payments so you don&apos;t have to.
              </h3>
              Whether you&apos;re buying, selling, renting, or letting - HomeConnect makes real estate simple, transparent, and secure for everyone.

              {/* Feature bullets */}
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Feature icon={Home} label="Vast Property Selection" />
                <Feature icon={ShieldCheck} label="Verified Listings" />
                <Feature icon={Zap} label="Instant Connections" />
                <Feature icon={BadgeCheck} label="Secure Transactions" />
              </ul>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="
                    bg-white text-black hover:bg-white/90
                    transition-transform duration-200 hover:-translate-y-0.5
                  "
                >
                  <Link href="/register" aria-label="Sign up for HomeConnect">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-white/10 text-white hover:bg-white/15 border-white/20"
                >
                  <Link href="/properties" aria-label="Browse properties">
                    Browse Homes
                  </Link>
                </Button>
              </div>

              <p className="mt-3 text-xs text-white/80">
                Join thousands of happy homeowners and tenants today.
              </p>

              {/* Social proof */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/85">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4" aria-hidden="true" />
                  4.9/5 user rating
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <LogoIcon className="h-4 w-4 text-white" />
                  Trusted platform
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  10k+ active users
                </span>
              </div>
            </div>

            {/* Right: Preview card */}
            <div className="relative">
              {/* Just a symbolic UI element representing connection */}
              <div className="grid gap-4">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 transform md:rotate-2 hover:rotate-0 transition-all duration-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xl font-bold">🎉</div>
                    <div>
                      <div className="font-bold">Dream Home Found!</div>
                      <div className="text-xs text-white/70">Just now in Dhaka</div>
                    </div>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-green-400 animate-pulse"></div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 transform md:-rotate-2 hover:rotate-0 transition-all duration-500 md:ml-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-xl font-bold">🏠</div>
                    <div>
                      <div className="font-bold">New Property Listed</div>
                      <div className="text-xs text-white/70">2 mins ago • Banani</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-2 w-16 bg-white/20 rounded-full"></div>
                    <div className="h-2 w-8 bg-white/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <li
      className="
        group flex items-center gap-3 rounded-xl border border-white/15
        bg-white/5 px-3 py-2
        transition-colors duration-200 hover:bg-white/10
      "
    >
      <span
        className="
          inline-flex h-9 w-9 items-center justify-center rounded-full
          bg-white/15 text-white ring-1 ring-white/20
          transition-transform duration-200 group-hover:scale-105
        "
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-sm">{label}</span>
    </li>
  );
}

// Simple icons for local usage if needed
function BadgeCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function LogoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4 8 4v14" />
      <path d="M9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
    </svg>
  )
}