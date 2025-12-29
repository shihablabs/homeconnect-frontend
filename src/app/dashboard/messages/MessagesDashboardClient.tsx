'use client';


import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSocket } from '@/contexts/SocketContext';
import { useAuthState } from '@/hooks/useAuthState';
import { useChatSocket } from '@/hooks/useChatSocket';
import { ChatMessage, Conversation } from '@/lib/api/chat-api';
import { ArrowLeft, ExternalLink, Home, Loader2, MessageSquare, Search, Send } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';


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

  const { onlineUsers } = useSocket();
  const searchParams = useSearchParams();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const {
    messages,
    conversations,
    loading,
    isTyping,
    isPartnerOnline,
    isConnected,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    fetchConversations,
    fetchMessages,
  } = useChatSocket({
    partnerId: selectedPartnerId || undefined,
    onNewMessage: () => {
      
      scrollToBottom();
    },
  });

  
  useEffect(() => {
    audioRef.current = new Audio('/sounds/message-tone.mp3');
  }, []);

  
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      const isRecent = new Date(lastMessage.createdAt).getTime() > Date.now() - 10000;
      if (lastMessage.sender.id !== user?.id && isRecent) {
        audioRef.current?.play().catch(e => console.log('Audio play failed:', e));
      }
    }
  }, [messages, user?.id]);

  
  useEffect(() => {
    const partnerId = searchParams.get('partner');
    const propertyId = searchParams.get('property');
    if (partnerId) {
      setSelectedPartnerId(partnerId);
      setShowMobileChat(true);
    }
    if (propertyId) {
      setActivePropertyId(propertyId);
    }
  }, [searchParams]);



  
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  
  useEffect(() => {
    if (selectedPartnerId) {
      fetchMessages(selectedPartnerId);
      
      markAsRead(selectedPartnerId);
    }
  }, [selectedPartnerId, fetchMessages, markAsRead]);

  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const handleSendMessage = async () => {
    if (!selectedPartnerId || !newMessage.trim()) return;

    try {
      
      await sendMessage(newMessage, activePropertyId || undefined);

      
      if (activePropertyId) setActivePropertyId(null);

      setNewMessage('');
      
      markAsRead(selectedPartnerId);
      
      fetchConversations();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : undefined;
      toast.error(errorMessage || 'Failed to send message');
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
    ? conversations.find((c: Conversation) => c.partner.id === selectedPartnerId)
    : null;

  const filteredConversations = conversations.filter((conv: Conversation) =>
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
      <div className="flex items-center justify-between pt-10">
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
        {}
        <Card className={`md:col-span-1 flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
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
                {filteredConversations.map((conversation: Conversation) => {
                  const isSelected = selectedPartnerId === conversation.partner.id;
                  return (
                    <div
                      key={conversation.partner.id}
                      onClick={() => {
                        setSelectedPartnerId(conversation.partner.id);
                        setShowMobileChat(true);
                      }}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${isSelected
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

        {}
        <Card className={`md:col-span-2 flex-col ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  {}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden mr-2"
                    onClick={() => setShowMobileChat(false)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
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
                      {messages.map((message: ChatMessage) => {
                        const isOwn = message.sender.id === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                                }`}
                            >
                              {!isOwn && (
                                <div className="text-xs font-medium mb-1">
                                  {message.sender.name}
                                </div>
                              )}

                              {}
                              {message.property && (
                                <div className={`mb-2 rounded overflow-hidden border ${isOwn ? 'border-primary-foreground/20' : 'border-border/50'} bg-black/10`}>
                                  <div className="flex gap-2 p-2 items-center">
                                    {message.property.image && (
                                      <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                                        <Image
                                          src={message.property.image}
                                          alt={message.property.title}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold truncate">{message.property.title}</p>
                                      <p className="text-xs opacity-80">${message.property.price.toLocaleString()}</p>
                                    </div>
                                    <Link href={`/properties/${message.property.id}`} target="_blank">
                                      <ExternalLink className="h-3 w-3 opacity-70 hover:opacity-100" />
                                    </Link>
                                  </div>
                                </div>
                              )}

                              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                              <div
                                className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
                    {activePropertyId && (
                      <div className="absolute bottom-full left-4 mb-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Home className="h-3 w-3" />
                        <span>Discussing Property</span>
                        <button onClick={() => setActivePropertyId(null)} className="ml-1 hover:text-red-500">×</button>
                      </div>
                    )}
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
