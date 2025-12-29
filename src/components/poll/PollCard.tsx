

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

import { pollsApi, type Poll } from '@/lib/api/polls-api';
import { formatDistanceToNow } from 'date-fns';
import { BarChart3, CheckCircle2, Clock, Loader2, Lock, Users } from 'lucide-react';
import { toast } from 'sonner';

interface PollCardProps {
  poll: Poll;
  onVoteChange?: () => void;
  showFullDetails?: boolean;
}

export function PollCard({ poll, onVoteChange, showFullDetails = false }: PollCardProps) {
  const [voting, setVoting] = useState(false);
  const [currentPoll, setCurrentPoll] = useState<Poll>(poll);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    poll.userVote?.optionId || null
  );

  useEffect(() => {
    setCurrentPoll(poll);
    setSelectedOptionId(poll.userVote?.optionId || null);
  }, [poll]);

  const handleVote = async (optionId: string) => {
    if (currentPoll.status !== 'active') {
      toast.error('This poll is not active');
      return;
    }

    if (currentPoll.userVote && !currentPoll.allowMultipleSelections) {
      toast.error('You have already voted on this poll');
      return;
    }

    try {
      setVoting(true);
      await pollsApi.voteOnPoll(currentPoll.id, { optionId });

      
      const updatedPoll = await pollsApi.getPollById(currentPoll.id);
      setCurrentPoll(updatedPoll);
      setSelectedOptionId(optionId);

      toast.success('Vote recorded successfully!');
      if (onVoteChange) {
        onVoteChange();
      }
    } catch (error: unknown) {
      console.error('Failed to vote:', error);
      
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to record vote';
      toast.error(errorMessage);
    } finally {
      setVoting(false);
    }
  };

  const getStatusBadge = () => {
    switch (currentPoll.status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-600">
            <Clock className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="secondary">
            <Lock className="h-3 w-3 mr-1" />
            Closed
          </Badge>
        );
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return null;
    }
  };

  const getPollTypeLabel = (type: Poll['pollType']) => {
    const labels: Record<Poll['pollType'], string> = {
      maintenance_priority: 'Maintenance Priority',
      amenity_selection: 'Amenity Selection',
      community_decision: 'Community Decision',
      vendor_selection: 'Vendor Selection',
      budget_allocation: 'Budget Allocation',
      custom: 'Custom',
    };
    return labels[type] || type;
  };

  const canVote = currentPoll.status === 'active' && (!currentPoll.endDate || new Date(currentPoll.endDate) > new Date());
  const showResults = currentPoll.status === 'closed' || currentPoll.showResultsBeforeClose;
  const maxVotes = Math.max(...currentPoll.options.map(opt => opt.voteCount), 1);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{currentPoll.title}</CardTitle>
              {getStatusBadge()}
            </div>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                {getPollTypeLabel(currentPoll.pollType)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {currentPoll.totalVotes} votes
              </span>
              {currentPoll.endDate && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {canVote
                    ? `Ends ${formatDistanceToNow(new Date(currentPoll.endDate), { addSuffix: true })}`
                    : 'Ended'}
                </span>
              )}
            </CardDescription>
          </div>
        </div>
        {currentPoll.description && showFullDetails && (
          <p className="text-sm text-muted-foreground mt-2">{currentPoll.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {currentPoll.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const percentage = showResults && maxVotes > 0
              ? (option.voteCount / maxVotes) * 100
              : 0;
            const votePercentage = showResults && currentPoll.totalVotes > 0
              ? (option.voteCount / currentPoll.totalVotes) * 100
              : 0;

            return (
              <div
                key={option.id}
                className={`border rounded-lg p-4 transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{option.text}</h4>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    {option.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {option.description}
                      </p>
                    )}
                    {showResults && (
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {option.voteCount} vote{option.voteCount !== 1 ? 's' : ''}
                          </span>
                          <span className="font-medium">
                            {votePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {canVote && !isSelected && (
                    <Button
                      size="sm"
                      onClick={() => handleVote(option.id)}
                      disabled={voting || (currentPoll.userVote && !currentPoll.allowMultipleSelections)}
                    >
                      {voting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Vote'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {currentPoll.userVote && !showResults && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            You voted on this poll
            {currentPoll.userVote.votedAt && (
              <span className="ml-2">
                ({formatDistanceToNow(new Date(currentPoll.userVote.votedAt), { addSuffix: true })})
              </span>
            )}
          </div>
        )}

        {!canVote && currentPoll.status === 'active' && currentPoll.endDate && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
            This poll has ended. Results are now available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

