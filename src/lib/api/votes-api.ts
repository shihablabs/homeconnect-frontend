import { api } from './api';

// --- Interfaces & Types ---

export interface PropertyVoteInfo {
  id: string;
  title: string;
  city: string;
  score: number;
  upvoteCount: number;
  downvoteCount: number;
}

export interface UserVote {
  id: string;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    images: string[];
  };
  voteType: 'upvote' | 'downvote';
  createdAt: string;
}

export interface VoteStats {
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: 'upvote' | 'downvote' | null;
}

export interface VoteResponse {
  action: 'voted' | 'changed' | 'removed';
  currentVote: 'upvote' | 'downvote' | null;
  stats: VoteStats;
}

export interface TopVotedPropertiesParams {
  limit?: number;
}

export interface UserVotesParams {
  page?: number;
  limit?: number;
}

export interface UserVotesResponse {
  votes: UserVote[];
  total: number;
  page: number;
  totalPages: number;
}

// --- API Implementation ---

export const votesApi = {
  /**
   * Get top-voted properties
   */
  getTopVotedProperties: async (
    params?: TopVotedPropertiesParams
  ): Promise<PropertyVoteInfo[]> => {
    const response = await api.get('/votes/top-properties', { params });
    return response.data.data;
  },

  /**
   * Get current user's voting history (Tenant Only)
   */
  getMyVotes: async (
    params?: UserVotesParams
  ): Promise<UserVotesResponse> => {
    const response = await api.get('/votes/my-votes', { params });
    // Backend returns { data: votes[], meta: { total, page, totalPages, ... } }
    // We need to combine them into the expected format
    const votes = response.data.data || [];
    const meta = response.data.meta || {};
    return {
      votes,
      total: meta.total || 0,
      page: meta.page || 1,
      totalPages: meta.totalPages || 1,
    };
  },

  /**
   * Get vote statistics for a property
   */
  getPropertyVoteStats: async (propertyId: string): Promise<VoteStats> => {
    const response = await api.get(`/properties/${propertyId}/votes`);
    return response.data.data;
  },

  /**
   * Vote on a property (Tenant Only)
   */
  voteOnProperty: async (
    propertyId: string,
    voteType: 'upvote' | 'downvote'
  ): Promise<VoteResponse> => {
    const response = await api.post(`/properties/${propertyId}/vote`, { voteType });
    return response.data.data;
  },

  /**
   * Remove vote from a property (Tenant Only)
   */
  removeVote: async (propertyId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/properties/${propertyId}/vote`);
    return response.data;
  },
};

