"use client";

import { pacifico } from '@/lib/fonts';
import Link from 'next/link';

export const AuthRegistrationBrand = () => (
  <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
    {}
    <div className="absolute inset-0 bg-black/10"></div>

    {}
    <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
    <div className="absolute bottom-20 right-16 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
    <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/5 rounded-full blur-md"></div>

    {}
    <div className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: `linear-gradient(#fff 1px, transparent 1px),
                            linear-gradient(90deg, #fff 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}>
    </div>

    <div className="relative z-10 h-full flex flex-col justify-center p-12 text-white">

      {}
      <div className="mb-12 text-center lg:text-left">
        <Link
          href="/"
          className={`${pacifico.className} text-4xl lg:text-5xl font-bold text-white inline-flex items-center space-x-3 hover:scale-105 transition-transform duration-300`}
        >
          <div className="relative">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="text-2xl lg:text-3xl">🏠</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <span>HomeConnect</span>
        </Link>
        <div className="mt-3 flex items-center justify-center lg:justify-start space-x-4">
          <div className="flex items-center space-x-1 text-blue-100">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Trusted Platform</span>
          </div>
        </div>
      </div>

      {}
      <div className="max-w-md">
        {}
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          Your Dream Home
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
            Awaits You
          </span>
        </h2>

        {}
        <p className="text-xl text-blue-100 mb-8 leading-relaxed font-light">
          Join <span className="font-semibold text-white">10,000+</span> satisfied customers who found their perfect home through our verified property listings.
        </p>

        {}
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-4 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Verified Properties</h3>
              <p className="text-blue-100 text-sm">100% authentic listings</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg">🛡️</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">24/7 Support</h3>
              <p className="text-blue-100 text-sm">Always here to help you</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg">🔒</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Secure Transactions</h3>
              <p className="text-blue-100 text-sm">Your safety is our priority</p>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">5K+</div>
            <div className="text-xs text-blue-200">Properties</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">98%</div>
            <div className="text-xs text-blue-200">Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">24h</div>
            <div className="text-xs text-blue-200">Support</div>
          </div>
        </div>

        {}
        <div className="mt-8 flex items-center justify-center lg:justify-start space-x-3 p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                {i}
              </div>
            ))}
          </div>
          <div className="text-sm text-blue-100">
            <span className="font-semibold text-white">4.9/5</span> rating from 2k+ reviews
          </div>
        </div>
      </div>
    </div>

    {}
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
  </div>
);