import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  orderId: number | null;
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

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationUser, setActiveConversationUser] = useState<{ id: number; username: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch messages for the active conversation
  useEffect(() => {
    if (!user || !activeConversationUser) {
      setMessages([]);
      return;
    }
    
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/messages?otherUserId=${activeConversationUser.id}`,
          { credentials: 'include' }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up polling for new messages every 5 seconds
    const intervalId = setInterval(fetchMessages, 5000);
    
    return () => clearInterval(intervalId);
  }, [user, activeConversationUser]);
  
  // Fetch unread count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/messages/unread-count', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          return;
        }
        
        const data = await response.json();
        setUnreadCount(data.count);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };
    
    fetchUnreadCount();
    
    // Poll for unread count every 10 seconds
    const intervalId = setInterval(fetchUnreadCount, 10000);
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  const sendMessage = async (content: string, receiverId: number, orderId?: number) => {
    if (!user) return;
    
    try {
      const response = await apiRequest('POST', '/api/messages', {
        receiverId,
        content,
        orderId: orderId || null
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  };
  
  const markAsRead = async (messageIds: number[]) => {
    if (!messageIds.length) return;
    
    try {
      await apiRequest('POST', '/api/messages/mark-read', { messageIds });
      
      // Update local messages
      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - messageIds.length));
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };
  
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
        unreadCount
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
