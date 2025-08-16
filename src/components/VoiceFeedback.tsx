import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  MessageCircle,
  Volume2,
  Trash2,
  Loader
} from 'lucide-react';
import { VoiceFeedback as VoiceFeedbackType } from '../types';
import { OfflineManager } from '../utils/offlineManager';
import { AudioProcessor } from '../utils/audioProcessing';
import voiceIcon from '../assets/voice-icon.svg';
import licensedImage1 from '../assets/licensed-image (1).jpeg';
import licensedImage2 from '../assets/licensed-image (2).jpeg';
import licensedImage3 from '../assets/licensed-image (3).jpeg';

const VoiceFeedback: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedbackList, setFeedbackList] = useState<VoiceFeedbackType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const images = [licensedImage1, licensedImage2, licensedImage3];
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.play();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const processAudioWithGemini = async (audioBlob: Blob): Promise<string> => {
    try {
      setIsProcessing(true);
      const waveformData = await AudioProcessor.convertToWaveform(audioBlob);
      setWaveform(waveformData);
      return await AudioProcessor.transcribeAudio(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      return '';
    } finally {
      setIsProcessing(false);
    }
  };

  const submitFeedback = async () => {
    if (feedbackText.trim() || audioBlob) {
      let transcript = feedbackText;

      if (audioBlob) {
        const generatedText = await processAudioWithGemini(audioBlob);
        transcript = generatedText || feedbackText;
      }

      const feedback: VoiceFeedbackType = {
        id: `feedback_${Date.now()}`,
        noticeId: 'general',
        audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : '',
        transcript: transcript,
        createdAt: new Date(),
        userId: 'user_1',
        status: 'pending'
      };

      const updatedFeedback = [...feedbackList, feedback];
      setFeedbackList(updatedFeedback);
      OfflineManager.saveVoiceFeedback(updatedFeedback);
      
      setFeedbackText('');
      setAudioBlob(null);
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden min-h-[600px] max-w-4xl mx-auto my-8">
      <div className="absolute top-0 right-0 w-full h-48 opacity-30 transition-opacity duration-1000 bg-gradient-to-b from-transparent to-white z-0">
        <img 
          src={images[currentImageIndex]} 
          alt="Rural scene" 
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>
      <div className="flex items-center mb-6 relative z-10">
        <img src={voiceIcon} alt="Voice" className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Voice Feedback</h2>
      </div>
      <div className="space-y-6 relative z-10">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Record Voice Message</h3>
          <div className="flex flex-col space-y-4 mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-4 rounded-full transition-colors ${isRecording ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <div className="flex-1">
                {isRecording ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-600 font-medium">Recording...</span>
                    </div>
                    {waveform.length > 0 && (
                      <div className="h-24 bg-gray-50 rounded-lg p-2 flex items-center justify-center">
                        <div className="flex items-center space-x-1 w-full h-full">
                          {waveform.map((amplitude, index) => (
                            <div
                              key={index}
                              className="flex-1 bg-blue-500 rounded-full"
                              style={{
                                height: `${Math.max(amplitude * 100, 2)}%`,
                                transition: 'height 0.2s ease-in-out'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {isProcessing && (
                      <div className="flex items-center justify-center space-x-2 text-blue-600">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Processing audio...</span>
                      </div>
                    )}
                  </div>
                ) : audioBlob ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={playAudio}
                      disabled={isPlaying}
                      className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <span className="text-green-600">Recording ready</span>
                    <button
                      onClick={clearRecording}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500">Click to start recording</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Comments (Optional)
          </label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your feedback here..."
          />
        </div>

        <button
          onClick={submitFeedback}
          disabled={!feedbackText.trim() && !audioBlob}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Send className="w-5 h-5" />
          <span>Submit Feedback</span>
        </button>

        {feedbackList.length > 0 && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Your Feedback History</h3>
              <span className="text-sm text-gray-500">{feedbackList.length} items</span>
            </div>
            <div className="space-y-4">
              {feedbackList.map(feedback => (
                <div key={feedback.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(feedback.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span 
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        feedback.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}
                    >
                      {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                    </span>
                  </div>
                  {feedback.transcript && (
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <p className="text-gray-700 text-sm leading-relaxed">{feedback.transcript}</p>
                    </div>
                  )}
                  {feedback.audioUrl && (
                    <div className="mt-2 bg-gray-50 rounded-lg p-2">
                      <audio controls className="w-full">
                        <source src={feedback.audioUrl} type="audio/wav" />
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceFeedback;