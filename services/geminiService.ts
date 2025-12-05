
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { InteractiveObject, AIComment } from "../types";

// Helper to encode/decode audio for TTS
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Helper to initialize AI client dynamically
const getAIClient = (customKey?: string, customBaseUrl?: string) => {
  // Priority: Function Arg -> LocalStorage (handled in app state) -> Env Var
  const key = customKey || process.env.API_KEY;
  if (!key) {
    console.warn("No API Key available");
  }
  
  // Clean up Base URL if provided
  let baseUrl = customBaseUrl?.trim();
  if (baseUrl && baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  // Pass configuration to GoogleGenAI
  // Note: The SDK supports baseUrl in ClientOptions
  return new GoogleGenAI({ 
    apiKey: key || '', 
    baseUrl: baseUrl 
  });
};

export const analyzeImage = async (
  base64Image: string,
  mimeType: string,
  nativeLang: string,
  targetLang: string,
  apiKey?: string,
  apiBaseUrl?: string
): Promise<{ objects: InteractiveObject[]; comments: AIComment[] }> => {
  
  const ai = getAIClient(apiKey, apiBaseUrl);

  const prompt = `
    Analyze this image for a language learner. 
    Native Language: ${nativeLang}. 
    Target Language: ${targetLang}.

    1. Identify 3-5 distinct, key objects in the scene. Provide their name in the target language and native language. Estimate their center position (x, y) as a percentage (0-100) from the top-left.
    2. Generate 3 comments from specific personas:
       - 'Beginner': A simple sentence that MUST explicitly include ALL of the identified object labels to describe what is in the scene.
       - 'Grammar Geek': A grammatically complete, complex sentence describing an action or relationship in the image.
       - 'Poetic Master': A short, metaphorical or poetic expression inspired by the mood of the image.
       Provide translations for all comments.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "Word in target language" },
                  nativeLabel: { type: Type.STRING, description: "Word in native language" },
                  x: { type: Type.NUMBER, description: "X position percentage (0-100)" },
                  y: { type: Type.NUMBER, description: "Y position percentage (0-100)" },
                },
                required: ["label", "nativeLabel", "x", "y"],
              },
            },
            comments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  persona: { type: Type.STRING, enum: ["Beginner", "Grammar Geek", "Poetic Master"] },
                  content: { type: Type.STRING, description: "Content in target language" },
                  translation: { type: Type.STRING, description: "Content in native language" },
                },
                required: ["persona", "content", "translation"],
              },
            },
          },
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);

    // Add IDs
    const objects = (data.objects || []).map((obj: any, idx: number) => ({
      ...obj,
      id: `obj-${Date.now()}-${idx}`,
    }));

    const comments = (data.comments || []).map((com: any, idx: number) => ({
      ...com,
      id: `com-${Date.now()}-${idx}`,
    }));

    return { objects, comments };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};

export const lookupWord = async (
  word: string,
  contextSentence: string,
  nativeLang: string,
  targetLang: string,
  apiKey?: string,
  apiBaseUrl?: string
): Promise<{ label: string; nativeLabel: string }> => {
  const ai = getAIClient(apiKey, apiBaseUrl);
  
  const prompt = `
    I am learning ${targetLang}. I clicked the word "${word}" in the sentence "${contextSentence}".
    Please explain this specific word.
    Return JSON:
    {
      "label": "${word}",
      "nativeLabel": "The translation or brief definition of '${word}' in ${nativeLang} based on the context."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            nativeLabel: { type: Type.STRING },
          },
        },
      },
    });
    
    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Lookup Word Error", error);
    // Fallback if AI fails: just return the word itself
    return { label: word, nativeLabel: "..." };
  }
};

interface TTSCallbacks {
  onPlaying?: () => void;
  onEnded?: () => void;
}

// Global Audio Context & Cache to improve performance and reduce latency
let audioContext: AudioContext | null = null;
const ttsCache = new Map<string, AudioBuffer>();
const activeFetches = new Map<string, Promise<AudioBuffer | null>>();

const getAudioContext = () => {
  if (!audioContext) {
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioCtor({ sampleRate: 24000 });
  }
  return audioContext;
};

function playBuffer(ctx: AudioContext, buffer: AudioBuffer, callbacks?: TTSCallbacks) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const outputNode = ctx.createGain();
  
  source.connect(outputNode);
  outputNode.connect(ctx.destination);
  
  source.onended = () => {
    callbacks?.onEnded?.();
  };
  
  source.start();
  callbacks?.onPlaying?.();
}

// Internal function to handle fetch, decode, and caching logic
const fetchAudioData = async (text: string, apiKey?: string, apiBaseUrl?: string): Promise<AudioBuffer | null> => {
  if (!text || !text.trim()) return null;

  const cleanText = text.replace(/\*+/g, '').trim();
  const cacheKey = `${cleanText}-${apiKey || 'default'}`;

  // 1. Check Memory Cache
  if (ttsCache.has(cacheKey)) {
    return ttsCache.get(cacheKey)!;
  }

  // 2. Check Active Fetches (Deduplication)
  if (activeFetches.has(cacheKey)) {
    return activeFetches.get(cacheKey)!;
  }

  // 3. Perform Fetch
  const fetchPromise = (async () => {
    try {
      const ai = getAIClient(apiKey, apiBaseUrl);
      const ctx = getAudioContext(); // Initialize context for decoding

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        console.warn("TTS: No audio data returned from model");
        return null;
      }

      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        ctx,
        24000,
        1,
      );
      
      // Cache the result
      ttsCache.set(cacheKey, audioBuffer);
      return audioBuffer;

    } catch (error) {
      console.error("TTS Error:", error);
      return null;
    } finally {
      activeFetches.delete(cacheKey);
    }
  })();

  activeFetches.set(cacheKey, fetchPromise);
  return fetchPromise;
};

// Fire and forget prefetcher
export const prefetchAudio = (text: string, apiKey?: string, apiBaseUrl?: string) => {
  fetchAudioData(text, apiKey, apiBaseUrl).catch(e => console.error("Prefetch error", e));
};

export const playTextToSpeech = async (text: string, callbacks?: TTSCallbacks, apiKey?: string, apiBaseUrl?: string) => {
  const ctx = getAudioContext();

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      console.warn("Could not resume audio context", e);
    }
  }

  // Fetch or get from cache
  const buffer = await fetchAudioData(text, apiKey, apiBaseUrl);
  
  if (buffer) {
    playBuffer(ctx, buffer, callbacks);
  } else {
    callbacks?.onEnded?.();
  }
};
