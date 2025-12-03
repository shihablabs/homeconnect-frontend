'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { votesApi, type UserVote } from '@/lib/api/votes-api';
import { ThumbsUp, ThumbsDown, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

export function MyVotesClient() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['votes', 'my-votes', page],
    queryFn: () => votesApi.getMyVotes({ page, limit: 20 }),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: (failureCount, error: unknown) => {
      // Don't retry on 403 or 401 errors
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 403 || err.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });

  // Handle errors
  if (error) {
    const errorObj = error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: { message?: string }; status?: number } })
      : null;
    const errorMessage = errorObj?.response?.data?.message || 
      (error && typeof error === 'object' && 'message' in error ? String((error as { message?: unknown }).message) : undefined) ||
      'Failed to fetch your votes';
    const statusCode = errorObj?.response?.status;
    
    // Handle 403 Forbidden (unauthorized) specifically
    if (statusCode === 403) {
      toast.error('Access denied: Only tenants can view voting history');
    } else if (statusCode === 401) {
      toast.error('Please log in to view your votes');
    } else if (!isLoading) {
      toast.error(errorMessage);
    }
  }

  const votes: UserVote[] = data?.votes || [];
  const totalPages = data?.totalPages || 1;
  const loading = isLoading;

  if (loading && (!votes || votes.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Votes</h1>
            <p className="text-muted-foreground mt-1">
              View all properties you&apos;ve voted on
            </p>
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center text-muted-foreground">Loading your votes...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Votes</h1>
          <p className="text-muted-foreground mt-1">
            View all properties you&apos;ve voted on
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voting History</CardTitle>
          <CardDescription>
            {(votes || []).length} propert{(votes || []).length !== 1 ? 'ies' : 'y'} voted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!votes || votes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No votes yet</h3>
              <p className="text-muted-foreground mb-4">
                Start voting on properties to help others find great places
              </p>
              <Link href="/properties">
                <Button>Browse Properties</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Your Vote</TableHead>
                      <TableHead>Voted On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(votes || []).map((vote) => (
                      <TableRow key={vote.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {vote.property?.images && vote.property.images.length > 0 ? (
                              <Image
                                src={vote.property.images[0]}
                                alt={vote.property?.title || 'Property'}
                                width={64}
                                height={64}
                                className="rounded-md object-cover h-16 w-16"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                                <Heart className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <Link
                                href={`/properties/${vote.property?.id || '#'}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {vote.property?.title || 'N/A'}
                              </Link>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {vote.property?.address || 'N/A'}
                          </div>
                          <div className="text-sm">{vote.property?.city || ''}</div>
                        </TableCell>
                        <TableCell>
                          {(vote.voteType || 'upvote') === 'upvote' ? (
                            <Badge variant="default" className="gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              Upvote
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <ThumbsDown className="h-3 w-3" />
                              Downvote
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {vote.createdAt ? new Date(vote.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/properties/${vote.property?.id || '#'}`}>
                            <Button variant="outline" size="sm">
                              View Property
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

