import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatMessage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  order_id: number | null;
  content: string;
  timestamp: string;
  read: boolean;
}

interface ChatContextType {
  messages: Message[];
  activeConversationUser: { id: number; username: string } | null;
  setActiveConversationUser: (user: { id: number; username: string } | null) => void;
  sendMessage: (content: string, receiverId: number, orderId?: number) => Promise<void>;
  markAsRead: (messageIds: number[]) => Promise<void>;
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeConversationUser, setActiveConversationUser] = useState<{ id: number; username: string } | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get unread message count
  const { data: unreadCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Get messages for active conversation
  const { data: messages = [], isLoading: loading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/messages", activeConversationUser?.id],
    enabled: !!user && !!activeConversationUser,
    queryFn: async () => {
      if (!activeConversationUser) return [];
      const response = await apiRequest(
        "GET",
        `/api/messages?otherUserId=${activeConversationUser.id}`
      );
      return response.json();
    }
  });
  
  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: number[]) => {
      await apiRequest("POST", "/api/messages/mark-read", { messageIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark messages as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Send message via REST API (fallback if WebSocket is not available)
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, receiverId, orderId }: { content: string; receiverId: number; orderId?: number }) => {
      const response = await apiRequest("POST", "/api/messages", {
        receiver_id: receiverId,
        order_id: orderId || null,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", activeConversationUser?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      console.log("WebSocket connection established");
      // Authenticate the WebSocket connection
      newSocket.send(JSON.stringify({
        type: "authenticate",
        userId: user.id
      }));
    };
    
    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "new_message") {
          // Update messages if the message is from the active conversation
          if (activeConversationUser && 
              (data.message.sender_id === activeConversationUser.id || 
               data.message.receiver_id === activeConversationUser.id)) {
            queryClient.invalidateQueries({ queryKey: ["/api/messages", activeConversationUser.id] });
          }
          
          // Update unread count for all new messages
          queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
          
          // Show notification for new messages
          if (data.message.sender_id !== user.id) {
            toast({
              title: "New Message",
              description: data.message.content.substring(0, 50) + (data.message.content.length > 50 ? "..." : ""),
            });
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection error");
    };
    
    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
    };
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [user, queryClient, toast]);
  
  // Send message function (tries WebSocket first, falls back to REST API)
  const sendMessage = useCallback(
    async (content: string, receiverId: number, orderId?: number) => {
      if (!user) return;
      
      if (socket && socket.readyState === WebSocket.OPEN) {
        // Send via WebSocket
        socket.send(
          JSON.stringify({
            type: "chat_message",
            senderId: user.id,
            receiverId,
            orderId: orderId || null,
            content,
          })
        );
      } else {
        // Fallback to REST API
        await sendMessageMutation.mutateAsync({ content, receiverId, orderId });
      }
    },
    [user, socket, sendMessageMutation]
  );
  
  // Mark messages as read
  const markAsRead = useCallback(
    async (messageIds: number[]) => {
      if (messageIds.length > 0) {
        await markAsReadMutation.mutateAsync(messageIds);
      }
    },
    [markAsReadMutation]
  );
  
  return (
    <ChatContext.Provider
      value={{
        messages,
        activeConversationUser,
        setActiveConversationUser,
        sendMessage,
        markAsRead,
        loading,
        error,
        unreadCount: unreadCountData?.count || 0,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}