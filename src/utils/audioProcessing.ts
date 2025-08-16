import axios from 'axios';
import env from '../config/env';

export class AudioProcessor {
  private static GEMINI_API_KEY = env.GEMINI_API_KEY;

  static async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(audioBlob);
      });

      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          contents: [{
            parts: [{
              text: 'Please transcribe this audio:',
              inlineData: {
                mimeType: 'audio/wav',
                data: base64Audio
              }
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.GEMINI_API_KEY
          }
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      }

      throw new Error('Invalid response format from Gemini API. Please check your API key and request format.');
    } catch (error) {
      console.error('Audio transcription error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your Gemini API configuration.');
        } else if (error.response?.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        }
      }
      throw new Error('Failed to process audio. Please try again.');
    }
  }

  static async convertToWaveform(audioBlob: Blob): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async () => {
        try {
          const arrayBuffer = fileReader.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const channelData = audioBuffer.getChannelData(0);
          const samples = 100;
          const blockSize = Math.floor(channelData.length / samples);
          const waveform = [];

          for (let i = 0; i < samples; i++) {
            const start = blockSize * i;
            let sum = 0;
            
            for (let j = 0; j < blockSize; j++) {
              sum += Math.abs(channelData[start + j]);
            }
            
            waveform.push(sum / blockSize);
          }

          resolve(waveform);
        } catch (error) {
          reject(error);
        } finally {
          audioContext.close();
        }
      };

      fileReader.onerror = () => reject(fileReader.error);
      fileReader.readAsArrayBuffer(audioBlob);
    });
  }
}