/**
 * Support API
 * API methods for Knowledge Base, FAQs, and User Guides
 */

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ==================== TYPES ====================

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

// ==================== API METHODS ====================

/**
 * Get authorization headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

// ==================== KNOWLEDGE BASE API ====================

export const knowledgeBaseApi = {
  /**
   * Get knowledge base articles
   */
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

  /**
   * Get knowledge base article by ID
   */
  getKnowledgeBaseArticleById: async (
    articleId: string,
  ): Promise<KnowledgeArticle> => {
    const response = await axios.get(
      `${API_BASE_URL}/support/knowledge-base/${articleId}`,
      { headers: getAuthHeaders() },
    );

    return response.data.data;
  },

  /**
   * Create knowledge base article
   */
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

  /**
   * Update knowledge base article
   */
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

  /**
   * Delete knowledge base article
   */
  deleteKnowledgeBaseArticle: async (articleId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/support/knowledge-base/${articleId}`, {
      headers: getAuthHeaders(),
    });
  },
};

// ==================== FAQ API ====================

export const faqApi = {
  /**
   * Get FAQs
   */
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

  /**
   * Get FAQ by ID
   */
  getFAQById: async (faqId: string): Promise<FAQ> => {
    const response = await axios.get(`${API_BASE_URL}/support/faqs/${faqId}`, {
      headers: getAuthHeaders(),
    });

    return response.data.data;
  },

  /**
   * Create FAQ
   */
  createFAQ: async (data: CreateFAQRequest): Promise<FAQ> => {
    const response = await axios.post(
      `${API_BASE_URL}/support/faqs`,
      data,
      { headers: getAuthHeaders() },
    );

    return response.data.data;
  },

  /**
   * Update FAQ
   */
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

  /**
   * Delete FAQ
   */
  deleteFAQ: async (faqId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/support/faqs/${faqId}`, {
      headers: getAuthHeaders(),
    });
  },
};

// ==================== USER GUIDE API ====================

export const userGuideApi = {
  /**
   * Get user guides
   */
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

  /**
   * Get user guide by ID
   */
  getUserGuideById: async (guideId: string): Promise<UserGuide> => {
    const response = await axios.get(`${API_BASE_URL}/support/guides/${guideId}`, {
      headers: getAuthHeaders(),
    });

    return response.data.data;
  },

  /**
   * Create user guide
   */
  createUserGuide: async (data: CreateUserGuideRequest): Promise<UserGuide> => {
    const response = await axios.post(
      `${API_BASE_URL}/support/guides`,
      data,
      { headers: getAuthHeaders() },
    );

    return response.data.data;
  },

  /**
   * Update user guide
   */
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

  /**
   * Delete user guide
   */
  deleteUserGuide: async (guideId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/support/guides/${guideId}`, {
      headers: getAuthHeaders(),
    });
  },
};

