/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { votesApi, type PropertyVoteInfo } from '@/lib/api/votes-api';
import { TrendingUp, ThumbsUp, ThumbsDown, Home } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

export default function TopVotedPage() {
  const [properties, setProperties] = useState<PropertyVoteInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    fetchTopVoted();
  }, [limit]);

  const fetchTopVoted = async () => {
    try {
      setLoading(true);
      const data = await votesApi.getTopVotedProperties({ limit });
      setProperties(data);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to fetch top voted properties');
    } finally {
      setLoading(false);
    }
  };

  if (loading && properties.length === 0) {
    return (
      <div className="container mx-auto px-4 pb-16">
        <div className="text-center text-muted-foreground">Loading top voted properties...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-16">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Top Voted Properties</h1>
            <p className="text-muted-foreground mt-1">
              Properties ranked by community votes
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Properties
            </CardTitle>
            <CardDescription>
              {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Home className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground">
                  Properties will appear here once tenants start voting
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {properties.map((property, index) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link href={`/properties/${property.id}`}>
                            <CardTitle className="hover:text-primary transition-colors line-clamp-2">
                              {property.title}
                            </CardTitle>
                          </Link>
                          <CardDescription className="mt-1">{property.city}</CardDescription>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          #{index + 1}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-green-600">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm font-medium">{property.upvoteCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-600">
                            <ThumbsDown className="h-4 w-4" />
                            <span className="text-sm font-medium">{property.downvoteCount}</span>
                          </div>
                        </div>
                        <Badge variant="default" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Score: {property.score}
                        </Badge>
                      </div>
                      <Link href={`/properties/${property.id}`} className="mt-4 block">
                        <Button variant="outline" className="w-full">
                          View Property
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

