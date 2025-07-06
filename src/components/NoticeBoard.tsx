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

  const filteredNotices = notices.filter(notice => {
    const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const emergencyNotices = getEmergencyNotices();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading notices...</p>
        </div>
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="w-8 h-8 mr-3 text-green-600" />
            Digital Notice Board
          </h1>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <div className="flex items-center text-green-600">
                <Wifi className="w-5 h-5 mr-1" />
                <span className="text-sm">Online</span>
              </div>
            ) : (
              <div className="flex items-center text-orange-600">
                <WifiOff className="w-5 h-5 mr-1" />
                <span className="text-sm">Offline Mode</span>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">
          Stay informed with official announcements from your Gram Panchayat
        </p>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as NoticeCategory | 'all')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
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

      {/* Notice Grid */}
      <div className="grid gap-6">
        {filteredNotices.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No notices found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No notices available in this category'}
            </p>
          </div>
        ) : (
          filteredNotices.map(notice => (
            <NoticeCard key={notice.id} notice={notice} />
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Volume2 className="w-4 h-4 mr-1" />
            <span>Audio enabled</span>
          </div>
          <div className="flex items-center">
            <span>•</span>
          </div>
          <div>
            <span>Notices: {filteredNotices.length}</span>
          </div>
          <div className="flex items-center">
            <span>•</span>
          </div>
          <div>
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;