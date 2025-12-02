'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Search, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// TODO: Create support chat API when backend is ready
interface ChatSession {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  lastMessage?: {
    message: string;
    createdAt: string;
  };
  unreadCount: number;
  status: 'online' | 'offline' | 'away';
}

export function LiveChatClient() {
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: sessionsData,
    isLoading: loading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['support', 'chat-sessions'],
    queryFn: async () => {
      // TODO: Implement API call when backend is ready
      // const response = await supportApi.getChatSessions();
      // return response.sessions;
      
      // Mock data structure - replace with actual API call
      return [] as ChatSession[];
    },
    staleTime: 10000, // 10 seconds (chat needs frequent updates)
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Auto-refetch every 30 seconds for live updates
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 429) return false;
      return failureCount < 2;
    },
  });

  const sessions = sessionsData || [];

  const handleSendMessage = async () => {
    if (!selectedSession || !newMessage.trim()) return;
    
    try {
      // TODO: Implement API call
      // await supportApi.sendMessage(selectedSession.id, newMessage);
      setNewMessage('');
      // Refresh messages
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const filteredSessions = sessions.filter((session) =>
    session.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Chat</h1>
          <p className="text-muted-foreground mt-1">
            Chat with users in real-time for instant support
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 h-[calc(100vh-200px)]">
        {/* Sessions List */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Active Chats</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {loading && !sessionsData ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading chat sessions...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to load chats</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {(error as any)?.response?.data?.message || 'An error occurred while fetching chat sessions'}
                </p>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active chats</h3>
                <p className="text-muted-foreground text-sm">
                  Chat sessions will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSession?.id === session.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={session.user.avatar} />
                          <AvatarFallback>
                            {session.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {session.status === 'online' && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium truncate">{session.user.name}</div>
                          {session.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2">
                              {session.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {session.lastMessage && (
                          <div className="text-sm text-muted-foreground truncate">
                            {session.lastMessage.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedSession ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={selectedSession.user.avatar} />
                      <AvatarFallback>
                        {selectedSession.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedSession.status === 'online' && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <CardTitle>{selectedSession.user.name}</CardTitle>
                    <CardDescription>{selectedSession.user.email}</CardDescription>
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
                    messages.map((message) => (
                      <div key={message.id} className="flex justify-start">
                        <div className="max-w-[70%] rounded-lg p-3 bg-muted">
                          <p className="text-sm">{message.message}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">No chat selected</h3>
                <p className="text-muted-foreground">
                  Select a chat session from the list to start chatting
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
      </div>
    </div>
  );
}

