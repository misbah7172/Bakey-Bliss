import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, User } from 'lucide-react';

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Since the actual chat context may not be implemented yet, we'll mock it
  const fakeChat = {
    messages: [],
    activeConversationUser: null,
    setActiveConversationUser: () => {},
    sendMessage: async () => {},
    markAsRead: async () => {},
    loading: false,
    error: null,
    unreadCount: 0
  };
  
  const chat = useChat ? useChat() : fakeChat;

  useEffect(() => {
    // Scroll to the bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !chat.activeConversationUser) return;

    try {
      await chat.sendMessage(message, chat.activeConversationUser.id);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // For demo purposes, let's create some mock data
  const ordersBakers = [
    { id: 1, username: 'john_baker', role: 'main_baker', order_id: 123 },
    { id: 2, username: 'jane_baker', role: 'junior_baker', order_id: 124 }
  ];

  const renderUserList = () => {
    if (activeTab === 'current' && (!ordersBakers || ordersBakers.length === 0)) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">No bakers assigned to your orders yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 p-2">
        {ordersBakers.map((baker) => (
          <div
            key={baker.id}
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent/10 ${
              chat.activeConversationUser?.id === baker.id ? 'bg-accent/20' : ''
            }`}
            onClick={() => chat.setActiveConversationUser({ id: baker.id, username: baker.username })}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={null} alt={baker.username} />
              <AvatarFallback>{baker.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{baker.username}</p>
              <p className="text-xs text-muted-foreground">
                {baker.role === 'main_baker' ? 'Main Baker' : 'Junior Baker'} • Order #{baker.order_id}
              </p>
            </div>
            {/* You would show unread messages count here */}
          </div>
        ))}
      </div>
    );
  };

  const renderEmptyChat = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <MessageCircle className="h-12 w-12 text-muted-foreground mb-2" />
      <h3 className="text-lg font-medium">No conversation selected</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Select a baker from the list to start chatting about your order.
      </p>
    </div>
  );

  const renderChatMessages = () => {
    if (!chat.activeConversationUser) {
      return renderEmptyChat();
    }

    if (chat.loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (chat.messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <MessageCircle className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No messages yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Send a message to start the conversation with {chat.activeConversationUser.username}.
          </p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4 p-4">
          {chat.messages.map((msg) => {
            const isFromMe = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    isFromMe
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-card">
      {/* User List Panel */}
      <div className="w-1/3 border-r">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="p-4 border-b">
            <TabsList className="w-full">
              <TabsTrigger value="current" className="flex-1">
                Current
              </TabsTrigger>
              <TabsTrigger value="previous" className="flex-1">
                Previous
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="current" className="mt-0">
            {renderUserList()}
          </TabsContent>
          
          <TabsContent value="previous" className="mt-0">
            <div className="p-4 text-center">
              <p className="text-muted-foreground">Chat history for previous orders will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        <CardHeader className="py-3 px-4 border-b">
          {chat.activeConversationUser ? (
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={null} alt={chat.activeConversationUser.username} />
                <AvatarFallback>
                  {chat.activeConversationUser.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-base">{chat.activeConversationUser.username}</CardTitle>
            </div>
          ) : (
            <CardTitle className="text-base">Chat</CardTitle>
          )}
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          {renderChatMessages()}
        </CardContent>

        {chat.activeConversationUser && (
          <CardFooter className="p-4 pt-2 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        )}
      </div>
    </div>
  );
}