import { useState, useEffect, useCallback } from 'react';
import { Notice, VoiceFeedback } from '../types';
import { OfflineManager } from '../utils/offlineManager';

interface SyncStatus {
  lastSyncAttempt: Date | null;
  lastSuccessfulSync: Date | null;
  isSyncing: boolean;
  pendingChanges: number;
  error: string | null;
}

// Mock API endpoints - in a real app, these would be actual API calls
const API = {
  // Simulate API calls with local storage for the hackathon demo
  async fetchNotices(): Promise<Notice[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return OfflineManager.getNotices();
  },
  
  async pushNotices(notices: Notice[]): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, this would send data to a server
    console.log('Pushed notices to server:', notices);
  },
  
  async fetchFeedback(): Promise<VoiceFeedback[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return OfflineManager.getVoiceFeedback();
  },
  
  async pushFeedback(feedback: VoiceFeedback[]): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, this would send data to a server
    console.log('Pushed feedback to server:', feedback);
  }
};

export const useSyncData = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncAttempt: null,
    lastSuccessfulSync: null,
    isSyncing: false,
    pendingChanges: 0,
    error: null
  });
  
  // Calculate pending changes
  const calculatePendingChanges = useCallback(() => {
    // In a real app, this would track changes that haven't been synced
    // For the hackathon demo, we'll use a simple approach
    const notices = OfflineManager.getNotices();
    const feedback = OfflineManager.getVoiceFeedback();
    
    // Get the timestamp of the last sync
    const lastSync = syncStatus.lastSuccessfulSync?.getTime() || 0;
    
    // Count items created after the last sync
    const pendingNotices = notices.filter(notice => 
      new Date(notice.createdAt).getTime() > lastSync
    ).length;
    
    const pendingFeedback = feedback.filter(item => 
      new Date(item.createdAt).getTime() > lastSync
    ).length;
    
    return pendingNotices + pendingFeedback;
  }, [syncStatus.lastSuccessfulSync]);
  
  // Update pending changes count
  useEffect(() => {
    const pendingChanges = calculatePendingChanges();
    setSyncStatus(prev => ({ ...prev, pendingChanges }));
  }, [calculatePendingChanges]);
  
  // Sync data with server when online
  const syncData = async () => {
    if (!navigator.onLine) {
      setSyncStatus(prev => ({
        ...prev,
        lastSyncAttempt: new Date(),
        error: 'Cannot sync while offline'
      }));
      return;
    }

    try {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: true,
        lastSyncAttempt: new Date(),
        error: null
      }));

      // Get local data
      const localNotices = OfflineManager.getNotices();
      const localFeedback = OfflineManager.getVoiceFeedback();

      // Push local data to server
      await API.pushNotices(localNotices);
      await API.pushFeedback(localFeedback);

      // Pull latest data from server
      const serverNotices = await API.fetchNotices();
      const serverFeedback = await API.fetchFeedback();

      // In a real app, we would merge local and server data
      // For the hackathon demo, we'll just use the server data
      OfflineManager.saveNotices(serverNotices);
      OfflineManager.saveVoiceFeedback(serverFeedback);

      // Update sync status
      const now = new Date();
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSuccessfulSync: now,
        pendingChanges: 0
      }));

      return {
        success: true,
        timestamp: now
      };
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Sync failed. Please try again.'
      }));

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      // Don't sync immediately to avoid network instability
      setTimeout(() => syncData(), 2000);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Periodically check for pending changes
  useEffect(() => {
    const interval = setInterval(() => {
      const pendingChanges = calculatePendingChanges();
      setSyncStatus(prev => ({ ...prev, pendingChanges }));
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [calculatePendingChanges]);

  return {
    syncStatus,
    syncData,
    pendingChanges: syncStatus.pendingChanges
  };
};