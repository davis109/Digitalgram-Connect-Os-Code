import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Settings, 
  MessageCircle, 
  Bell,
  Menu,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';
import NoticeBoard from './components/NoticeBoard';
import AdminPanel from './components/AdminPanel';
import VoiceFeedback from './components/VoiceFeedback';
import LanguageSelector from './components/LanguageSelector';
import SyncIndicator from './components/SyncIndicator';
import { AudioManager } from './utils/audioUtils';
import { useI18n } from './i18n/I18nContext';

type Tab = 'board' | 'admin' | 'feedback';

function App() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('board');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const tabs = [
    { id: 'board' as Tab, label: t('nav.board'), icon: Bell },
    { id: 'admin' as Tab, label: t('nav.admin'), icon: Settings },
    { id: 'feedback' as Tab, label: t('nav.feedback'), icon: MessageCircle }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'board':
        return <NoticeBoard />;
      case 'admin':
        return <AdminPanel />;
      case 'feedback':
        return <VoiceFeedback />;
      default:
        return <NoticeBoard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 fade-in">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 shimmer-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Home className="w-8 h-8 text-green-600 enhanced-pulse" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900 shimmer-bg px-2 py-1 rounded-md">{t('app.title')}</h1>
                <p className="text-sm text-gray-500">{t('app.subtitle')}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Status Indicators */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="w-5 h-5 mr-1" />
                    <span className="text-sm hidden sm:inline">{t('app.status.online')}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <WifiOff className="w-5 h-5 mr-1" />
                    <span className="text-sm hidden sm:inline">{t('app.status.offline')}</span>
                  </div>
                )}
                
                {isAudioInitialized && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title={t('app.status.audioReady')} />
                )}
                
                <SyncIndicator />
              </div>
              
              <LanguageSelector />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 text-base font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
  );
}

export default App;