

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";



export type KnowledgeBaseCategory =
  | "general"
  | "booking"
  | "payment"
  | "property"
  | "account"
  | "technical";

export type FAQCategory =
  | "general"
  | "booking"
  | "payment"
  | "property"
  | "account";

export type GuideCategory =
  | "getting-started"
  | "booking"
  | "payment"
  | "property"
  | "account";

export type TargetAudience = "tenant" | "landlord" | "all";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: KnowledgeBaseCategory;
  tags: string[];
  views: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  order: number;
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserGuide {
  id: string;
  title: string;
  description?: string;
  content: string;
  category: GuideCategory;
  targetAudience: TargetAudience;
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetSupportContentOptions {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  isPublished?: boolean;
  targetAudience?: string;
}

export interface GetTicketsOptions {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
  userId?: string;
  assignedTo?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  user: {
    _id: string;
    name: string;
    email: string;
  } | string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  images: string[];
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority: TicketPriority;
  category: string;
  images?: string[];
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  reply?: string;
}

export interface CreateKnowledgeArticleRequest {
  title: string;
  content: string;
  category: KnowledgeBaseCategory;
  tags?: string[];
  isPublished?: boolean;
}

export interface UpdateKnowledgeArticleRequest {
  title?: string;
  content?: string;
  category?: KnowledgeBaseCategory;
  tags?: string[];
  isPublished?: boolean;
}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  category: FAQCategory;
  order?: number;
  isPublished?: boolean;
}

export interface UpdateFAQRequest {
  question?: string;
  answer?: string;
  category?: FAQCategory;
  order?: number;
  isPublished?: boolean;
}

export interface CreateUserGuideRequest {
  title: string;
  description?: string;
  content: string;
  category: GuideCategory;
  targetAudience?: TargetAudience;
  isPublished?: boolean;
}

export interface UpdateUserGuideRequest {
  title?: string;
  description?: string;
  content?: string;
  category?: GuideCategory;
  targetAudience?: TargetAudience;
  isPublished?: boolean;
}

export interface SupportContentResponse<T> {
  data: T[];
  meta: {
    total: number;
    hasNext: boolean;
  };
}





export const ticketApi = {
  
  getTickets: async (
    options: GetTicketsOptions = {},
  ): Promise<SupportContentResponse<SupportTicket>> => {
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.status) params.append("status", options.status);
    if (options.priority) params.append("priority", options.priority);
    if (options.search) params.append("search", options.search);
    if (options.userId) params.append("userId", options.userId);
    if (options.assignedTo) params.append("assignedTo", options.assignedTo);

    const response = await axios.get(
      `${API_BASE_URL}/support/tickets?${params.toString()}`,
      { headers: getAuthHeaders() },
    );

    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, hasNext: false },
    };
  },

  
  getTicketById: async (ticketId: string): Promise<SupportTicket> => {
    const response = await axios.get(
      `${API_BASE_URL}/support/tickets/${ticketId}`,
      { headers: getAuthHeaders() },
    );

    return response.data.data;
  },

  
  createTicket: async (data: CreateTicketRequest): Promise<SupportTicket> => {
    const response = await axios.post(
      `${API_BASE_URL}/support/tickets`,
      data,
      { headers: getAuthHeaders() },
    );

    return response.data.data;
  },

  
  updateTicket: async (
    ticketId: string,
    data: UpdateTicketRequest,
  ): Promise<SupportTicket> => {
    const response = await axios.patch(
      `${API_BASE_URL}/support/tickets/${ticketId}`,
      data,
      { headers: getAuthHeaders() },
    );

    return response.data.data;
  },
};


const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};



export const knowledgeBaseApi = {
  
  getKnowledgeBaseArticles: async (
    options: GetSupportContentOptions = {},
  ): Promise<SupportContentResponse<KnowledgeArticle>> => {
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.category) params.append("category", options.category);
    if (options.search) params.append("search", options.search);
    if (options.isPublished !== undefined)
      params.append("isPublished", options.isPublished.toString());

    const response = await axios.get(
      `${API_BASE_URL}/support/knowledge-base?${params.toString()}`,
      { headers: getAuthHeaders() },
    );

    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, hasNext: false },
    };
  },

  
  getKnowledgeBaseArticleById: async (
    articleId: string,
  ): Promise<KnowledgeArticle> => {
    const response = await axios.get(
      `${API_BASE_URL}/support/knowledge-base/${articleId}`,
      { headers: getAuthHeaders() },
    );

    return response.data.data;
  },

  
  createKnowledgeBaseArticle: async (
    data: CreateKnowledgeArticleRequest,
  ): Promise<KnowledgeArticle> => {
    const response = await axios.post(
      `${API_BASE_URL}/support/knowledge-base`,
      data,
      { headers: getAuthHeaders() },
    );

    return response.data.data;
  },

  
  updateKnowledgeBaseArticle: async (
    articleId: string,
    data: UpdateKnowledgeArticleRequest,
  ): Promise<KnowledgeArticle> => {
    const response = await axios.put(
      `${API_BASE_URL}/support/knowledge-base/${articleId}`,
      data,
      { headers: getAuthHeaders() },
    );

    return response.data.data;
  },

  
  deleteKnowledgeBaseArticle: async (articleId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/support/knowledge-base/${articleId}`, {
      headers: getAuthHeaders(),
    });
  },
};



export const faqApi = {
  
  getFAQs: async (
    options: GetSupportContentOptions = {},
  ): Promise<SupportContentResponse<FAQ>> => {
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.category) params.append("category", options.category);
    if (options.search) params.append("search", options.search);
    if (options.isPublished !== undefined)
      params.append("isPublished", options.isPublished.toString());

    const response = await axios.get(
      `${API_BASE_URL}/support/faqs?${params.toString()}`,
      { headers: getAuthHeaders() },
    );

    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, hasNext: false },
    };
  },

  
  getFAQById: async (faqId: string): Promise<FAQ> => {
    const response = await axios.get(`${API_BASE_URL}/support/faqs/${faqId}`, {
      headers: getAuthHeaders(),
    });

    return response.data.data;
  },

  
  createFAQ: async (data: CreateFAQRequest): Promise<FAQ> => {
    const response = await axios.post(
      `${API_BASE_URL}/support/faqs`,
      data,
      { headers: getAuthHeaders() },
    );

    return response.data.data;
  },

  
  updateFAQ: async (
    faqId: string,
    data: UpdateFAQRequest,
  ): Promise<FAQ> => {
    const response = await axios.put(
      `${API_BASE_URL}/support/faqs/${faqId}`,
      data,
      { headers: getAuthHeaders() },
    );

    return response.data.data;
  },

  
  deleteFAQ: async (faqId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/support/faqs/${faqId}`, {
      headers: getAuthHeaders(),
    });
  },
};



export const userGuideApi = {
  
  getUserGuides: async (
    options: GetSupportContentOptions = {},
  ): Promise<SupportContentResponse<UserGuide>> => {
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.category) params.append("category", options.category);
    if (options.search) params.append("search", options.search);
    if (options.targetAudience)
      params.append("targetAudience", options.targetAudience);
    if (options.isPublished !== undefined)
      params.append("isPublished", options.isPublished.toString());

    const response = await axios.get(
      `${API_BASE_URL}/support/guides?${params.toString()}`,
      { headers: getAuthHeaders() },
    );

    return {
      data: response.data.data || [],
      meta: response.data.meta || { total: 0, hasNext: false },
    };
  },

  
  getUserGuideById: async (guideId: string): Promise<UserGuide> => {
    const response = await axios.get(`${API_BASE_URL}/support/guides/${guideId}`, {
      headers: getAuthHeaders(),
    });

    return response.data.data;
  },

  
  createUserGuide: async (data: CreateUserGuideRequest): Promise<UserGuide> => {
    const response = await axios.post(
      `${API_BASE_URL}/support/guides`,
      data,
      { headers: getAuthHeaders() },
    );

    return response.data.data;
  },

  
  updateUserGuide: async (
    guideId: string,
    data: UpdateUserGuideRequest,
  ): Promise<UserGuide> => {
    const response = await axios.put(
      `${API_BASE_URL}/support/guides/${guideId}`,
      data,
      { headers: getAuthHeaders() },
    );

    return response.data.data;
  },

  
  deleteUserGuide: async (guideId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/support/guides/${guideId}`, {
      headers: getAuthHeaders(),
    });
  },
};

