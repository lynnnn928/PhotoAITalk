# PhotoAITalk 📸🌿

**Turn your world into a language lesson.**

PhotoAITalk is a visual, AI-powered language learning application that transforms your everyday surroundings into immersive language lessons. By simply snapping a photo, the application uses advanced computer vision and generative AI to identify key objects, teach you vocabulary, and construct grammatical sentences based on the real scenes you capture.

## ✨ Core Features

### 📷 Visual Intelligence
- **Instant Analysis**: Snap a photo or upload an image, and **Gemini 2.5 Flash** instantly analyzes the scene.
- **Interactive Bubbles**: Semi-transparent interactive markers appear over key objects (e.g., "Sun", "Coffee", "Cat") based on their estimated position in the image.
- **Smart Mapping**: Vocabulary is mapped directly to the visual elements in your photo, creating strong memory associations.

### 🧠 Adaptive AI Personas
Instead of dry vocabulary lists, learn from three distinct AI personalities that provide context:
- **🐣 Beginner**: Provides simple, noun-focused sentences to build basic vocabulary (e.g., "I see a red apple.").
- **🤓 Grammar Geek**: Offers complex, grammatically rich sentences describing actions and relationships (e.g., "The apple is resting on the wooden table.").
- **🎭 Poetic Master**: Generates metaphorical and culturally relevant expressions (e.g., "Nature's sweet crimson gem basking in the light.").

### 🔊 Immersive Audio
- **Text-to-Speech**: High-quality, native-sounding audio generation for every object label and sentence, powered by **Gemini TTS**.
- **Pronunciation Practice**: Tap any word or sentence to listen and repeat.

### 🏡 Your Garden (Visual Notebook)
- **Masonry Layout**: A beautiful, responsive grid view of all your learning memories that adapts to any screen size.
- **Smart Sorting**: "Starred" and "Mastered" items are prioritized to help you focus on what matters.
- **Spaced Repetition**: A **Shuffle** feature randomizes your garden cards to help you review and retain information effectively.

### 📊 Progress & Personalization
- **Daily Goals**: Set a target for how many "Scenes" to capture each day to maintain your streak.
- **Stats Tracking**: Visualize your progress with dynamic Word, Sentence, and Scene counts on the Profile page.
- **Social Sharing**: Generate aesthetic, sharable posters of your learning notes with a single click.
- **Multi-Language**: Support for learning English, Chinese, Spanish, French, Japanese, Korean, German, Italian, Russian, and Portuguese.

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 (TypeScript)
- **Styling**: Tailwind CSS for a polished, mobile-first, and fluid design.
- **AI Integration**: Google GenAI SDK (`@google/genai`).
  - **Vision**: `gemini-2.5-flash` for multimodal object detection and scene description.
  - **Audio**: `gemini-2.5-flash-preview-tts` for dynamic text-to-speech.
- **Routing**: React Router v7.
- **Persistence**: LocalStorage for saving user progress, settings, and notes offline.
- **Icons**: Lucide React.

## 🚀 Getting Started

1. **Set your languages**: On first launch, choose your native language and the target language you want to learn.
2. **Plant a memory**: Click the floating **Camera** button in the bottom bar to add your first photo.
3. **Explore the detail view**:
   - Tap bubbles to see words in your target language.
   - Expand the AI comments to see translations.
   - Save interesting words to your "Collection".
4. **Review**: Visit your "Garden" to see all your past notes.

---

*Created with ❤️ and Google Gemini API.*
