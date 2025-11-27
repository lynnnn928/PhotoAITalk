
export interface UserSettings {
  nativeLanguage: string;
  targetLanguage: string;
  dailyGoal: number;
  onboarded: boolean;
  apiKey?: string; // Optional custom API key
}

export interface InteractiveObject {
  id: string;
  label: string; // Target language
  nativeLabel: string; // Native language
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  isSaved?: boolean; // New: User collected this word
}

export type CommentPersona = 'Beginner' | 'Grammar Geek' | 'Poetic Master';

export interface AIComment {
  id: string;
  persona: CommentPersona;
  content: string; // Target language
  translation: string; // Native language
  isExpanded?: boolean;
  isSaved?: boolean; // New: User collected this sentence
}

export interface LearningNote {
  id: string;
  imageUrl: string;
  timestamp: number;
  objects: InteractiveObject[];
  comments: AIComment[];
  isStarred: boolean; // "Add to Vocabulary" (Keep for legacy/whole note context)
  isMastered: boolean; // "Heart"
  userSentence?: string;
}

export interface Stats {
  noteCount: number;
  wordCount: number;
  sentenceCount: number;
}
