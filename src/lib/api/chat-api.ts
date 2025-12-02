import { api } from './api';

// --- Interfaces & Types ---

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
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id?: string; // Optional for compatibility
  partner: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  lastMessage?: {
    id?: string;
    content: string;
    timestamp: string | Date;
    isFromMe?: boolean;
    message?: string; // For backward compatibility
    createdAt?: string; // For backward compatibility
    isRead?: boolean; // For backward compatibility
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

// --- API Implementation ---

export const chatApi = {
  /**
   * Get all conversations
   */
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/chat/conversations');
    return response.data.data;
  },

  /**
   * Get unread message count
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/chat/unread-count');
    return response.data.data;
  },

  /**
   * Send a message (REST fallback - prefer Socket.io for real-time)
   */
  sendMessage: async (data: SendMessageRequest): Promise<ChatMessage> => {
    const response = await api.post('/chat/send', data);
    return response.data.data;
  },

  /**
   * Get chat history with a user
   */
  getChatHistory: async (
    partnerId: string,
    params?: ChatHistoryParams
  ): Promise<ChatHistoryResponse> => {
    const response = await api.get(`/chat/${partnerId}`, { params });
    return response.data.data;
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (partnerId: string): Promise<{ count: number }> => {
    const response = await api.patch(`/chat/${partnerId}/read`);
    return response.data.data;
  },

  /**
   * Delete a message
   */
  deleteMessage: async (messageId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/chat/message/${messageId}`);
    return response.data;
  },
};

