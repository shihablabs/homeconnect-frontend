'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Heart, Search, Star, Eye, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Feedback {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  category: 'general' | 'feature' | 'bug' | 'improvement' | 'other';
  status: 'new' | 'reviewed' | 'addressed';
  createdAt: string;
}

export function UserFeedbackClient() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter, ratingFilter]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      // TODO: Implement feedback API
      // const response = await supportApi.getFeedback({ status: statusFilter, rating: ratingFilter });
      // setFeedbacks(response.feedback);
      setFeedbacks([]);
    } catch (error) {
      toast.error('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'addressed':
        return (
          <Badge variant="default" className="bg-green-500 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Addressed
          </Badge>
        );
      case 'reviewed':
        return <Badge variant="default">Reviewed</Badge>;
      case 'new':
        return <Badge variant="outline">New</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      !searchQuery ||
      feedback.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
    const matchesRating =
      ratingFilter === 'all' ||
      (ratingFilter === 'high' && feedback.rating >= 4) ||
      (ratingFilter === 'low' && feedback.rating <= 2) ||
      feedback.rating.toString() === ratingFilter;
    return matchesSearch && matchesStatus && matchesRating;
  });

  const stats = {
    total: feedbacks.length,
    averageRating:
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0,
    new: feedbacks.filter((f) => f.status === 'new').length,
    positive: feedbacks.filter((f) => f.rating >= 4).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Feedback</h1>
        <p className="text-muted-foreground mt-1">
          View and manage user feedback and ratings
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
            </div>
            <div className="flex gap-1 mt-1">
              {getRatingStars(Math.round(stats.averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Feedback</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
            <p className="text-xs text-muted-foreground">4+ stars</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Feedback</CardTitle>
              <CardDescription>
                {filteredFeedbacks.length} feedback{filteredFeedbacks.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="addressed">Addressed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="high">High (4-5)</SelectItem>
                  <SelectItem value="low">Low (1-2)</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading feedback...</div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No feedback found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || ratingFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No user feedback yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{feedback.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {feedback.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getRatingStars(feedback.rating)}
                          <span className="ml-2 text-sm font-medium">({feedback.rating})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md truncate">{feedback.comment}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {feedback.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

