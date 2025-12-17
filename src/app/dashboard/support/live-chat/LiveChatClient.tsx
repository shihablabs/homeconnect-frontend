'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useChatSocket } from '@/hooks/useChatSocket';
import { AlertCircle, Loader2, MessageSquare, RefreshCw, Search, Send } from 'lucide-react';
import { useEffect, useState } from 'react';

// TODO: Create support chat API when backend is ready


export function LiveChatClient() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Use the chat socket hook
  const {
    conversations,
    messages,
    loading,
    isConnected,
    isPartnerOnline,
    isTyping,
    sendMessage,
    startTyping,
    stopTyping,
    fetchConversations,
    fetchMessages,
    markAsRead
  } = useChatSocket({
    partnerId: selectedSessionId || undefined,
    onNewMessage: () => {
      // Optional: scroll to bottom
    }
  });

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when session changes
  useEffect(() => {
    if (selectedSessionId) {
      fetchMessages(selectedSessionId);
      markAsRead(selectedSessionId);
    }
  }, [selectedSessionId, fetchMessages, markAsRead]);

  // Helper to get current session object
  const selectedSession = conversations.find(c => c.partner.id === selectedSessionId) || null;

  const handleSendMessage = async () => {
    if (!selectedSessionId || !newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage('');
  };

  const filteredSessions = conversations.filter((session) =>
    session.partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (session.partner.email && session.partner.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatLastActive = (dateString?: string) => {
    if (!dateString) return 'Offline';
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000 / 60; // minutes

    if (diff < 1) return 'Active just now';
    if (diff < 60) return `Active ${Math.floor(diff)}m ago`;
    if (diff < 1440) return `Active ${Math.floor(diff / 60)}h ago`;
    return `Active ${date.toLocaleDateString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground mt-1">
              {isConnected ? (
                <span className="flex items-center text-green-600 gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center text-red-500 gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Disconnected
                </span>
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchConversations()}
            disabled={loading}
          >
            {loading ? (
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
            <CardHeader className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2">
              {conversations.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No conversations</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredSessions.map((session) => (
                    <div
                      key={session.partner.id}
                      onClick={() => setSelectedSessionId(session.partner.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedSessionId === session.partner.id
                        ? 'bg-primary/10'
                        : 'hover:bg-muted'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={session.partner.avatar} />
                            <AvatarFallback>
                              {session.partner.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {/* We need to check socket onlineUsers here, but useChatSocket only returns isPartnerOnline for the SELECTED partner. 
                            Ideally we'd expose the whole set or a helper function. 
                            For now, we can rely on the 'isOnline' property from the API which is static until refresh. 
                            TODO: Expose checkOnlineStatus(id) from useChatSocket */}
                          {session.partner.isOnline && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white ring-1 ring-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold truncate text-sm">{session.partner.name}</div>
                            {session.unreadCount > 0 && (
                              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                {session.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <p className={`text-xs truncate max-w-[140px] ${session.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                              {session.lastMessage?.isFromMe ? 'You: ' : ''}{session.lastMessage?.content || 'No messages'}
                            </p>
                            {session.lastMessage?.timestamp && (
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                {new Date(session.lastMessage.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
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
                <CardHeader className="border-b p-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={selectedSession.partner.avatar} />
                        <AvatarFallback>
                          {selectedSession.partner.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isPartnerOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{selectedSession.partner.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {isPartnerOnline ? (
                          <span className="text-green-600 font-medium">Active Now</span>
                        ) : (
                          <span>{formatLastActive(selectedSession.partner.lastActive)}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 min-h-0 bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
                    {/* Messages are reversed in hook, but we display column-reverse usually for chat? 
                      Actually hook fetches reverse() from backend (oldest first). 
                      Let's check useChatSocket. fetchMessages sets them reversed? 
                      "setMessages(response.messages.reverse())" -> oldest first.
                      So we should render normally top-down and scroll to bottom. 
                      Or use flex-col-reverse and reverse array. 
                      Let's stick to standard flex-col and scroll to bottom. */}
                    <div className="flex flex-col space-y-4 justify-end min-h-full">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                          <MessageSquare className="h-10 w-10 mb-2" />
                          <p>Say hello to {selectedSession.partner.name}!</p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isMe = message.sender.id !== selectedSession.partner.id; // OR verify with my ID if available
                          // Rely on message structure. Backend fills sender/receiver.
                          // We need current user ID to know who is 'me'. 
                          // Typically accessible via auth context or similar. 
                          // Hack: assume if sender.id !== partner.id, it is me (since chat is 1-on-1).

                          return (
                            <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-white dark:bg-slate-800 border rounded-tl-none'
                                }`}>
                                <p>{message.message}</p>
                                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {isMe && (
                                    <span className="ml-1">
                                      {message.isRead ? '✓✓' : '✓'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-full px-4 py-2 text-xs text-muted-foreground animate-pulse">
                            {selectedSession.partner.name} is typing...
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-background border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          startTyping();
                        }}
                        onBlur={() => stopTyping()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={!isConnected}
                        className="bg-muted/50 border-0 focus-visible:ring-1"
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim() || !isConnected} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center text-center p-8">
                <div className="max-w-md">
                  <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                  <p className="text-muted-foreground">
                    Select a conversation from the sidebar to continue chatting or start a new one.
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

