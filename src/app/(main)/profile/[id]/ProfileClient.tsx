'use client';

import { PropertyCard } from '@/components/cards/PropertyCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { propertiesApi, PropertyResponse } from '@/lib/api/properties-api';
import { User, usersApi } from '@/lib/api/users-api';
import { BadgeCheck, Home, LayoutGrid, Mail, MessageSquare, Phone, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ProfileClientProps {
  id: string; 
}

export function ProfileClient({ id }: ProfileClientProps) {
  const router = useRouter();
  const { checkAuth } = useAuthGuard();
  const [profile, setProfile] = useState<User | null>(null);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        
        const userData = await usersApi.getUserById(id);

        if (!userData) {
          setError('User not found');
          return;
        }

        setProfile(userData);

        
        if (userData.id) {
          const propertiesData = await propertiesApi.getProperties({
            ownerId: userData.id,
            limit: 50
          });
          setProperties(propertiesData?.properties || []);
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
      fetchData();
    }
  }, [id]);

  const handleMessage = () => {
    checkAuth(() => {
      if (profile?.id) {
        router.push(`/dashboard/messages?partner=${profile.id}`);
      }
    });
  };

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

  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-2007293dd965?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center blur-md scale-110 opacity-50" />
        <div className="absolute inset-0 bg-gray-900/10" />
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

          {}
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
                  {profile.isVerified && (
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

                <div className="w-full space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center py-2 text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" /> Listings
                    </span>
                    <span className="font-semibold text-gray-900">{properties.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Status
                    </span>
                    <span className={`font-semibold ${profile.isVerified ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {profile.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>

                <div className="w-full pt-4 mt-2">
                  <Button
                    onClick={handleMessage}
                    className="w-full bg-gray-900 hover:bg-black text-white rounded-xl h-10 text-sm font-medium transition-transform active:scale-95 shadow-lg shadow-gray-900/10"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>

            {}
            {(profile.isVerified || profile.isEmailVerified) && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Verifications</h3>
                <div className="space-y-2.5">
                  {profile.isEmailVerified && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <BadgeCheck className="w-4 h-4 text-cyan-500" />
                      <span>Email Confirmed</span>
                    </div>
                  )}
                  {profile.isVerified && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <BadgeCheck className="w-4 h-4 text-cyan-500" />
                      <span>Identity Verified</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {}
          <div className="flex-1 min-w-0 mt-8 md:mt-0">
            <Tabs defaultValue="listings" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl h-auto w-full grid grid-cols-3 gap-1">
                  <TabsTrigger
                    value="listings"
                    className="rounded-lg py-2.5 font-semibold text-gray-500 
                        data-[state=active]:bg-white data-[state=active]:text-transparent data-[state=active]:bg-clip-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 
                        data-[state=active]:shadow-sm transition-all"
                  >
                    Properties <span className="ml-2 px-1.5 py-0.5 rounded-md bg-gray-200/50 text-xs text-gray-600 group-data-[state=active]:bg-cyan-50 group-data-[state=active]:text-cyan-600">{properties.length}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="rounded-lg py-2.5 font-semibold text-gray-500 
                        data-[state=active]:bg-white data-[state=active]:text-transparent data-[state=active]:bg-clip-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 
                        data-[state=active]:shadow-sm transition-all"
                  >
                    Reviews <span className="ml-2 px-1.5 py-0.5 rounded-md bg-gray-200/50 text-xs text-gray-600 group-data-[state=active]:bg-cyan-50 group-data-[state=active]:text-cyan-600">0</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="about"
                    className="rounded-lg py-2.5 font-semibold text-gray-500 
                        data-[state=active]:bg-white data-[state=active]:text-transparent data-[state=active]:bg-clip-text data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 
                        data-[state=active]:shadow-sm transition-all"
                  >
                    About
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="listings" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                {properties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-200 shadow-sm mt-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-50 mb-4">
                      <Home className="w-8 h-8 text-cyan-500/50" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Active Listings</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                      This user hasn't posted any properties yet. Check back later for updates.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-200 shadow-sm mt-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-50 mb-4">
                    <BadgeCheck className="w-8 h-8 text-yellow-500/50" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No Reviews Yet</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                    This user hasn't received any reviews yet.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="about" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-cyan-100 transition-colors">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Mail className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
                      </div>
                      <p className="text-gray-900 font-medium pl-11">{profile.email}</p>
                    </div>

                    {profile.phone && (
                      <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-cyan-100 transition-colors">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Phone className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</span>
                        </div>
                        <p className="text-gray-900 font-medium pl-11">{profile.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
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
