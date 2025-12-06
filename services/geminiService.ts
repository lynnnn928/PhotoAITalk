/**
 * GeminiService - Frontend API Client
 * Calls the backend API instead of AI services directly
 */

import { InteractiveObject, AIComment } from "../types";

// Backend API URL - dynamically determined based on environment
const getApiBaseUrl = () => {
  // Check if we're in production (Vercel, etc.)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Production: use Render backend
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
      return 'https://photoaitalk-api.onrender.com';
    }

    // Development: use local backend
    return `http://${hostname}:3001`;
  }

  return 'http://localhost:3001';
};

// ===== Core API Calls =====

export const analyzeImage = async (
  base64Image: string,
  mimeType: string,
  nativeLang: string,
  targetLang: string,
  _apiKey?: string,  // Ignored - backend handles API keys
  _apiBaseUrl?: string  // Ignored - we use our backend
): Promise<{ objects: InteractiveObject[]; comments: AIComment[] }> => {

  const response = await fetch(`${getApiBaseUrl()}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: base64Image,
      mimeType,
      nativeLanguage: nativeLang,
      targetLanguage: targetLang,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to analyze image');
  }

  const data = await response.json();

  // Add IDs if not present
  const objects = (data.objects || []).map((obj: any, idx: number) => ({
    ...obj,
    id: obj.id || `obj-${Date.now()}-${idx}`,
  }));

  const comments = (data.comments || []).map((com: any, idx: number) => ({
    ...com,
    id: com.id || `com-${Date.now()}-${idx}`,
  }));

  return { objects, comments };
};

export const translateWord = async (
  word: string,
  contextSentence: string,
  nativeLang: string,
  targetLang: string,
  _apiKey?: string,
  _apiBaseUrl?: string
): Promise<{ translation: string }> => {

  const response = await fetch(`${getApiBaseUrl()}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      word,
      context: contextSentence,
      nativeLanguage: nativeLang,
      targetLanguage: targetLang,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to translate word');
  }

  return await response.json();
};

export const lookupWord = async (
  word: string,
  contextSentence: string,
  nativeLang: string,
  targetLang: string,
  _apiKey?: string,
  _apiBaseUrl?: string
): Promise<{ label: string; nativeLabel: string }> => {

  const response = await fetch(`${getApiBaseUrl()}/api/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      word,
      context: contextSentence,
      nativeLanguage: nativeLang,
      targetLanguage: targetLang,
    }),
  });

  if (!response.ok) {
    return { label: word, nativeLabel: '...' };
  }

  return await response.json();
};

// ===== TTS (Text-to-Speech) =====

interface TTSCallbacks {
  onPlaying?: () => void;
  onEnded?: () => void;
}

// Try to use browser's native TTS first for better mobile support
const useBrowserTTS = (text: string, callbacks?: TTSCallbacks): boolean => {
  if (!('speechSynthesis' in window)) {
    return false;
  }

  // Check if iOS Safari - prefer browser TTS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    const utterance = new SpeechSynthesisUtterance(text);

    // Detect language
    const hasChineseChars = /[\u4e00-\u9fff]/.test(text);
    const hasJapaneseChars = /[\u3040-\u309f\u30a0-\u30ff]/.test(text);
    const hasKoreanChars = /[\uac00-\ud7af]/.test(text);

    if (hasChineseChars) utterance.lang = 'zh-CN';
    else if (hasJapaneseChars) utterance.lang = 'ja-JP';
    else if (hasKoreanChars) utterance.lang = 'ko-KR';
    else utterance.lang = 'en-US';

    utterance.onstart = () => callbacks?.onPlaying?.();
    utterance.onend = () => callbacks?.onEnded?.();
    utterance.onerror = () => callbacks?.onEnded?.();

    window.speechSynthesis.speak(utterance);
    return true;
  }

  return false;
};

// Backend TTS for desktop
const ttsCache = new Map<string, AudioBuffer>();
const activeFetches = new Map<string, Promise<AudioBuffer | null>>();
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioCtor({ sampleRate: 24000 });
  }
  return audioContext;
};

const fetchTTSFromBackend = async (text: string): Promise<AudioBuffer | null> => {
  if (!text.trim()) return null;

  const cacheKey = text.trim();

  if (ttsCache.has(cacheKey)) {
    return ttsCache.get(cacheKey)!;
  }

  if (activeFetches.has(cacheKey)) {
    return activeFetches.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.warn('TTS API failed, falling back to browser TTS');
        return null;
      }

      const data = await response.json();

      if (!data.audio) {
        return null;
      }

      // Decode base64 audio
      const binaryString = atob(data.audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert to AudioBuffer
      const ctx = getAudioContext();
      const dataInt16 = new Int16Array(bytes.buffer);
      const frameCount = dataInt16.length;
      const buffer = ctx.createBuffer(1, frameCount, 24000);
      const channelData = buffer.getChannelData(0);

      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      ttsCache.set(cacheKey, buffer);
      return buffer;

    } catch (error) {
      console.error('TTS fetch error:', error);
      return null;
    } finally {
      activeFetches.delete(cacheKey);
    }
  })();

  activeFetches.set(cacheKey, fetchPromise);
  return fetchPromise;
};

export const playTextToSpeech = async (
  text: string,
  callbacks?: TTSCallbacks,
  _apiKey?: string,
  _apiBaseUrl?: string
) => {
  // Try browser TTS first for iOS
  if (useBrowserTTS(text, callbacks)) {
    return;
  }

  // Use backend TTS for desktop
  const ctx = getAudioContext();

  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  const buffer = await fetchTTSFromBackend(text);

  if (buffer) {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => callbacks?.onEnded?.();
    source.start();
    callbacks?.onPlaying?.();
  } else {
    // Final fallback: try browser TTS even on desktop
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => callbacks?.onPlaying?.();
    utterance.onend = () => callbacks?.onEnded?.();
    utterance.onerror = () => callbacks?.onEnded?.();
    window.speechSynthesis.speak(utterance);
  }
};

export const prefetchAudio = (text: string, _apiKey?: string, _apiBaseUrl?: string) => {
  fetchTTSFromBackend(text).catch(e => console.error("Prefetch error", e));
};
