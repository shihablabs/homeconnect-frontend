'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { votesApi, type VoteStats } from '@/lib/api/votes-api';
import { useAuthState } from '@/hooks/useAuthState';
import { ThumbsUp, ThumbsDown, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface VoteButtonsProps {
  propertyId: string;
  onVoteChange?: (stats: VoteStats) => void;
  compact?: boolean; // For use in cards
  showScore?: boolean; // Show score badge
  orientation?: 'horizontal' | 'vertical'; // Layout orientation
}

export function VoteButtons({ 
  propertyId, 
  onVoteChange,
  compact = false,
  showScore = true,
  orientation = 'horizontal'
}: VoteButtonsProps) {
  const { user } = useAuthState();
  const queryClient = useQueryClient();
  const [voting, setVoting] = useState(false);
  const [votingType, setVotingType] = useState<'upvote' | 'downvote' | null>(null);

  const isTenant = user?.role === 'tenant';
  const isAuthenticated = !!user;

  // Use React Query to fetch and cache vote stats
  const { data: stats, isLoading: loading, refetch: refetchStats } = useQuery<VoteStats>({
    queryKey: ['votes', 'stats', propertyId],
    queryFn: () => votesApi.getPropertyVoteStats(propertyId),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Call onVoteChange when stats update
  useEffect(() => {
    if (stats && onVoteChange) {
      onVoteChange(stats);
    }
  }, [stats, onVoteChange]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!isTenant) {
      toast.error('Only tenants can vote on properties');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    try {
      setVoting(true);
      setVotingType(voteType);
      const response = await votesApi.voteOnProperty(propertyId, voteType);
      
      // Update the cache immediately with the new stats
      queryClient.setQueryData(['votes', 'stats', propertyId], response.stats);
      
      // Refetch to ensure we have the latest data
      await refetchStats();
      
      if (onVoteChange) {
        onVoteChange(response.stats);
      }
      
      // Invalidate all vote-related queries to update all VoteButtons globally
      queryClient.invalidateQueries({ queryKey: ['votes', 'stats', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['votes', 'my-votes'] });
      queryClient.invalidateQueries({ queryKey: ['votes', 'top-properties'] });
      
      // Show appropriate toast message
      if (response.action === 'removed') {
        toast.success('Vote removed');
      } else if (response.action === 'changed') {
        toast.success(`Changed to ${voteType === 'upvote' ? 'upvote' : 'downvote'}`);
      } else {
        toast.success('Vote recorded!');
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to vote');
    } finally {
      setVoting(false);
      setVotingType(null);
    }
  };

  const handleRemoveVote = async () => {
    if (!isTenant || !isAuthenticated) return;

    try {
      setVoting(true);
      await votesApi.removeVote(propertyId);
      
      // Refetch stats to get updated data
      await refetchStats();
      
      // Invalidate all vote-related queries to update all VoteButtons globally
      queryClient.invalidateQueries({ queryKey: ['votes', 'stats', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['votes', 'my-votes'] });
      queryClient.invalidateQueries({ queryKey: ['votes', 'top-properties'] });
      
      toast.success('Vote removed');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to remove vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className={cn(
        "flex items-center gap-2",
        orientation === 'vertical' && "flex-col"
      )}>
        <div className="h-9 w-20 bg-muted animate-pulse rounded-lg" />
        <div className="h-9 w-20 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const userVote = stats.userVote;
  const isUpvoted = userVote === 'upvote';
  const isDownvoted = userVote === 'downvote';

  const containerClass = cn(
    "flex items-center gap-2",
    orientation === 'vertical' && "flex-col",
    compact && "gap-1"
  );

  const buttonBaseClass = cn(
    "transition-all duration-200 ease-in-out",
    "hover:scale-105 active:scale-95",
    !isAuthenticated && "opacity-60 cursor-not-allowed"
  );

  return (
    <TooltipProvider>
      <div className={containerClass}>
        <div className={cn(
          "flex items-center gap-1",
          orientation === 'vertical' && "flex-col"
        )}>
          {/* Upvote Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isUpvoted ? 'default' : 'outline'}
                size={compact ? 'sm' : 'default'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isUpvoted) {
                    handleRemoveVote();
                  } else {
                    handleVote('upvote');
                  }
                }}
                disabled={!isTenant || voting || !isAuthenticated}
                className={cn(
                  buttonBaseClass,
                  isUpvoted && "bg-green-600 hover:bg-green-700 text-white border-green-600",
                  !isUpvoted && "hover:border-green-500 hover:text-green-600",
                  voting && votingType === 'upvote' && "opacity-50"
                )}
              >
                {voting && votingType === 'upvote' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsUp className={cn(
                    "h-4 w-4 transition-transform",
                    isUpvoted && "fill-current scale-110",
                    !voting && "group-hover:scale-110"
                  )} />
                )}
                <span className={cn(
                  "font-semibold",
                  compact && "text-xs"
                )}>
                  {stats.upvotes}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {!isAuthenticated 
                ? 'Login to vote' 
                : !isTenant 
                ? 'Only tenants can vote' 
                : isUpvoted 
                ? 'Remove upvote' 
                : 'Upvote this property'}
            </TooltipContent>
          </Tooltip>

          {/* Downvote Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isDownvoted ? 'destructive' : 'outline'}
                size={compact ? 'sm' : 'default'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isDownvoted) {
                    handleRemoveVote();
                  } else {
                    handleVote('downvote');
                  }
                }}
                disabled={!isTenant || voting || !isAuthenticated}
                className={cn(
                  buttonBaseClass,
                  isDownvoted && "bg-red-600 hover:bg-red-700 text-white border-red-600",
                  !isDownvoted && "hover:border-red-500 hover:text-red-600",
                  voting && votingType === 'downvote' && "opacity-50"
                )}
              >
                {voting && votingType === 'downvote' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsDown className={cn(
                    "h-4 w-4 transition-transform",
                    isDownvoted && "fill-current scale-110",
                    !voting && "group-hover:scale-110"
                  )} />
                )}
                <span className={cn(
                  "font-semibold",
                  compact && "text-xs"
                )}>
                  {stats.downvotes}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {!isAuthenticated 
                ? 'Login to vote' 
                : !isTenant 
                ? 'Only tenants can vote' 
                : isDownvoted 
                ? 'Remove downvote' 
                : 'Downvote this property'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Score Badge */}
        {showScore && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary" 
                className={cn(
                  "gap-1.5 px-3 py-1.5 font-semibold",
                  stats.score > 0 && "bg-green-100 text-green-700 border-green-300",
                  stats.score < 0 && "bg-red-100 text-red-700 border-red-300",
                  stats.score === 0 && "bg-gray-100 text-gray-700",
                  compact && "text-xs px-2 py-1"
                )}
              >
                <TrendingUp className={cn(
                  "h-3 w-3",
                  stats.score > 0 && "text-green-600",
                  stats.score < 0 && "text-red-600 rotate-180",
                  stats.score === 0 && "text-gray-500"
                )} />
                {stats.score > 0 ? '+' : ''}{stats.score}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">Vote Score</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.upvotes} upvotes - {stats.downvotes} downvotes
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Info Text for Non-Tenants */}
        {!isTenant && !compact && (
          <p className="text-xs text-muted-foreground hidden md:block">
            Only tenants can vote
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}
