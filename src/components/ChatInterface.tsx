import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { NoticeCategory } from '../types';
import { AlertTriangle } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('HEALTH');
  const [title, setTitle] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  
  const { 
    chats, 
    currentChat, 
    loading, 
    error, 
    createChat, 
    getChats, 
    getChat,
    sendMessage, 
    deleteChat 
  } = useChat();
  
  const { t } = useI18n();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChats();
  }, [getChats]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentChat) return;

    try {
      await sendMessage(message);
      setMessage('');
      // Scroll to bottom immediately and also after a short delay to ensure all content is rendered
      scrollToBottom();
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      // Error will be displayed through the ChatContext error state
    }
  };

  const handleCreateNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createChat(title, category);
      setTitle('');
      setShowNewChatForm(false);
    } catch (err: any) {
      console.error('Failed to create chat:', err);
      // Error will be displayed through the ChatContext error state
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (window.confirm(t('chat.confirmDelete'))) {
      try {
        await deleteChat(chatId);
      } catch (err: any) {
        console.error('Failed to delete chat:', err);
        // Error will be displayed through the ChatContext error state
      }
    }
  };

  if (!user) {
    return <div className="p-4">{t('chat.loginRequired')}</div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Chat List Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowNewChatForm(true)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            {t('chat.newChat')}
          </button>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          {loading && <div className="p-4 text-center">{t('common.loading')}</div>}
          {error && (
            <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg text-center text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span data-testid="error-message" className="font-medium">{error}</span>
            </div>
          )}
          
          {chats.length === 0 && !loading ? (
            <div className="p-4 text-center text-gray-500">{t('chat.noChats')}</div>
          ) : (
            <ul>
              {chats.map((chat) => (
                <li key={chat._id} className="border-b border-gray-200 last:border-b-0">
                  <div 
                    className={`p-3 flex justify-between items-center cursor-pointer hover:bg-gray-200 ${currentChat?._id === chat._id ? 'bg-gray-200' : ''}`}
                    onClick={() => getChat(chat._id)}
                  >
                    <div className="truncate">{chat.title}</div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat._id);
                      }}
                      className="text-red-500 hover:text-red-700"
                      aria-label={t('chat.delete')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow flex flex-col bg-white shadow-sm mx-4 my-4 rounded-lg border border-gray-200">
        {showNewChatForm ? (
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">{t('chat.createNewChat')}</h2>
            <form onSubmit={handleCreateNewChat}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                  {t('chat.title')}
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('chat.titlePlaceholder')}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                  {t('chat.category')}
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HEALTH">{t('categories.HEALTH')}</option>
                  <option value="AGRICULTURE">{t('categories.AGRICULTURE')}</option>
                  <option value="WEATHER">{t('categories.WEATHER')}</option>
                  <option value="EDUCATION">{t('categories.EDUCATION')}</option>
                  <option value="COMMUNITY">{t('categories.COMMUNITY')}</option>
                  <option value="EMERGENCY">{t('categories.EMERGENCY')}</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        ) : currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">{currentChat.title}</h2>
              <div className="text-sm text-gray-500">
                {t('categories.' + currentChat.category)}
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4">
              {currentChat.messages.length === 0 ? (
                <div className="text-center text-gray-500 my-8">
                  {t('chat.startConversation')}
                </div>
              ) : (
                <div className="space-y-4">
                  {currentChat.messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('chat.messagePlaceholder')}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={!message.trim() || loading}
                >
                  {loading ? t('common.sending') : t('chat.send')}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center p-8">
              <h2 className="text-2xl font-semibold mb-2">{t('chat.welcome')}</h2>
              <p className="text-gray-600 mb-6">{t('chat.selectOrCreate')}</p>
              <button
                onClick={() => setShowNewChatForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t('chat.startNewChat')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;