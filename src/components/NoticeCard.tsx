import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Calendar, 
  User, 
  AlertTriangle,
  Download,
  QrCode
} from 'lucide-react';
import { Notice } from '../types';
import { useNotices } from '../hooks/useNotices';
import { QRCodeManager } from '../utils/qrCodeUtils';

interface NoticeCardProps {
  notice: Notice;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

const NoticeCard: React.FC<NoticeCardProps> = ({ notice, showActions = true, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { playNoticeAudio } = useNotices();

  const getCategoryColor = (category: string): string => {
    const colors = {
      emergency: 'bg-red-100 text-red-800 border-red-200',
      agriculture: 'bg-green-100 text-green-800 border-green-200',
      health: 'bg-blue-100 text-blue-800 border-blue-200',
      education: 'bg-purple-100 text-purple-800 border-purple-200',
      schemes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      weather: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      employment: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      public: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category as keyof typeof colors] || colors.public;
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgent' || notice.isEmergency) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const handlePlayAudio = async () => {
    try {
      setIsPlaying(true);
      await playNoticeAudio(notice);
    } catch (error) {
      console.error('Failed to play audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleDownloadPoster = async () => {
    try {
      setIsDownloading(true);
      const pdfUrl = await QRCodeManager.createPoster(
        notice.title,
        notice.content,
        notice.qrCodeUrl || '',
        notice.language
      );
      
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `notice_${notice.id}.pdf`;
      link.click();
      
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error('Failed to download poster:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 p-6 transition-all duration-300 hover:shadow-lg ${
      notice.isEmergency ? 'border-l-red-500 bg-red-50' : 'border-l-green-500'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getPriorityIcon(notice.priority)}
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(notice.category)}`}>
            {notice.category.toUpperCase()}
          </span>
          {notice.isEmergency && (
            <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full border border-red-200 animate-pulse">
              EMERGENCY
            </span>
          )}
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePlayAudio}
              disabled={isPlaying}
              className={`p-2 rounded-full transition-colors ${
                isPlaying 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
              title="Play Audio"
            >
              {isPlaying ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={handleDownloadPoster}
              disabled={isDownloading}
              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              title="Download QR Poster"
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{notice.title}</h3>
      <p className="text-gray-700 mb-4 leading-relaxed">{notice.content}</p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>{notice.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {notice.qrCodeUrl && (
          <div className="flex items-center space-x-1 text-green-600">
            <QrCode className="w-4 h-4" />
            <span>QR Available</span>
          </div>
        )}
      </div>

      {notice.validUntil && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Valid until: {new Date(notice.validUntil).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default NoticeCard;