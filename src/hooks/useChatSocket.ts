'use client';


import { useSocket } from '@/contexts/SocketContext';
import { chatApi, type ChatMessage, type Conversation } from '@/lib/api/chat-api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UseChatSocketOptions {
  partnerId?: string;
  onNewMessage?: (message: ChatMessage) => void;
  onMessagesRead?: (senderId: string) => void;
  onTyping?: (userId: string, isTyping: boolean) => void;
}

export function useChatSocket(options: UseChatSocketOptions = {}) {
  const { socket, isConnected, onlineUsers, typingUsers } = useSocket();
  const { partnerId, onNewMessage, onMessagesRead, onTyping } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  
  useEffect(() => {
    if (!socket || !isConnected || !partnerId) return;


    socket.emit('join_chat', { recipientId: partnerId });

    
    const handleChatHistory = (data: { messages: ChatMessage[]; roomName: string }) => {
      setMessages(data.messages);
    };

    socket.on('chat_history', handleChatHistory);

    return () => {
      socket.off('chat_history', handleChatHistory);
    };
  }, [socket, isConnected, partnerId]);

  
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (error: unknown) {
      console.error('[ChatSocket] Error fetching conversations:', error);
      toast.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveMessage = (data: { message: ChatMessage; roomName: string }) => {

      
      if (partnerId && (
        data.message.sender.id === partnerId ||
        data.message.receiver.id === partnerId
      )) {
        setMessages((prev) => {
          
          if (prev.some((m) => m.id === data.message.id)) {
            return prev;
          }
          return [...prev, data.message];
        });

        if (onNewMessage) {
          onNewMessage(data.message);
        }
      }

      
      fetchConversations();
    };

    const handleMessagesRead = (data: { readBy: string; senderId: string }) => {

      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender.id === data.senderId && msg.receiver.id === data.readBy
            ? { ...msg, isRead: true }
            : msg
        )
      );

      if (onMessagesRead) {
        onMessagesRead(data.senderId);
      }
    };

    const handleError = (data: { message: string }) => {
      console.error('[ChatSocket] Error:', data.message);
      toast.error(data.message);
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('messages_read', handleMessagesRead);
    socket.on('error', handleError);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('error', handleError);
    };
  }, [socket, isConnected, partnerId, onNewMessage, onMessagesRead, fetchConversations]);

  
  useEffect(() => {
    if (!socket || !isConnected || !partnerId) return;

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === partnerId) {
        if (onTyping) {
          onTyping(data.userId, data.isTyping);
        }
      }
    };

    socket.on('user_typing', handleTyping);

    return () => {
      socket.off('user_typing', handleTyping);
    };
  }, [socket, isConnected, partnerId, onTyping]);

  
  const stopTyping = useCallback(() => {
    if (!socket || !isConnected || !partnerId) return;



    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [socket, isConnected, partnerId]);

  
  const sendMessage = useCallback(
    async (message: string, propertyId?: string, messageType: "text" | "image" | "system" | "offer" = "text", metadata?: any) => {
      if (!socket || !isConnected || !partnerId || !message.trim()) {
        return;
      }

      try {
        const payload = {
          recipientId: partnerId,
          message: message.trim(),
          property: propertyId,
          messageType,
          metadata
        };

        
        socket.emit('send_message', payload);

        
        stopTyping();
      } catch (error) {
        console.error('[ChatSocket] Error sending message:', error);
        toast.error('Failed to send message');
      }
    },
    [socket, isConnected, partnerId, stopTyping]
  );

  
  const markAsRead = useCallback(
    async (senderId: string) => {
      if (!socket || !isConnected) return;

      try {
        socket.emit('mark_messages_read', { senderId });
      } catch (error) {
        console.error('[ChatSocket] Error marking messages as read:', error);
      }
    },
    [socket, isConnected]
  );

  
  const startTyping = useCallback(() => {
    if (!socket || !isConnected || !partnerId) return;

    socket.emit('typing_start', { recipientId: partnerId });

    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [socket, isConnected, partnerId, stopTyping]);

  
  const fetchMessages = useCallback(
    async (partnerId: string) => {
      try {
        setLoading(true);
        const response = await chatApi.getChatHistory(partnerId, { limit: 50 });
        setMessages(response.messages.reverse());
      } catch (error: unknown) {
        console.error('[ChatSocket] Error fetching messages:', error);
        toast.error('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  
  const isPartnerOnline = partnerId ? onlineUsers.has(partnerId) : false;

  
  const isPartnerTyping = partnerId ? typingUsers.get(partnerId) || false : false;

  return {
    socket,
    isConnected,
    messages,
    conversations,
    loading,
    isTyping: isPartnerTyping,
    isPartnerOnline,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    fetchConversations,
    fetchMessages,
  };
}

