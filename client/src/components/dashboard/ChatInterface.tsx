import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/contexts/ChatContext";
import { Message } from "@/contexts/ChatContext";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, User as UserIcon } from "lucide-react";

export default function ChatInterface() {
  const { user } = useAuth();
  const { 
    messages, 
    activeConversationUser, 
    setActiveConversationUser, 
    sendMessage, 
    markAsRead,
    loading,
    unreadCount
  } = useChat();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Query to get all users for potential conversations
  const { data: users = [], isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return response.json();
    }
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (!messagesEndRef.current || !messages.length) return;
    
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Use requestAnimationFrame to ensure the DOM has updated
    requestAnimationFrame(scrollToBottom);
  }, [messages.length]); // Only depend on messages length
  
  // Mark unread messages as read when viewing conversation
  useEffect(() => {
    if (!messages.length || !activeConversationUser || !user) return;
    
    const unreadMessageIds = messages
      .filter(msg => msg.receiver_id === user.id && !msg.read)
      .map(msg => msg.id);
    
    if (unreadMessageIds.length > 0) {
      markAsRead(unreadMessageIds);
    }
  }, [messages, activeConversationUser, user, markAsRead]);
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !activeConversationUser) return;
    
    try {
      await sendMessage(messageText, activeConversationUser.id);
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  // Get filtered users based on role restrictions
  const filteredUsers = useMemo(() => {
    if (!users.length || !user) return [];
    
    return users.filter(u => {
      // Don't show current user
      if (u.id === user.id) return false;
      
      // Role-based filtering
      if (user.role === "customer") {
        return ["junior_baker", "main_baker", "admin"].includes(u.role);
      } else if (user.role === "junior_baker") {
        return ["customer", "main_baker", "admin"].includes(u.role);
      } else if (user.role === "main_baker") {
        return ["customer", "junior_baker", "admin"].includes(u.role);
      } else if (user.role === "admin") {
        return true;
      }
      return false;
    });
  }, [users, user]);
  
  // Count unread messages per user
  const unreadByUser = useMemo(() => {
    return filteredUsers.reduce((acc, user) => {
      const count = messages.filter(
        msg => msg.sender_id === user.id && !msg.read
      ).length;
      
      if (count > 0) {
        acc[user.id] = count;
      }
      
      return acc;
    }, {} as Record<number, number>);
  }, [filteredUsers, messages]);
  
  // Format timestamp to readable time
  const formatTime = (timestamp: string | Date | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Messages {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 flex">
        <Tabs defaultValue="chats" className="w-full flex flex-col h-full">
          <TabsList className="grid grid-cols-2 mb-2 mx-4">
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chats" className="flex flex-col flex-grow px-4">
            {activeConversationUser ? (
              <>
                <div className="flex items-center pb-4 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveConversationUser(null)}
                    className="mr-2"
                  >
                    Back
                  </Button>
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>
                      {activeConversationUser.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{activeConversationUser.username}</span>
                </div>
                
                <ScrollArea className="flex-grow my-4 pr-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === user?.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.sender_id === user?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary"
                            }`}
                          >
                            <div className="break-words">{message.content}</div>
                            <div
                              className={`text-xs mt-1 ${
                                message.sender_id === user?.id
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow"
                  />
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-grow">
                <div className="text-sm font-medium mb-2">Recent Conversations</div>
                {loadingUsers ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No conversations yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => setActiveConversationUser({ id: u.id, username: u.username })}
                        className="flex items-center p-2 rounded-md hover:bg-secondary cursor-pointer"
                      >
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>{u.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <div className="font-medium">{u.username}</div>
                          <div className="text-sm text-muted-foreground">
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1).replace('_', ' ')}
                          </div>
                        </div>
                        {unreadByUser[u.id] && (
                          <Badge className="ml-2">{unreadByUser[u.id]}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="contacts" className="px-4 flex-grow overflow-auto">
            <div className="text-sm font-medium mb-2">All Users</div>
            {loadingUsers ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No other users found.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setActiveConversationUser({ id: u.id, username: u.username })}
                    className="flex items-center p-2 rounded-md hover:bg-secondary cursor-pointer"
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>{u.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <div className="font-medium">{u.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1).replace('_', ' ')}
                      </div>
                    </div>
                    {unreadByUser[u.id] && (
                      <Badge className="ml-2">{unreadByUser[u.id]}</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-2 text-xs text-muted-foreground">
        Messages are end-to-end encrypted
      </CardFooter>
    </Card>
  );
}