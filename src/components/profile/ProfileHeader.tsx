"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { User } from "@/lib/api/users-api";
import { BadgeCheck, Home, LayoutGrid, Share2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProfileHeaderProps {
  profile: User;
  stats: {
    total: number;
    sale: number;
    rent: number;
  };
}

export function ProfileHeader({ profile, stats }: ProfileHeaderProps) {
  const router = useRouter();
  const { checkAuth } = useAuthGuard();

  const handleMessage = () => {
    checkAuth(() => {
      if (profile?.id) {
        router.push(`/dashboard/messages?partner=${profile.id}`);
      }
    });
  };

  return (
    <div className="w-full md:w-80 shrink-0 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 backdrop-blur-sm">
        <div className="flex flex-col items-center text-center">
          <div className="relative -mt-16 mb-4">
            <div className="p-1.5 bg-white rounded-full shadow-lg">
              <Avatar className="h-28 w-28 border-4 border-white shadow-inner">
                <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600 font-bold">
                  {profile.name[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            {profile.verificationStatus === 'verified' && (
              <div className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-md">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-1 rounded-full" title="Verified Identity">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-0.5 rounded-full bg-gray-100/80 text-gray-600 text-[10px] uppercase tracking-wider font-bold">
              {profile.role}
            </span>
            <span className="text-xs text-gray-400">Since {new Date(profile.createdAt).getFullYear()}</span>
          </div>

          {profile.title && (
            <p className="text-sm text-gray-600 font-medium mb-1 max-w-[200px] leading-relaxed">
              {profile.title}
            </p>
          )}
          {(profile.yearsOfExperience !== undefined || profile.specializedArea) && (
            <div className="flex flex-col gap-1 text-xs text-gray-500 mb-4 items-center">
              {profile.yearsOfExperience !== undefined && profile.yearsOfExperience > 0 && (
                <span>{profile.yearsOfExperience} Years Experience</span>
              )}
              {profile.specializedArea && (
                <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-full">{profile.specializedArea}</span>
              )}
            </div>
          )}

          <div className="w-full space-y-2 pt-2 border-t border-gray-100">
            {/* Only show stats if role is landlord? Or for everyone? Assuming Landlord logic for stats mostly */}
            {profile.role === 'landlord' && (
              <>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" /> Total Listings
                  </span>
                  <span className="font-semibold text-gray-900">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Home className="w-4 h-4" /> For Sale
                  </span>
                  <span className="font-semibold text-gray-900">{stats.sale}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Home className="w-4 h-4" /> For Rent
                  </span>
                  <span className="font-semibold text-gray-900">{stats.rent}</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center py-2 text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Status
              </span>
              <span className={`font-semibold ${profile.verificationStatus === 'verified' ? 'text-emerald-600' : 'text-gray-400'}`}>
                {profile.verificationStatus === 'verified' ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>

          <div className="w-full pt-4 mt-2">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Profile link copied to clipboard!");
              }}
              className="w-full bg-gray-900 hover:bg-black text-white rounded-xl h-10 text-sm font-medium transition-transform active:scale-95 shadow-lg shadow-gray-900/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Verifications Card */}
      {(profile.verificationStatus === 'verified' || profile.isEmailVerified) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Verifications</h3>
          <div className="space-y-2.5">
            {profile.isEmailVerified && (
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <BadgeCheck className="w-4 h-4 text-blue-600" />
                <span>Email Verified</span>
              </div>
            )}
            {profile.verificationStatus === 'verified' && (
              <div className="flex items-center gap-2.5 text-sm text-gray-700">
                <BadgeCheck className="w-4 h-4 text-blue-600" />
                <span>Identity Verified</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
