import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  AlertTriangle,
  Bell,
  Volume2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { NoticeCategory } from '../types';
import { useNotices } from '../hooks/useNotices';
import NoticeCard from './NoticeCard';
import noticeIcon from '../assets/notice-icon.svg';

const NoticeBoard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { notices, loading, error, getNoticesByCategory, getEmergencyNotices } = useNotices();

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

  const categories: { value: NoticeCategory | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Notices', icon: '📋' },
    { value: 'emergency', label: 'Emergency', icon: '🚨' },
    { value: 'agriculture', label: 'Agriculture', icon: '🌾' },
    { value: 'health', label: 'Health', icon: '🏥' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'schemes', label: 'Schemes', icon: '🏛️' },
    { value: 'weather', label: 'Weather', icon: '🌤️' },
    { value: 'employment', label: 'Employment', icon: '💼' },
    { value: 'public', label: 'Public', icon: '📢' }
  ];

  const emergencyNotices = getEmergencyNotices();
  
  const filteredNotices = notices.filter(notice => {
    const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading notices...</p>
        </div>

        {/* Emergency Notices with Marquee Effect */}
        {emergencyNotices.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 emergency-notice">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2 enhanced-pulse" />
              <h3 className="text-lg font-bold text-red-800">Emergency Alerts</h3>
            </div>
            <div className="marquee-container overflow-hidden">
              <div className="marquee">
                {emergencyNotices.map(notice => (
                  <span key={notice.id} className="inline-block px-4 py-2 mr-6 bg-white rounded-md shadow-sm border-l-4 border-red-500">
                    <strong>{notice.title}</strong> - {notice.content.substring(0, 100)}...
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 vibrant-overlay-blue card-hover-effect">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <img src={noticeIcon} alt="Notice" className="w-8 h-8 mr-3 text-green-600 enhanced-pulse" />
            Digital Notice Board
          </h1>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <div className="flex items-center text-green-600 shimmer-bg px-2 py-1 rounded-full">
                <Wifi className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Online</span>
              </div>
            ) : (
              <div className="flex items-center text-orange-600 shimmer-bg px-2 py-1 rounded-full">
                <WifiOff className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Offline Mode</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Emergency Notices with Marquee Effect */}
        {emergencyNotices.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 emergency-notice">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2 enhanced-pulse" />
              <h3 className="text-lg font-bold text-red-800">Emergency Alerts</h3>
            </div>
            <div className="marquee-container overflow-hidden">
              <div className="marquee">
                {emergencyNotices.map(notice => (
                  <span key={notice.id} className="inline-block px-4 py-2 mr-6 bg-white rounded-md shadow-sm border-l-4 border-red-500">
                    <strong>{notice.title}</strong> - {notice.content.substring(0, 100)}...
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <p className="text-gray-600 mb-4">
          Stay informed with official announcements from your community
        </p>
        
        {/* Audio indicator */}
        <div className="flex items-center text-green-600 mb-4">
          <Volume2 className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium shimmer-bg px-2 py-1 rounded-full">Audio enabled for all notices</span>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notices..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all duration-300 hover:shadow-md focus:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md transition-all duration-300 hover:shadow-md shimmer-bg"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as NoticeCategory | 'all')}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Emergency Notices */}
      {emergencyNotices.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-xl font-bold text-red-800">Emergency Alerts</h2>
          </div>
          <div className="grid gap-4">
            {emergencyNotices.map(notice => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        </div>
      )}

      {/* Notice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice, index) => (
            <div key={notice.id} className="fade-in card-hover-effect" style={{animationDelay: `${index * 0.1}s`}}>
              <NoticeCard notice={notice} />
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-lg shadow-md p-6 text-center vibrant-overlay-blue">
            <p className="text-gray-600 mb-2">
              {selectedCategory !== 'all' ? 'No notices available in this category' : 'No notices found'}
            </p>
            {searchTerm && (
              <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
            )}
          </div>
        )}
      </div>
      
      {/* Notice count and last updated */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center text-sm text-gray-500">
        <div>Notices: {filteredNotices.length}</div>
        <div className="shimmer-bg px-2 py-1 rounded-full">Last updated: {new Date().toLocaleString()}</div>
      </div>
    </div>
  );
};

export default NoticeBoard;