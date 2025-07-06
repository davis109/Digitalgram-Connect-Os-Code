import React, { useState, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  MessageCircle,
  Volume2,
  Trash2
} from 'lucide-react';
import { VoiceFeedback as VoiceFeedbackType } from '../types';
import { OfflineManager } from '../utils/offlineManager';

const VoiceFeedback: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedbackList, setFeedbackList] = useState<VoiceFeedbackType[]>([]);
  
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

  const submitFeedback = () => {
    if (feedbackText.trim() || audioBlob) {
      const feedback: VoiceFeedbackType = {
        id: `feedback_${Date.now()}`,
        noticeId: 'general',
        audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : '',
        transcript: feedbackText,
        createdAt: new Date(),
        userId: 'user_1',
        status: 'pending'
      };

      const updatedFeedback = [...feedbackList, feedback];
      setFeedbackList(updatedFeedback);
      OfflineManager.saveVoiceFeedback(updatedFeedback);
      
      // Reset form
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Voice Feedback</h2>
      </div>

      <div className="space-y-6">
        {/* Recording Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Record Voice Message</h3>
          
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-4 rounded-full transition-colors ${
                isRecording 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
            
            <div className="flex-1">
              {isRecording ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-600 font-medium">Recording...</span>
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

        {/* Text Feedback */}
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

        {/* Submit Button */}
        <button
          onClick={submitFeedback}
          disabled={!feedbackText.trim() && !audioBlob}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Send className="w-5 h-5" />
          <span>Submit Feedback</span>
        </button>

        {/* Feedback List */}
        {feedbackList.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Feedback</h3>
            <div className="space-y-3">
              {feedbackList.map(feedback => (
                <div key={feedback.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(feedback.createdAt).toLocaleString()}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      feedback.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {feedback.status}
                    </span>
                  </div>
                  {feedback.transcript && (
                    <p className="text-gray-700 text-sm">{feedback.transcript}</p>
                  )}
                  {feedback.audioUrl && (
                    <div className="mt-2">
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