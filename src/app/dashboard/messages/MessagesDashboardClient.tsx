'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useAuthState } from '@/hooks/useAuthState';
import { MessageSquare, Send, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Date formatting utility
const formatTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return past.toLocaleDateString();
};

export function MessagesDashboardClient() {
  const { user } = useAuthState();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    conversations,
    loading,
    isTyping,
    isPartnerOnline,
    isConnected,
    onlineUsers,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    fetchConversations,
    fetchMessages,
  } = useChatSocket({
    partnerId: selectedPartnerId || undefined,
    onNewMessage: () => {
      // Auto-scroll to bottom when new message arrives
      scrollToBottom();
    },
  });

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when partner is selected
  useEffect(() => {
    if (selectedPartnerId) {
      fetchMessages(selectedPartnerId);
      // Mark messages as read when opening chat
      markAsRead(selectedPartnerId);
    }
  }, [selectedPartnerId, fetchMessages, markAsRead]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!selectedPartnerId || !newMessage.trim()) return;

    try {
      await sendMessage(newMessage);
      setNewMessage('');
      // Mark as read after sending
      markAsRead(selectedPartnerId);
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send message');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (selectedPartnerId) {
      if (e.target.value.trim()) {
        startTyping();
      } else {
        stopTyping();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedConversation = selectedPartnerId
    ? conversations.find((c) => c.partner.id === selectedPartnerId)
    : null;

  const filteredConversations = conversations.filter((conv) =>
    conv.partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.partner.email && conv.partner.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && conversations.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center text-muted-foreground">Loading conversations...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Chat with landlords, tenants, and support
            {!isConnected && (
              <span className="ml-2 text-yellow-600 text-sm">(Connecting...)</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No conversations</h3>
                <p className="text-muted-foreground text-sm">
                  Start a conversation to begin messaging
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conversation) => {
                  const isSelected = selectedPartnerId === conversation.partner.id;
                  return (
                    <div
                      key={conversation.partner.id}
                      onClick={() => setSelectedPartnerId(conversation.partner.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={conversation.partner.avatar} />
                            <AvatarFallback>
                              {conversation.partner.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {onlineUsers.has(conversation.partner.id) && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-medium truncate">{conversation.partner.name}</div>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="default" className="ml-2">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <div className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.isFromMe ? 'You: ' : ''}
                              {conversation.lastMessage.content}
                            </div>
                          )}
                          {conversation.lastMessage && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatTimeAgo(conversation.lastMessage.timestamp.toString())}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={selectedConversation.partner.avatar} />
                      <AvatarFallback>
                        {selectedConversation.partner.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isPartnerOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle>{selectedConversation.partner.name}</CardTitle>
                    <CardDescription>
                      {isPartnerOnline ? (
                        <span className="text-green-600">Online</span>
                      ) : (
                        <span className="text-muted-foreground">Offline</span>
                      )}
                      {isTyping && (
                        <span className="ml-2 text-muted-foreground italic">typing...</span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => {
                        const isOwn = message.sender.id === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              {!isOwn && (
                                <div className="text-xs font-medium mb-1">
                                  {message.sender.name}
                                </div>
                              )}
                              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                              <div
                                className={`text-xs mt-1 flex items-center gap-1 ${
                                  isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}
                              >
                                <span>{formatTimeAgo(message.createdAt)}</span>
                                {isOwn && message.isRead && (
                                  <span className="text-blue-400">✓✓</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="max-w-[70%] rounded-lg p-3 bg-muted">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      onBlur={stopTyping}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim() || !isConnected}
                    >
                      {!isConnected ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                <p className="text-muted-foreground">
                  Select a conversation from the list to view and send messages
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
