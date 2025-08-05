import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Message {
  _id?: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Chat {
  _id: string;
  title: string;
  category: 'general' | 'agriculture' | 'health' | 'education' | 'schemes' | 'weather' | 'employment';
  language: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  error: string | null;
  createChat: (title: string, category: string, language: string) => Promise<Chat>;
  getChats: () => Promise<void>;
  getChat: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Load chats when user changes
  useEffect(() => {
    if (user) {
      getChats();
    } else {
      setChats([]);
      setCurrentChat(null);
    }
  }, [user]);

  // Create a new chat
  const createChat = async (title: string, category: string, language: string): Promise<Chat> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/chat', {
        title,
        category,
        language
      });

      const newChat = response.data.data;
      setChats(prevChats => [newChat, ...prevChats]);
      setCurrentChat(newChat);
      setLoading(false);
      
      return newChat;
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || 'Failed to create chat';
      setError(message);
      throw new Error(message);
    }
  };

  // Get all chats
  const getChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/chat');
      setChats(response.data.data);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || 'Failed to fetch chats';
      setError(message);
    }
  };

  // Get a single chat
  const getChat = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/chat/${id}`);
      setCurrentChat(response.data.data);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || 'Failed to fetch chat';
      setError(message);
      throw new Error(message);
    }
  };

  // Send a message
  const sendMessage = async (content: string) => {
    if (!currentChat) {
      throw new Error('No active chat');
    }

    try {
      setLoading(true);
      setError(null);
      
      // Optimistically update UI
      const tempUserMessage: Message = {
        content,
        role: 'user',
        timestamp: new Date()
      };

      setCurrentChat(prevChat => {
        if (!prevChat) return null;
        return {
          ...prevChat,
          messages: [...prevChat.messages, tempUserMessage]
        };
      });

      // Send to server
      const response = await axios.post(`/api/chat/${currentChat._id}/message`, {
        content
      });

      const { userMessage, assistantMessage } = response.data.data;

      // Update with actual response
      setCurrentChat(prevChat => {
        if (!prevChat) return null;
        
        // Remove the temp message and add the actual messages
        const messages = [...prevChat.messages.slice(0, -1), userMessage, assistantMessage];
        
        return {
          ...prevChat,
          messages
        };
      });

      // Update the chat in the list
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat._id === currentChat._id) {
            return {
              ...chat,
              updatedAt: new Date()
            };
          }
          return chat;
        });
      });

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || 'Failed to send message';
      setError(message);
      
      // Revert the optimistic update
      if (currentChat) {
        getChat(currentChat._id);
      }
      
      throw new Error(message);
    }
  };

  // Delete a chat
  const deleteChat = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`/api/chat/${id}`);
      
      // Remove from state
      setChats(prevChats => prevChats.filter(chat => chat._id !== id));
      
      // If current chat is deleted, set to null
      if (currentChat && currentChat._id === id) {
        setCurrentChat(null);
      }
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || 'Failed to delete chat';
      setError(message);
      throw new Error(message);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        loading,
        error,
        createChat,
        getChats,
        getChat,
        sendMessage,
        deleteChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};