import { Notice, VoiceFeedback } from '../types';

export class OfflineManager {
  private static readonly NOTICES_KEY = 'panchayat_notices';
  private static readonly FEEDBACK_KEY = 'panchayat_feedback';
  private static readonly AUDIO_KEY = 'panchayat_audio';

  static saveNotices(notices: Notice[]): void {
    try {
      localStorage.setItem(this.NOTICES_KEY, JSON.stringify(notices));
    } catch (error) {
      console.error('Failed to save notices offline:', error);
    }
  }

  static getNotices(): Notice[] {
    try {
      const data = localStorage.getItem(this.NOTICES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load notices from offline storage:', error);
      return [];
    }
  }

  static saveVoiceFeedback(feedback: VoiceFeedback[]): void {
    try {
      localStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(feedback));
    } catch (error) {
      console.error('Failed to save voice feedback offline:', error);
    }
  }

  static getVoiceFeedback(): VoiceFeedback[] {
    try {
      const data = localStorage.getItem(this.FEEDBACK_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load voice feedback from offline storage:', error);
      return [];
    }
  }

  static saveAudio(noticeId: string, audioBlob: Blob): void {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const audioData = reader.result as string;
        const existingAudio = JSON.parse(localStorage.getItem(this.AUDIO_KEY) || '{}');
        existingAudio[noticeId] = audioData;
        localStorage.setItem(this.AUDIO_KEY, JSON.stringify(existingAudio));
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Failed to save audio offline:', error);
    }
  }

  static getAudio(noticeId: string): string | null {
    try {
      const audioData = JSON.parse(localStorage.getItem(this.AUDIO_KEY) || '{}');
      return audioData[noticeId] || null;
    } catch (error) {
      console.error('Failed to load audio from offline storage:', error);
      return null;
    }
  }

  static clearStorage(): void {
    try {
      localStorage.removeItem(this.NOTICES_KEY);
      localStorage.removeItem(this.FEEDBACK_KEY);
      localStorage.removeItem(this.AUDIO_KEY);
    } catch (error) {
      console.error('Failed to clear offline storage:', error);
    }
  }

  static getStorageUsage(): { used: number; total: number } {
    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length;
        }
      }
      return { used, total: 5 * 1024 * 1024 }; // 5MB typical limit
    } catch (error) {
      return { used: 0, total: 0 };
    }
  }
}