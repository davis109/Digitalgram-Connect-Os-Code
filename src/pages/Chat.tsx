import React from 'react';
import { Navigate } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import { useAuth } from '../contexts/AuthContext';
import { ChatProvider } from '../contexts/ChatContext';

const Chat: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ChatProvider>
      <div className="container mx-auto px-4 py-8">
        <ChatInterface />
      </div>
    </ChatProvider>
  );
};

export default Chat;