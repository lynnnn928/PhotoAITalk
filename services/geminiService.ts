
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

interface TTSCallbacks {
  onPlaying?: () => void;
  onEnded?: () => void;
}

export const playTextToSpeech = async (text: string, callbacks?: TTSCallbacks, apiKey?: string, apiBaseUrl?: string) => {
  try {
    const ai = getAIClient(apiKey, apiBaseUrl);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
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
        if (callbacks?.onEnded) callbacks.onEnded();
        return;
      }

      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      const outputNode = outputAudioContext.createGain();
      
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        outputAudioContext,
        24000,
        1,
      );
      
      const source = outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputNode);
      outputNode.connect(outputAudioContext.destination);
      
      source.onended = () => {
        if (callbacks?.onEnded) callbacks.onEnded();
      };
      
      source.start();
      if (callbacks?.onPlaying) callbacks.onPlaying();

  } catch (error) {
    console.error("TTS Error:", error);
    if (callbacks?.onEnded) callbacks.onEnded();
  }
};
