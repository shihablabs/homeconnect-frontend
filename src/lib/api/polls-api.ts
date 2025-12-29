

import { api } from './api';

export interface PollOption {
  id: string;
  text: string;
  description?: string;
  imageUrl?: string;
  voteCount: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  pollType: 'maintenance_priority' | 'amenity_selection' | 'community_decision' | 'vendor_selection' | 'budget_allocation' | 'custom';
  options: PollOption[];
  propertyId?: string;
  allowedVoters: 'all_tenants' | 'property_tenants' | 'landlords_only' | 'admin_only' | 'custom';
  maxVotesPerUser: number;
  allowMultipleSelections: boolean;
  status: 'draft' | 'active' | 'closed' | 'archived';
  startDate?: string;
  endDate?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  totalVotes: number;
  isAnonymous: boolean;
  showResultsBeforeClose: boolean;
  userVote?: {
    optionId: string;
    votedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePollData {
  title: string;
  description?: string;
  pollType: Poll['pollType'];
  options: Array<{
    text: string;
    description?: string;
    imageUrl?: string;
  }>;
  propertyId?: string;
  allowedVoters: Poll['allowedVoters'];
  customVoterIds?: string[];
  maxVotesPerUser?: number;
  allowMultipleSelections?: boolean;
  startDate?: string;
  endDate?: string;
  isAnonymous?: boolean;
  showResultsBeforeClose?: boolean;
}

export interface UpdatePollData {
  title?: string;
  description?: string;
  status?: Poll['status'];
  endDate?: string;
  showResultsBeforeClose?: boolean;
}

export interface VoteData {
  optionId: string;
}

export interface PollsResponse {
  polls: Poll[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface PollsFilters {
  propertyId?: string;
  pollType?: string;
  status?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
}

export const pollsApi = {
  
  createPoll: async (data: CreatePollData): Promise<Poll> => {
    const response = await api.post('/polls', data);
    return response.data.data;
  },

  
  getPolls: async (filters?: PollsFilters): Promise<PollsResponse> => {
    const response = await api.get('/polls', { params: filters });
    return {
      polls: response.data.data || [],
      total: response.data.meta?.total || 0,
      totalPages: response.data.meta?.totalPages || 0,
      page: response.data.meta?.page || 1,
      limit: response.data.meta?.limit || 10,
    };
  },

  
  getPollById: async (pollId: string): Promise<Poll> => {
    const response = await api.get(`/polls/${pollId}`);
    return response.data.data;
  },

  
  updatePoll: async (pollId: string, data: UpdatePollData): Promise<Poll> => {
    const response = await api.patch(`/polls/${pollId}`, data);
    return response.data.data;
  },

  
  deletePoll: async (pollId: string): Promise<void> => {
    await api.delete(`/polls/${pollId}`);
  },

  
  voteOnPoll: async (pollId: string, data: VoteData): Promise<{ message: string; pollId: string; optionId: string; totalVotes: number }> => {
    const response = await api.post(`/polls/${pollId}/vote`, data);
    return response.data.data;
  },

  
  closePoll: async (pollId: string): Promise<Poll> => {
    const response = await api.post(`/polls/${pollId}/close`);
    return response.data.data;
  },
};

