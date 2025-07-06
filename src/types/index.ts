export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  language: string;
  audioUrl?: string;
  createdAt: Date;
  validUntil?: Date;
  isEmergency: boolean;
  author: string;
  tags: string[];
  qrCodeUrl?: string;
  isOfflineAvailable: boolean;
}

export type NoticeCategory = 
  | 'public'
  | 'emergency'
  | 'agriculture'
  | 'health'
  | 'education'
  | 'schemes'
  | 'weather'
  | 'employment';

export type NoticePriority = 'low' | 'medium' | 'high' | 'urgent';

export type UserRole = 'admin' | 'viewer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  language: string;
}

export interface VoiceFeedback {
  id: string;
  noticeId: string;
  audioUrl: string;
  transcript?: string;
  createdAt: Date;
  userId: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface AudioSettings {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
}