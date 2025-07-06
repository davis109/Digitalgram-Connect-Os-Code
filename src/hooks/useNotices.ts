import { useState, useEffect } from 'react';
import { Notice, NoticeCategory, NoticePriority } from '../types';
import { OfflineManager } from '../utils/offlineManager';
import { AudioManager } from '../utils/audioUtils';
import { QRCodeManager } from '../utils/qrCodeUtils';

export const useNotices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const offlineNotices = OfflineManager.getNotices();
      setNotices(offlineNotices);
    } catch (err) {
      setError('Failed to load notices');
      console.error('Error loading notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNotice = async (
    title: string,
    content: string,
    category: NoticeCategory,
    priority: NoticePriority,
    language: string = 'en-US',
    isEmergency: boolean = false,
    validUntil?: Date
  ): Promise<Notice> => {
    try {
      const audioManager = AudioManager.getInstance();
      
      // Generate QR code with notice data
      const noticeData = JSON.stringify({ title, content, language });
      const qrCodeUrl = await QRCodeManager.generateQRCode(noticeData);

      // Generate audio blob for offline use
      const audioBlob = await audioManager.generateAudioBlob(content, language);
      
      const notice: Notice = {
        id: `notice_${Date.now()}`,
        title,
        content,
        category,
        priority,
        language,
        createdAt: new Date(),
        validUntil,
        isEmergency,
        author: 'Admin',
        tags: [category, priority],
        qrCodeUrl,
        isOfflineAvailable: true
      };

      // Save audio for offline use
      OfflineManager.saveAudio(notice.id, audioBlob);

      const updatedNotices = [notice, ...notices];
      setNotices(updatedNotices);
      OfflineManager.saveNotices(updatedNotices);

      return notice;
    } catch (err) {
      setError('Failed to create notice');
      throw err;
    }
  };

  const deleteNotice = (id: string) => {
    const updatedNotices = notices.filter(notice => notice.id !== id);
    setNotices(updatedNotices);
    OfflineManager.saveNotices(updatedNotices);
  };

  const getNoticesByCategory = (category: NoticeCategory): Notice[] => {
    return notices.filter(notice => notice.category === category);
  };

  const getEmergencyNotices = (): Notice[] => {
    return notices.filter(notice => notice.isEmergency);
  };

  const playNoticeAudio = async (notice: Notice) => {
    try {
      const audioManager = AudioManager.getInstance();
      await audioManager.initializeAudio();
      
      // Try to play offline audio first
      const offlineAudio = OfflineManager.getAudio(notice.id);
      if (offlineAudio) {
        await audioManager.playAudio(offlineAudio);
      } else {
        // Fall back to TTS
        await audioManager.textToSpeech(notice.content, notice.language);
      }
    } catch (err) {
      setError('Failed to play audio');
      throw err;
    }
  };

  return {
    notices,
    loading,
    error,
    createNotice,
    deleteNotice,
    getNoticesByCategory,
    getEmergencyNotices,
    playNoticeAudio,
    refreshNotices: loadNotices
  };
};