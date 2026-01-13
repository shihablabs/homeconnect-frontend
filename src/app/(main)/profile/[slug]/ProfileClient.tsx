'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { User, usersApi } from '@/lib/api/users-api';
import { User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AboutSection } from '@/components/profile/AboutSection';
import { LandlordProperties } from '@/components/profile/LandlordProperties';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Button } from '@/components/ui/button';
import { propertiesApi } from '@/lib/api/properties-api';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
import { useAppSelector } from '@/redux/hooks';

interface ProfileClientProps {
  id: string;
}

export function ProfileClient({ id }: ProfileClientProps) {
  const router = useRouter();
  const { checkAuth } = useAuthGuard();
  const currentUser = useAppSelector(selectCurrentUser);
  const [profile, setProfile] = useState<User | null>(null);

  // Stats - Fetched independently for the header
  const [stats, setStats] = useState({
    total: 0,
    sale: 0,
    rent: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Smart Redirect
  useEffect(() => {
    if (currentUser?.id === id) {
      router.push('/dashboard/profile');
    }
  }, [currentUser, id, router]);

  // Profile Data Fetching
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const userData = await usersApi.getUserById(id);

        if (!userData) {
          setError('User not found');
          return;
        }

        setProfile(userData);

        // Fetch stats separately if landlord
        if (userData.role?.toLowerCase() === 'landlord' && userData.id) {
          try {
            const [saleProps, rentProps] = await Promise.all([
              propertiesApi.getProperties({ ownerId: userData.id, listingType: 'sale', limit: 1 }),
              propertiesApi.getProperties({ ownerId: userData.id, listingType: 'rent', limit: 1 })
            ]);
            setStats({
              total: (saleProps?.total || 0) + (rentProps?.total || 0),
              sale: saleProps?.total || 0,
              rent: rentProps?.total || 0
            });
          } catch (error) {
            console.error("Failed to fetch stats", error);
          }
        }

      } catch (err: unknown) {
        console.error('Failed to fetch profile data:', err);
        setError('Failed to load profile. Please try again later.');
        toast.error('Could not load profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);


  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50/50 px-4">
        <div className="text-center space-y-4 max-w-sm mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 inline-block">
            <UserIcon className="w-10 h-10 text-gray-400 mx-auto" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{error || 'User Not Found'}</h2>
            <p className="text-sm text-gray-500 mt-1">This user profile is unavailable.</p>
          </div>
          <Button onClick={() => router.push('/')} variant="outline" size="sm" className="mt-2 text-xs">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-[url('/assets/images/profile-cover.jpg')] bg-cover bg-button opacity-80" />
        <div className="absolute inset-0 bg-gray-900/10 blur-sm" />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

          {/* Profile Header (Sidebar) */}
          <ProfileHeader profile={profile} stats={stats} />

          {/* Main Content */}
          <div className="flex-1 min-w-0 mt-8 md:mt-0 space-y-8">

            {/* About Section */}
            <AboutSection profile={profile} />

            {/* Property Gallery - Only for Landlords */}
            {profile.role?.toLowerCase() === 'landlord' && (
              <LandlordProperties userId={profile.id} />
            )}

          </div>
        </div>
      </div>
    </div >
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      <div className="h-48 md:h-56 bg-gray-200 animate-pulse" />
      <div className="container mx-auto px-4 -mt-16 relative z-10 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-80 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex flex-col items-center">
                <Skeleton className="h-28 w-28 rounded-full -mt-16 border-4 border-white mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="pt-4 space-y-2">
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            </div>
          </div>

          <div className="flex-1 w-full space-y-6">
            <div className="flex gap-4 border-b border-gray-200 pb-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Skeleton className="h-72 rounded-xl" />
              <Skeleton className="h-72 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
