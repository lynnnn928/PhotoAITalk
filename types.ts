export interface UserSettings {
  nativeLanguage: string;
  targetLanguage: string;
  onboarded: boolean;
}

export interface InteractiveObject {
  id: string;
  label: string; // Target language
  nativeLabel: string; // Native language
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
}

export type CommentPersona = 'Beginner' | 'Grammar Geek' | 'Poetic Master';

export interface AIComment {
  id: string;
  persona: CommentPersona;
  content: string; // Target language
  translation: string; // Native language
  isExpanded?: boolean;
}

export interface LearningNote {
  id: string;
  imageUrl: string;
  timestamp: number;
  objects: InteractiveObject[];
  comments: AIComment[];
  isStarred: boolean; // "Add to Vocabulary"
  isMastered: boolean; // "Heart"
  userSentence?: string;
}

export interface Stats {
  noteCount: number;
  wordCount: number;
  sentenceCount: number;
}