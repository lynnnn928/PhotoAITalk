# PhotoAITalk 📸🌿

**Turn your world into a language lesson.**

[English](#english) | [中文](#中文) | [Español](#español) | [Français](#français) | [日本語](#日本語) | [한국어](#한국어) | [Deutsch](#deutsch) | [Italiano](#italiano) | [Русский](#русский) | [Português](#português)

---

<a name="english"></a>
## English

PhotoAITalk is a visual, AI-powered language learning application that transforms your everyday surroundings into immersive language lessons. By simply snapping a photo, the application uses advanced computer vision and generative AI to identify key objects, teach you vocabulary, and construct grammatical sentences based on the real scenes you capture.

### ✨ Core Features

#### 📷 Visual Intelligence
- **Instant Analysis**: Snap a photo or upload an image, and **Gemini 2.5 Flash** instantly analyzes the scene.
- **Interactive Bubbles**: Semi-transparent interactive markers appear over key objects (e.g., "Sun", "Coffee", "Cat") based on their estimated position in the image.
- **Smart Mapping**: Vocabulary is mapped directly to the visual elements in your photo, creating strong memory associations.

#### 🧠 Adaptive AI Personas
Instead of dry vocabulary lists, learn from three distinct AI personalities that provide context:
- **🐣 Beginner**: Provides simple, noun-focused sentences to build basic vocabulary (e.g., "I see a red apple.").
- **🤓 Grammar Geek**: Offers complex, grammatically rich sentences describing actions and relationships (e.g., "The apple is resting on the wooden table.").
- **🎭 Poetic Master**: Generates metaphorical and culturally relevant expressions (e.g., "Nature's sweet crimson gem basking in the light.").

#### 🔊 Immersive Audio
- **Text-to-Speech**: High-quality, native-sounding audio generation for every object label and sentence, powered by **Gemini TTS**.
- **Pronunciation Practice**: Tap any word or sentence to listen and repeat.

#### 🏡 Your Garden (Visual Notebook)
- **Masonry Layout**: A beautiful, responsive grid view of all your learning memories that adapts to any screen size.
- **Smart Sorting**: "Starred" and "Mastered" items are prioritized to help you focus on what matters.
- **Spaced Repetition**: A **Shuffle** feature randomizes your garden cards to help you review and retain information effectively.

#### 📊 Progress & Personalization
- **Daily Goals**: Set a target for how many "Scenes" to capture each day to maintain your streak.
- **Stats Tracking**: Visualize your progress with dynamic Word, Sentence, and Scene counts on the Profile page.
- **Social Sharing**: Generate aesthetic, sharable posters of your learning notes with a single click.
- **Multi-Language**: Support for learning English, Chinese, Spanish, French, Japanese, Korean, German, Italian, Russian, and Portuguese.

### 🚀 Getting Started & Deployment

#### 🌐 Online Experience
Experience the app directly in your browser:
* **[Link to Live Demo / Vercel Deployment]**

#### 💻 Local Development
Run PhotoAITalk locally on your machine:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/photoaitalk.git
   cd photoaitalk
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

#### ⚙️ Custom API Configuration
PhotoAITalk supports custom API endpoints (e.g., proxies or gateways).
1. Go to **Profile** > **Settings**.
2. Enter your **API Key**.
3. Enter your **API Base URL** (Default is `https://generativelanguage.googleapis.com`).

### 🛠️ Technology Stack

- **Frontend Framework**: React 19 (TypeScript)
- **Styling**: Tailwind CSS for a polished, mobile-first, and fluid design.
- **AI Integration**: Google GenAI SDK (`@google/genai`).
- **Routing**: React Router v7.

---

<a name="中文"></a>
## 中文 (Chinese)

**把你的世界变成语言课堂。**

PhotoAITalk 是一款视觉化、AI 驱动的语言学习应用，它能将你周围的环境瞬间转化为沉浸式的语言课程。只需拍一张照片，应用就会利用先进的计算机视觉和生成式 AI 识别关键物体，根据你拍摄的真实场景教授词汇并构建语法句子。

### ✨ 核心功能

#### 📷 视觉智能
- **即时分析**：拍摄或上传照片，**Gemini 2.5 Flash** 会立即分析场景。
- **互动气泡**：半透明的互动标记会根据图像中的位置出现在关键物体（如“太阳”、“咖啡”、“猫”）上。
- **智能映射**：词汇直接映射到照片中的视觉元素，建立强大的记忆关联。

#### 🧠 自适应 AI 角色
告别枯燥的词汇表，向三位具有独特个性的 AI 学习：
- **🐣 初学者**：提供简单、以名词为主的句子，帮助建立基础词汇。
- **🤓 语法达人**：提供语法完整、复杂的句子，描述图像中的动作和关系。
- **🎭 诗意大师**：生成受图像意境启发的隐喻和文化表达。

### 🚀 快速开始与部署

#### 🌐 在线体验
直接在浏览器中体验应用：
* **[点击访问在线演示]**

#### 💻 本地部署
1. **克隆代码仓库**：
   ```bash
   git clone https://github.com/your-username/photoaitalk.git
   ```
2. **安装依赖**：`npm install`
3. **启动服务**：`npm run dev`
4. 访问 `http://localhost:5173`。

#### ⚙️ 自定义 API 配置 (替换接口)
本应用支持用户替换 API 接口地址（例如使用代理或自定义网关）。
1. 进入 **个人中心** > **设置**。
2. 输入您的 **API Key**。
3. 在 **API Base URL** 中输入自定义地址（例如：`https://my-custom-proxy.com`）。

---

<a name="español"></a>
## Español (Spanish)

**Convierte tu mundo en una lección de idiomas.**

PhotoAITalk es una aplicación de aprendizaje de idiomas visual impulsada por IA que transforma tu entorno cotidiano en lecciones inmersivas.

### ✨ Características Principales
- **Inteligencia Visual**: Análisis instantáneo con **Gemini 2.5 Flash**.
- **Personajes de IA**: Aprende con niveles Principiante, Experto y Poético.
- **Audio Inmersivo**: Texto a voz nativo para practicar pronunciación.

### 🚀 Despliegue y Uso

#### 🌐 Experiencia en Línea
* **[Enlace a la Demostración]**

#### 💻 Desarrollo Local
1. `npm install`
2. `npm run dev`

#### ⚙️ Configuración de API Personalizada
Puedes reemplazar el endpoint de la API en **Ajustes** > **URL Base de la API**.

---

<a name="français"></a>
## Français (French)

**Transformez votre monde en leçon de langue.**

PhotoAITalk est une application d'apprentissage des langues visuelle et alimentée par l'IA qui transforme votre environnement quotidien en leçons immersives.

### ✨ Fonctionnalités
- **Intelligence Visuelle**: Analyse de scène avec **Gemini 2.5 Flash**.
- **Personnages IA**: Apprenez avec des phrases adaptées à votre niveau.
- **Jardin Visuel**: Collectionnez vos souvenirs d'apprentissage.

### 🚀 Commencer

#### 🌐 Expérience en Ligne
* **[Lien vers la Démo]**

#### 💻 Déploiement Local
1. `npm install`
2. `npm run dev`

#### ⚙️ Configuration API
Vous pouvez configurer une **URL de base API** personnalisée dans les paramètres.

---

<a name="日本語"></a>
## 日本語 (Japanese)

**あなたの世界を語学の授業に変えよう。**

PhotoAITalkは、日常の風景を没入型の語学レッスンに変える、視覚的AI語学学習アプリです。

### ✨ 主な機能
- **視覚的インテリジェンス**: **Gemini 2.5 Flash** による即時シーン分析。
- **適応型AI**: 初心者から詩的な表現まで、3つのレベルで学習。
- **発音練習**: 高品質なAI音声合成。

### 🚀 始め方

#### 🌐 オンライン体験
* **[デモサイトへのリンク]**

#### 💻 ローカルでの実行
1. `npm install`
2. `npm run dev`

#### ⚙️ API設定 (インターフェースの置換)
設定画面で **API Base URL** を変更することで、独自のプロキシやゲートウェイを使用できます。

---

<a name="한국어"></a>
## 한국어 (Korean)

**당신의 세상을 언어 수업으로 바꿔보세요.**

PhotoAITalk는 일상의 주변 환경을 몰입형 언어 수업으로 바꿔주는 시각적 AI 기반 언어 학습 애플리케이션입니다.

### ✨ 핵심 기능
- **시각 지능**: **Gemini 2.5 Flash**를 통한 즉각적인 분석.
- **맞춤형 AI**: 초보자, 문법 전문가, 시적 거장 모드 지원.

### 🚀 시작하기

#### 🌐 온라인 체험
* **[라이브 데모 링크]**

#### 💻 로컬 배포
1. `npm install`
2. `npm run dev`

#### ⚙️ API 구성
설정 메뉴에서 **API 기본 URL**을 변경하여 맞춤형 인터페이스를 사용할 수 있습니다.

---

<a name="deutsch"></a>
## Deutsch (German)

**Verwandle deine Welt in eine Sprachlektion.**

PhotoAITalk ist eine visuelle, KI-gestützte Sprachlern-App.

### 🚀 Erste Schritte

#### 🌐 Online-Erlebnis
* **[Link zur Demo]**

#### 💻 Lokale Entwicklung
1. `npm install`
2. `npm run dev`

#### ⚙️ API-Konfiguration
Sie können die **API-Basis-URL** in den Einstellungen anpassen.

---

<a name="italiano"></a>
## Italiano (Italian)

**Trasforma il tuo mondo in una lezione di lingua.**

PhotoAITalk è un'applicazione di apprendimento linguistico visivo basata sull'IA.

### 🚀 Iniziare

#### 🌐 Esperienza Online
* **[Link alla Demo]**

#### 💻 Sviluppo Locale
1. `npm install`
2. `npm run dev`

#### ⚙️ Configurazione API
Puoi configurare un **URL Base API** personalizzato nelle impostazioni.

---

<a name="русский"></a>
## Русский (Russian)

**Превратите свой мир в урок иностранного языка.**

### 🚀 Начало работы

#### 🌐 Онлайн-опыт
* **[Ссылка на демо]**

#### 💻 Локальный запуск
1. `npm install`
2. `npm run dev`

#### ⚙️ Настройка API
Вы можете изменить **Базовый URL API** в настройках для использования прокси.

---

<a name="português"></a>
## Português (Portuguese)

**Transforme seu mundo em uma aula de idiomas.**

### 🚀 Começando

#### 🌐 Experiência Online
* **[Link para a Demo]**

#### 💻 Desenvolvimento Local
1. `npm install`
2. `npm run dev`

#### ⚙️ Configuração da API
Você pode definir uma **URL Base da API** personalizada nas configurações.

---

*Created with ❤️ and Google Gemini API.*
