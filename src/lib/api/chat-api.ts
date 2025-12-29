import { api } from './api';



export interface ChatMessage {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    name: string;
    avatar?: string;
  };
  property?: {
    id: string;
    title: string;
    image?: string;
    price: number;
    location?: string;
  };
  message: string;
  messageType: "text" | "image" | "system" | "offer";
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  receiver: string;
  message: string;
  property?: string;
  messageType?: "text" | "image" | "system" | "offer";
  metadata?: Record<string, any>;
}

export interface Conversation {
  id?: string; 
  partner: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
    isOnline?: boolean;
    lastActive?: string;
  };
  lastMessage?: {
    id?: string;
    content: string;
    timestamp: string | Date;
    isFromMe?: boolean;
  };
  unreadCount: number;
  updatedAt?: string;
}

export interface SendMessageRequest {
  receiver: string;
  message: string;
}

export interface ChatHistoryParams {
  page?: number;
  limit?: number;
  before?: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  total: number;
  hasNext: boolean;
}



export const chatApi = {
  
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/chat/conversations');
    return response.data.data;
  },

  
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/chat/unread-count');
    return response.data.data;
  },

  
  sendMessage: async (data: SendMessageRequest): Promise<ChatMessage> => {
    const response = await api.post('/chat/send', data);
    return response.data.data;
  },

  
  getChatHistory: async (
    partnerId: string,
    params?: ChatHistoryParams
  ): Promise<ChatHistoryResponse> => {
    const response = await api.get(`/chat/${partnerId}`, { params });
    return response.data.data;
  },

  
  markAsRead: async (partnerId: string): Promise<{ count: number }> => {
    const response = await api.patch(`/chat/${partnerId}/read`);
    return response.data.data;
  },

  
  deleteMessage: async (messageId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/chat/message/${messageId}`);
    return response.data;
  },
};

