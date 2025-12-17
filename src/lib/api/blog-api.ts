
import { api } from './api';

export interface BlogResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  images: string[];
  tags: string[];
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  views: number;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogFilters {
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogSearchResult {
  data: BlogResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface CreateBlogData {
  title: string;
  content: string;
  images?: string[];
  tags?: string[];
  isPublished?: boolean;
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
  images?: string[];
  tags?: string[];
  isPublished?: boolean;
}

export const blogApi = {
  getAllBlogs: async (filters: BlogFilters = {}): Promise<BlogSearchResult> => {
    const params: Record<string, unknown> = { ...filters };
    if (params.tags && Array.isArray(params.tags)) {
      params.tags = params.tags.join(',');
    }
    const response = await api.get('/blogs', { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  getBlogBySlug: async (slug: string): Promise<BlogResponse> => {
    const response = await api.get(`/blogs/${slug}`);
    return response.data.data;
  },

  createBlog: async (data: CreateBlogData): Promise<BlogResponse> => {
    const response = await api.post('/blogs', data);
    return response.data.data;
  },

  updateBlog: async (id: string, data: UpdateBlogData): Promise<BlogResponse> => {
    const response = await api.patch(`/blogs/${id}`, data);
    return response.data.data;
  },

  deleteBlog: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },
};
