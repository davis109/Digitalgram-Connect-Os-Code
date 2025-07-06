export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async initializeAudio(): Promise<void> {
    try {
      this.audioContext = new AudioContext();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }

  async textToSpeech(text: string, language: string = 'en-US'): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('Speech synthesis not supported');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      speechSynthesis.speak(utterance);
    });
  }

  async playAudio(audioUrl: string): Promise<void> {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Audio playback failed'));

      audio.play().catch(reject);
    });
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    speechSynthesis.cancel();
  }

  async generateAudioBlob(text: string, language: string = 'en-US'): Promise<Blob> {
    // For production, integrate with a proper TTS service
    // This is a placeholder implementation
    return new Blob([text], { type: 'audio/wav' });
  }
}