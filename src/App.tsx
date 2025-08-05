import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Wifi, WifiOff } from 'lucide-react';
import NoticeBoard from './components/NoticeBoard';
import AdminPanel from './components/AdminPanel';
import VoiceFeedback from './components/VoiceFeedback';
import LanguageSelector from './components/LanguageSelector';
import SyncIndicator from './components/SyncIndicator';
import Navbar from './components/Navbar';
import RequireAuth from './components/RequireAuth';
import Auth from './pages/Auth';
import ProfilePage from './pages/ProfilePage';
import Chat from './pages/Chat';
import { AudioManager } from './utils/audioUtils';
import { useI18n } from './i18n/I18nContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const { t } = useI18n();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const initAudio = async () => {
      try {
        const audioManager = AudioManager.getInstance();
        await audioManager.initializeAudio();
        setIsAudioInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initAudio();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 fade-in">
          {/* Header */}
          <Navbar />

          {/* Status Indicators */}
          <div className="bg-gray-100 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-end space-x-4">
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="w-4 h-4 mr-1" />
                    <span className="text-xs">{t('app.status.online')}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <WifiOff className="w-4 h-4 mr-1" />
                    <span className="text-xs">{t('app.status.offline')}</span>
                  </div>
                )}
                
                {isAudioInitialized && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title={t('app.status.audioReady')} />
                )}
                
                <SyncIndicator />
              </div>
              
              <LanguageSelector />
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={
                <RequireAuth>
                  <NoticeBoard />
                </RequireAuth>
              } />
              <Route path="/admin" element={
                <RequireAuth>
                  <AdminPanel />
                </RequireAuth>
              } />
              <Route path="/feedback" element={
                <RequireAuth>
                  <VoiceFeedback />
                </RequireAuth>
              } />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              } />
              <Route path="/chat" element={
                <RequireAuth>
                  <Chat />
                </RequireAuth>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  {t('footer.tagline')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('footer.description')}
                </p>
                <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span>🌾 {t('footer.features.agriculture')}</span>
                  <span>•</span>
                  <span>🏥 {t('footer.features.health')}</span>
                  <span>•</span>
                  <span>📢 {t('footer.features.public')}</span>
                  <span>•</span>
                  <span>🔊 {t('footer.features.voice')}</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;