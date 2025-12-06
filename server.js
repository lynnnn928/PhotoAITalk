import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ===== AI Client Management =====

// Initialize Tongyi Qianwen client
const getQwenClient = () => {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
        throw new Error('DASHSCOPE_API_KEY is not set');
    }
    return new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });
};

// Initialize Gemini client (using native SDK for image support)
const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
    }
    return new GoogleGenAI({ apiKey });
};

// Gemini-specific image analysis function
const analyzeWithGemini = async (base64Image, mimeType, prompt) => {
    const client = getGeminiClient();
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    console.log(`🤖 Trying Gemini with model: ${modelName}`);

    const response = await client.models.generateContent({
        model: modelName,
        contents: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Image,
                },
            },
            { text: prompt },
        ],
    });

    const content = response.text || '{}';

    // Extract JSON from response
    let jsonText = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
    }

    return JSON.parse(jsonText);
};

// POST /api/analyze - Image analysis endpoint with auto-failover
app.post('/api/analyze', async (req, res) => {
    try {
        const { base64Image, mimeType, nativeLang, targetLang } = req.body;

        if (!base64Image || !mimeType) {
            return res.status(400).json({ error: 'Missing required fields: base64Image, mimeType' });
        }

        const prompt = `Analyze this image for a language learner.
Native Language: ${nativeLang || 'English'}. 
Target Language: ${targetLang || 'Chinese'}.

Please respond in JSON format with the following structure:
{
  "objects": [
    {"label": "word in target language", "nativeLabel": "word in native language", "x": 50, "y": 30}
  ],
  "comments": [
    {"persona": "Beginner", "content": "sentence in target language", "translation": "sentence in native language"},
    {"persona": "Grammar Geek", "content": "sentence in target language", "translation": "sentence in native language"},
    {"persona": "Poetic Master", "content": "sentence in target language", "translation": "sentence in native language"}
  ]
}

Instructions:
1. Identify 3-5 distinct, key objects in the scene. Provide their name in the target language and native language. Estimate their center position (x, y) as a PERCENTAGE (0-100) from the top-left. DO NOT USE PIXELS. Example: "x": 50, "y": 50 is center.
2. Generate 3 comments from specific personas:
   - 'Beginner': A simple sentence that includes the identified object labels.
   - 'Grammar Geek': A conversational sentence that a native speaker might say in daily life, using more complex grammar structures (e.g., relative clauses, conditionals, or compound sentences).
   - 'Poetic Master': A short, metaphorical or poetic expression inspired by the mood of the image.
   
Provide translations for all comments. Return ONLY valid JSON, no other text.`;

        const provider = process.env.AI_PROVIDER || 'auto';
        let result = null;
        let usedProvider = null;

        // Helper function to validate response data
        const isValidResponse = (data) => {
            // Check if objects array exists and has valid items with coordinates
            const hasValidObjects = data.objects &&
                Array.isArray(data.objects) &&
                data.objects.length > 0 &&
                data.objects.some(obj =>
                    obj.label &&
                    typeof obj.x === 'number' &&
                    typeof obj.y === 'number'
                );

            // Check if comments array exists and has items
            const hasValidComments = data.comments &&
                Array.isArray(data.comments) &&
                data.comments.length > 0;

            return hasValidObjects && hasValidComments;
        };

        // Helper function to call AI service with retry
        const callAI = async (clientGetter, modelName, providerName, maxRetries = 2) => {
            let lastError = null;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const client = clientGetter();
                    console.log(`🤖 Trying ${providerName} with model: ${modelName} (attempt ${attempt}/${maxRetries})`);

                    const response = await client.chat.completions.create({
                        model: modelName,
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    {
                                        type: 'image_url',
                                        image_url: {
                                            url: `data:${mimeType};base64,${base64Image}`,
                                        },
                                    },
                                    {
                                        type: 'text',
                                        text: prompt,
                                    },
                                ],
                            },
                        ],
                    });

                    const content = response.choices[0]?.message?.content || '{}';

                    // Extract JSON from response
                    let jsonText = content;
                    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
                    if (jsonMatch) {
                        jsonText = jsonMatch[1].trim();
                    }

                    const data = JSON.parse(jsonText);

                    // Validate response data
                    if (!isValidResponse(data)) {
                        console.warn(`⚠️ ${providerName} returned incomplete data on attempt ${attempt}`);
                        if (attempt < maxRetries) {
                            console.log(`🔄 Retrying...`);
                            continue; // Retry
                        }
                    }

                    console.log(`✅ ${providerName} succeeded`);
                    console.log(`📊 Objects found: ${data.objects?.length || 0}`);
                    console.log(`💬 Comments found: ${data.comments?.length || 0}`);
                    if (data.objects && data.objects.length > 0) {
                        console.log(`🔍 First object:`, JSON.stringify(data.objects[0]));
                    }

                    // Ensure objects have valid coordinates (default to center if missing)
                    if (data.objects) {
                        data.objects = data.objects.map(obj => ({
                            ...obj,
                            x: typeof obj.x === 'number' ? obj.x : 50,
                            y: typeof obj.y === 'number' ? obj.y : 50,
                        }));
                    }

                    return data;
                } catch (error) {
                    console.error(`❌ ${providerName} failed on attempt ${attempt}:`, error.message);
                    lastError = error;
                    if (attempt < maxRetries) {
                        console.log(`🔄 Retrying in 1 second...`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }

            throw lastError || new Error(`${providerName} failed after ${maxRetries} attempts`);
        };

        // Auto-failover logic
        if (provider === 'auto') {
            // Try Qwen first
            try {
                const qwenModel = process.env.QWEN_MODEL || 'qwen-vl-plus';
                result = await callAI(getQwenClient, qwenModel, 'Tongyi Qianwen');
                usedProvider = 'qwen';
            } catch (qwenError) {
                console.log('🔄 Qwen failed, trying Gemini...');
                // Fallback to Gemini (using native SDK)
                try {
                    result = await analyzeWithGemini(base64Image, mimeType, prompt);
                    console.log(`✅ Gemini succeeded`);
                    console.log(`📊 Objects found: ${result.objects?.length || 0}`);
                    console.log(`💬 Comments found: ${result.comments?.length || 0}`);
                    usedProvider = 'gemini';
                } catch (geminiError) {
                    console.error('❌ Gemini failed:', geminiError.message);
                    throw new Error('Both Qwen and Gemini failed');
                }
            }
        } else if (provider === 'qwen') {
            const qwenModel = process.env.QWEN_MODEL || 'qwen-vl-plus';
            result = await callAI(getQwenClient, qwenModel, 'Tongyi Qianwen');
            usedProvider = 'qwen';
        } else if (provider === 'gemini') {
            result = await analyzeWithGemini(base64Image, mimeType, prompt);
            console.log(`✅ Gemini succeeded`);
            usedProvider = 'gemini';
        }

        // Add IDs to objects and comments
        const objects = (result.objects || []).map((obj, idx) => ({
            ...obj,
            id: `obj-${Date.now()}-${idx}`,
        }));

        const comments = (result.comments || []).map((com, idx) => ({
            ...com,
            id: `com-${Date.now()}-${idx}`,
        }));

        res.json({
            objects,
            comments,
            provider: usedProvider // Return which provider was used
        });
    } catch (error) {
        console.error('Analyze error:', error);
        res.status(500).json({ error: 'Failed to analyze image', details: error.message });
    }
});

// POST /api/translate - Translate a word/phrase in context
app.post('/api/translate', async (req, res) => {
    try {
        const { text, context, targetLang, nativeLang } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Missing required field: text' });
        }

        const prompt = `Translate the following word/phrase from ${targetLang || 'the source language'} to ${nativeLang || 'English'}.
Word: "${text}"
Context: "${context || ''}"

Provide the response in JSON format:
{
  "translation": "translation of the word",
  "pinyin": "pronunciation guide if applicable (e.g. pinyin for Chinese)",
  "explanation": "brief explanation of usage in this context (optional)"
}

Return ONLY valid JSON.`;

        const provider = process.env.AI_PROVIDER || 'auto';
        let result = null;

        // Reuse callAI logic or simple Gemini call
        // For simplicity, we'll try Gemini first as it's faster for small tasks, or Qwen if configured

        // Helper to parse JSON from AI response
        const parseAIResponse = (text) => {
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
                return { translation: text }; // Fallback
            } catch (e) {
                return { translation: text };
            }
        };

        if (provider === 'gemini' || provider === 'auto') {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });
                const resultAI = await model.generateContent(prompt);
                const responseText = resultAI.response.text();
                result = parseAIResponse(responseText);
            } catch (e) {
                console.error("Gemini translate failed:", e);
                if (provider === 'gemini') throw e;
            }
        }

        if (!result && (provider === 'qwen' || provider === 'auto')) {
            // Fallback to Qwen or primary Qwen
            try {
                const client = getQwenClient();
                const completion = await client.chat.completions.create({
                    model: process.env.QWEN_MODEL || 'qwen-vl-plus',
                    messages: [{ role: 'user', content: prompt }],
                });
                const responseText = completion.choices[0].message.content;
                result = parseAIResponse(responseText);
            } catch (e) {
                console.error("Qwen translate failed:", e);
                throw e;
            }
        }

        res.json(result);

    } catch (error) {
        console.error('Translate error:', error);
        res.status(500).json({ error: 'Failed to translate', details: error.message });
    }
});

// POST /api/tts - Text-to-speech endpoint (placeholder - Tongyi TTS needs separate integration)
app.post('/api/tts', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Missing required field: text' });
        }

        // TODO: Integrate Alibaba Cloud TTS service
        // For now, return empty audio to avoid frontend errors
        console.log('TTS requested for:', text);
        res.status(501).json({ error: 'TTS not yet implemented for Tongyi. Please use browser TTS.' });
    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: 'Failed to generate speech', details: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', provider: 'tongyi-qianwen', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    const provider = process.env.AI_PROVIDER || 'auto';
    const qwenModel = process.env.QWEN_MODEL || 'qwen-vl-plus';
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;

    console.log(`🚀 PhotoAITalk API Server running on http://localhost:${PORT}`);
    console.log(`📡 AI Service Configuration:`);
    console.log(`   Mode: ${provider === 'auto' ? '🔄 Auto-Failover' : provider === 'qwen' ? '🇨🇳 Qwen Only' : '🌐 Gemini Only'}`);
    console.log(`   Primary: Tongyi Qianwen (${qwenModel})`);
    console.log(`   Fallback: Gemini (${geminiModel}) ${hasGeminiKey ? '✅ Ready' : '❌ No API Key'}`);
    console.log(`\n   Endpoints:`);
    console.log(`   - POST /api/analyze  - Image analysis`);
    console.log(`   - POST /api/tts      - Text-to-speech (pending)`);
    console.log(`   - GET  /api/health   - Health check`);
});
