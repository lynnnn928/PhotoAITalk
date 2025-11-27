
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Camera, Home, User, Settings, Loader2, RefreshCw, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, Share2, Volume2, Download, ArrowRight, Check, Zap, Globe, LogOut, Shuffle, LayoutGrid, Key, ArrowDown, Bookmark, Flower, BookOpen, Star, Sprout, Leaf, AlignVerticalJustifyCenter, Square, Layers, AlertCircle, Link } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

import { UserSettings, LearningNote, Stats, InteractiveObject, AIComment } from './types';
import * as GeminiService from './services/geminiService';

// --- Constants ---

const THEME_COLOR = '#34C759'; // Fresh Green

const LANGUAGES = [
  { code: 'English', label: 'English', flag: '🇺🇸' },
  { code: 'Chinese', label: '中文', flag: '🇨🇳' },
  { code: 'Spanish', label: 'Español', flag: '🇪🇸' },
  { code: 'French', label: 'Français', flag: '🇫🇷' },
  { code: 'Japanese', label: '日本語', flag: '🇯🇵' },
  { code: 'Korean', label: '한국어', flag: '🇰🇷' },
  { code: 'German', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'Italian', label: 'Italiano', flag: '🇮🇹' },
  { code: 'Russian', label: 'Русский', flag: '🇷🇺' },
  { code: 'Portuguese', label: 'Português', flag: '🇧🇷' },
];

const TRANSLATIONS: Record<string, any> = {
  English: {
    nativeTitle: "What is your native language?",
    nativeDesc: "We'll translate everything into this language.",
    targetTitle: "What do you want to learn?",
    targetDesc: "Pick a language to start your immersive journey.",
    back: "Back",
    loading: "Observing the scene...",
    garden: "Garden",
    collection: "Collection",
    savedWords: "Words",
    savedSentences: "Sentences",
    noSavedItems: "No collected items yet.",
    searchPlaceholder: "Search your world...",
    practicePlaceholder: "Practice a sentence...",
    reviewComplete: "Review Complete!",
    reviewDesc: "You've reached the end of your garden path.",
    shuffleReview: "Shuffle & Review",
    returnGarden: "Return to Garden",
    share: "Share",
    close: "Close",
    save: "Save Poster",
    dailyGoal: "Daily Goal",
    scenes: "Scenes",
    words: "Words",
    mastered: "Mastered",
    settings: "Settings",
    logout: "Log Out",
    goalComplete: "Goal completed! Great job! 🎉",
    goalProgress: (n: number) => `Capture ${n} more photos to reach your goal.`,
    apiKey: "API Configuration",
    apiKeyDesc: "Enter your Gemini API Key (Optional)",
    apiKeyPlaceholder: "Paste your API key here...",
    emptyStateTitle: "Your garden is empty",
    emptyStateDesc: "Capture your first photo to start planting memories.",
    layoutOverlay: "Overlay",
    layoutBelow: "Below",
    noMorePhotos: "No more photos, upload more!",
    apiBaseUrl: "API Base URL (Optional)",
    apiBaseUrlPlaceholder: "https://generativelanguage.googleapis.com",
  },
  Chinese: {
    nativeTitle: "您的母语是？",
    nativeDesc: "我们将把所有内容翻译成这种语言。",
    targetTitle: "您想学习什么语言？",
    targetDesc: "选择一种语言开始您的沉浸式旅程。",
    back: "返回",
    loading: "正在观察场景...",
    garden: "花园",
    collection: "收藏",
    savedWords: "单词",
    savedSentences: "句子",
    noSavedItems: "暂无收藏内容。",
    searchPlaceholder: "搜索你的世界...",
    practicePlaceholder: "练习造句...",
    reviewComplete: "复习完成！",
    reviewDesc: "您已浏览完花园小径。",
    shuffleReview: "随机复习",
    returnGarden: "返回花园",
    share: "分享",
    close: "关闭",
    save: "保存海报",
    dailyGoal: "每日目标",
    scenes: "场景",
    words: "单词",
    mastered: "已掌握",
    settings: "设置",
    logout: "登出",
    goalComplete: "目标达成！太棒了！🎉",
    goalProgress: (n: number) => `再拍 ${n} 张照片即可达成目标。`,
    apiKey: "API 配置",
    apiKeyDesc: "输入您的 Gemini API 密钥（可选）",
    apiKeyPlaceholder: "在此粘贴您的 API 密钥...",
    emptyStateTitle: "您的花园是空的",
    emptyStateDesc: "拍摄第一张照片，开始种植记忆。",
    layoutOverlay: "覆盖",
    layoutBelow: "下方",
    noMorePhotos: "没有图片了，上传更多图片吧",
    apiBaseUrl: "API 基础地址 (可选)",
    apiBaseUrlPlaceholder: "https://generativelanguage.googleapis.com",
  },
  Spanish: {
    nativeTitle: "¿Cuál es tu lengua materna?",
    nativeDesc: "Traduciremos todo a este idioma.",
    targetTitle: "¿Qué quieres aprender?",
    targetDesc: "Elige un idioma para comenzar tu viaje.",
    back: "Atrás",
    loading: "Observando la escena...",
    garden: "Jardín",
    collection: "Colección",
    savedWords: "Palabras",
    savedSentences: "Oraciones",
    noSavedItems: "No hay elementos guardados.",
    searchPlaceholder: "Busca en tu mundo...",
    practicePlaceholder: "Practica una oración...",
    reviewComplete: "¡Repaso completo!",
    reviewDesc: "Has llegado al final de tu jardín.",
    shuffleReview: "Mezclar y repasar",
    returnGarden: "Volver al jardín",
    share: "Compartir",
    close: "Cerrar",
    save: "Guardar Póster",
    dailyGoal: "Meta diaria",
    scenes: "Escenas",
    words: "Palabras",
    mastered: "Dominado",
    settings: "Ajustes",
    logout: "Cerrar sesión",
    goalComplete: "¡Meta completada! ¡Bien hecho! 🎉",
    goalProgress: (n: number) => `Captura ${n} fotos más para alcanzar tu meta.`,
    apiKey: "Configuración API",
    apiKeyDesc: "Introduce tu clave API de Gemini (Opcional)",
    apiKeyPlaceholder: "Pega tu clave API aquí...",
    emptyStateTitle: "Tu jardín está vacío",
    emptyStateDesc: "Captura tu primera foto para empezar a plantar recuerdos.",
    layoutOverlay: "Cubrir",
    layoutBelow: "Debajo",
    noMorePhotos: "No más fotos. ¡Sube más!",
    apiBaseUrl: "URL Base de la API (Opcional)",
    apiBaseUrlPlaceholder: "https://generativelanguage.googleapis.com",
  },
  French: {
    nativeTitle: "Quelle est votre langue maternelle ?",
    nativeDesc: "Nous traduirons tout dans cette langue.",
    targetTitle: "Que voulez-vous apprendre ?",
    targetDesc: "Choisissez une langue pour commencer.",
    back: "Retour",
    loading: "Observation de la scène...",
    garden: "Jardin",
    collection: "Collection",
    savedWords: "Mots",
    savedSentences: "Phrases",
    noSavedItems: "Aucun élément enregistré.",
    searchPlaceholder: "Recherchez dans votre monde...",
    practicePlaceholder: "Pratiquez une phrase...",
    reviewComplete: "Révision terminée !",
    reviewDesc: "Vous avez atteint la fin de votre jardin.",
    shuffleReview: "Mélanger et réviser",
    returnGarden: "Retour au jardin",
    share: "Partager",
    close: "Fermer",
    save: "Sauvegarder",
    dailyGoal: "Objectif quotidien",
    scenes: "Scènes",
    words: "Mots",
    mastered: "Maîtrisé",
    settings: "Paramètres",
    logout: "Déconnexion",
    goalComplete: "Objectif atteint ! Bravo ! 🎉",
    goalProgress: (n: number) => `Capturez ${n} photos de plus pour atteindre votre objectif.`,
    apiKey: "Configuration API",
    apiKeyDesc: "Entrez votre clé API Gemini (Facultatif)",
    apiKeyPlaceholder: "Collez votre clé API ici...",
    emptyStateTitle: "Votre jardin est vide",
    emptyStateDesc: "Prenez votre première photo pour commencer.",
    layoutOverlay: "Superposer",
    layoutBelow: "Dessous",
    noMorePhotos: "Plus de photos. Téléchargez-en plus !",
    apiBaseUrl: "URL de base de l'API (Facultatif)",
    apiBaseUrlPlaceholder: "https://generativelanguage.googleapis.com",
  },
   Japanese: {
    nativeTitle: "母国語は何ですか？",
    nativeDesc: "すべてこの言語に翻訳されます。",
    targetTitle: "何を学びたいですか？",
    targetDesc: "没入型の旅を始めるための言語を選んでください。",
    back: "戻る",
    loading: "シーンを観察中...",
    garden: "庭園",
    collection: "コレクション",
    savedWords: "単語",
    savedSentences: "文章",
    noSavedItems: "保存された項目はありません。",
    searchPlaceholder: "あなたの世界を検索...",
    practicePlaceholder: "文章を練習...",
    reviewComplete: "復習完了！",
    reviewDesc: "庭園の最後に到達しました。",
    shuffleReview: "シャッフルして復習",
    returnGarden: "庭園に戻る",
    share: "共有",
    close: "閉じる",
    save: "ポスターを保存",
    dailyGoal: "今日の目標",
    scenes: "シーン",
    words: "単語",
    mastered: "習得済み",
    settings: "設定",
    logout: "ログアウト",
    goalComplete: "目標達成！よくできました！🎉",
    goalProgress: (n: number) => `あと ${n} 枚撮影して目標を達成しましょう。`,
    apiKey: "API 設定",
    apiKeyDesc: "Gemini APIキーを入力してください（任意）",
    apiKeyPlaceholder: "ここにAPIキーを貼り付けてください...",
    emptyStateTitle: "庭園は空です",
    emptyStateDesc: "最初の写真を撮って記憶を植え始めましょう。",
    layoutOverlay: "重ねる",
    layoutBelow: "下配置",
    noMorePhotos: "写真はもうありません。もっとアップロードしましょう！",
    apiBaseUrl: "APIベースURL（任意）",
    apiBaseUrlPlaceholder: "https://generativelanguage.googleapis.com",
  },
  Korean: {
    nativeTitle: "모국어가 무엇인가요?",
    nativeDesc: "모든 내용이 이 언어로 번역됩니다.",
    targetTitle: "어떤 언어를 배우고 싶으신가요?",
    targetDesc: "여정을 시작할 언어를 선택하세요.",
    back: "뒤로",
    loading: "장면을 관찰 중...",
    garden: "정원",
    collection: "컬렉션",
    savedWords: "단어",
    savedSentences: "문장",
    noSavedItems: "저장된 항목이 없습니다.",
    searchPlaceholder: "내 세상 검색...",
    practicePlaceholder: "문장 연습...",
    reviewComplete: "복습 완료!",
    reviewDesc: "정원의 끝에 도달했습니다.",
    shuffleReview: "셔플 및 복습",
    returnGarden: "정원으로 돌아가기",
    share: "공유",
    close: "닫기",
    save: "포스터 저장",
    dailyGoal: "일일 목표",
    scenes: "장면",
    words: "단어",
    mastered: "마스터함",
    settings: "설정",
    logout: "로그아웃",
    goalComplete: "목표 달성! 잘했어요! 🎉",
    goalProgress: (n: number) => `목표 달성을 위해 ${n}장의 사진을 더 찍으세요.`,
    apiKey: "API 구성",
    apiKeyDesc: "Gemini API 키 입력 (선택 사항)",
    apiKeyPlaceholder: "여기에 API 키 붙여넣기...",
    emptyStateTitle: "정원이 비어 있습니다",
    emptyStateDesc: "첫 번째 사진을 찍어 기억을 심으세요.",
    layoutOverlay: "덮어쓰기",
    layoutBelow: "아래 배치",
    noMorePhotos: "더 이상 사진이 없습니다. 더 업로드하세요!",
    apiBaseUrl: "API 기본 URL (선택 사항)",
    apiBaseUrlPlaceholder: "https://generativelanguage.googleapis.com",
  },
  German: {
    nativeTitle: "Was ist deine Muttersprache?",
    nativeDesc: "Wir übersetzen alles in diese Sprache.",
    targetTitle: "Was möchtest du lernen?",
    targetDesc: "Wähle eine Sprache, um zu beginnen.",
    back: "Zurück",
    loading: "Beobachte die Szene...",
    garden: "Garten",
    collection: "Sammlung",
    savedWords: "Wörter",
    savedSentences: "Sätze",
    noSavedItems: "Noch keine gespeicherten Elemente.",
    searchPlaceholder: "Suche in deiner Welt...",
    practicePlaceholder: "Übe einen Satz...",
    reviewComplete: "Überprüfung abgeschlossen!",
    reviewDesc: "Du hast das Ende deines Gartens erreicht.",
    shuffleReview: "Mischen & Überprüfen",
    returnGarden: "Zurück zum Garten",
    share: "Teilen",
    close: "Schließen",
    save: "Poster speichern",
    dailyGoal: "Tagesziel",
    scenes: "Szenen",
    words: "Wörter",
    mastered: "Meistert",
    settings: "Einstellungen",
    logout: "Abmelden",
    goalComplete: "Ziel erreicht! Gut gemacht! 🎉",
    goalProgress: (n: number) => `Mache noch ${n} Fotos, um dein Ziel zu erreichen.`,
    apiKey: "API-Konfiguration",
    apiKeyDesc: "Geben Sie Ihren Gemini API-Schlüssel ein (Optional)",
    apiKeyPlaceholder: "Fügen Sie Ihren API-Schlüssel hier ein...",
    emptyStateTitle: "Dein Garten ist leer",
    emptyStateDesc: "Mache dein erstes Foto, um Erinnerungen zu pflanzen.",
    layoutOverlay: "Überlagern",
    layoutBelow: "Unterhalb",
    noMorePhotos: "Keine Fotos mehr. Laden Sie mehr hoch!",
    apiBaseUrl: "API-Basis-URL (Optional)",
    apiBaseUrlPlaceholder: "https://generativelanguage.googleapis.com",
  },
  Italian: {
    nativeTitle: "Qual è la tua lingua madre?",
    nativeDesc: "Tradurremo tutto in questa lingua.",
    targetTitle: "Cosa vuoi imparare?",
    targetDesc: "Scegli una lingua per iniziare il viaggio.",
    back: "Indietro",
    loading: "Osservando la escena...",
    garden: "Giardino",
    collection: "Collezione",
    savedWords: "Parole",
    savedSentences: "Frases",
    noSavedItems: "Nessun elemento salvato.",
    searchPlaceholder: "Cerca nel tuo mondo...",
    practicePlaceholder: "Esercitati con una frase...",
    reviewComplete: "Ripasso completato!",
    reviewDesc: "Hai raggiunto la fine del tuo giardino.",
    shuffleReview: "Mescola e ripassa",
    returnGarden: "Torna al giardino",
    share: "Condividi",
    close: "Chiudi",
    save: "Salva poster",
    dailyGoal: "Obiettivo giornaliero",
    scenes: "Scene",
    words: "Parole",
    mastered: "Padroneggiato",
    settings: "Impostazioni",
    logout: "Esci",
    goalComplete: "Obiettivo completato! Ottimo lavoro! 🎉",
    goalProgress: (n: number) => `Cattura altre ${n} foto per raggiungere l'obiettivo.`,
    apiKey: "Configurazione API",
    apiKeyDesc: "Inserisci la tua chiave API Gemini (Opzionale)",
    apiKeyPlaceholder: "Incolla qui la tua chiave API...",
    emptyStateTitle: "Il tuo giardino è vuoto",
    emptyStateDesc: "Scatta la tua prima foto per iniziare a piantare ricordi.",
    layoutOverlay: "Sovrapponi",
    layoutBelow: "Sotto",
    noMorePhotos: "Niente più foto. Caricane altre!",
    apiBaseUrl: "URL Base API (Opzionale)",
    apiBaseUrlPlaceholder: "https://generativelanguage.googleapis.com",
  },
  Russian: {
    nativeTitle: "Какой ваш родной язык?",
    nativeDesc: "Мы переведем все на этот язык.",
    targetTitle: "Что вы хотите изучать?",
    targetDesc: "Выберите язык, чтобы начать.",
    back: "Назад",
    loading: "Наблюдаем за сценой...",
    garden: "Сад",
    collection: "Коллекция",
    savedWords: "Слова",
    savedSentences: "Предложения",
    noSavedItems: "Нет сохраненных элементов.",
    searchPlaceholder: "Поиск в вашем мире...",
    practicePlaceholder: "Практикуйте предложение...",
    reviewComplete: "Обзор завершен!",
    reviewDesc: "Вы достигли конца своего сада.",
    shuffleReview: "Перемешать и повторить",
    returnGarden: "Вернуться в сад",
    share: "Поделиться",
    close: "Закрыть",
    save: "Сохранить",
    dailyGoal: "Цель дня",
    scenes: "Сцены",
    words: "Слова",
    mastered: "Изучено",
    settings: "Настройки",
    logout: "Выйти",
    goalComplete: "Цель достигнута! Отличная работа! 🎉",
    goalProgress: (n: number) => `Сделайте еще ${n} фото для достижения цели.`,
    apiKey: "Конфигурация API",
    apiKeyDesc: "Введите ваш API-ключ Gemini (необязательно)",
    apiKeyPlaceholder: "Вставьте ваш API-ключ здесь...",
    emptyStateTitle: "Ваш сад пуст",
    emptyStateDesc: "Сделайте первое фото, чтобы посадить воспоминания.",
    layoutOverlay: "Наложение",
    layoutBelow: "Снизу",
    noMorePhotos: "Больше нет фото. Загрузите еще!",
    apiBaseUrl: "Базовый URL API (необязательно)",
    apiBaseUrlPlaceholder: "https://generativelanguage.googleapis.com",
  },
  Portuguese: {
    nativeTitle: "Qual é a sua língua nativa?",
    nativeDesc: "Traduziremos tudo para este idioma.",
    targetTitle: "O que você quer aprender?",
    targetDesc: "Escolha um idioma para começar.",
    back: "Voltar",
    loading: "Observando a cena...",
    garden: "Jardim",
    collection: "Coleção",
    savedWords: "Palavras",
    savedSentences: "Frases",
    noSavedItems: "Nenhum item salvo.",
    searchPlaceholder: "Pesquise seu mundo...",
    practicePlaceholder: "Pratique uma frase...",
    reviewComplete: "Revisão completa!",
    reviewDesc: "Você chegou ao fim do seu jardim.",
    shuffleReview: "Misturar e Revisar",
    returnGarden: "Voltar para o Jardim",
    share: "Compartilhar",
    close: "Fechar",
    save: "Salvar pôster",
    dailyGoal: "Meta Diária",
    scenes: "Cenas",
    words: "Palavras",
    mastered: "Dominado",
    settings: "Configurações",
    logout: "Sair",
    goalComplete: "Meta concluída! Ótimo trabalho! 🎉",
    goalProgress: (n: number) => `Capture mais ${n} fotos para atingir sua meta.`,
    apiKey: "Configuração da API",
    apiKeyDesc: "Insira sua chave API do Gemini (Opcional)",
    apiKeyPlaceholder: "Cole sua chave API aqui...",
    emptyStateTitle: "Seu jardim está vazio",
    emptyStateDesc: "Capture sua primeira foto para começar a plantar memórias.",
    layoutOverlay: "Sobrepor",
    layoutBelow: "Abaixo",
    noMorePhotos: "Não há mais fotos. Envie mais!",
    apiBaseUrl: "URL Base da API (Opcional)",
    apiBaseUrlPlaceholder: "https://generativelanguage.googleapis.com",
  }
};

// --- Context & State ---

interface AppContextType {
  settings: UserSettings;
  updateSettings: (s: Partial<UserSettings>) => void;
  notes: LearningNote[];
  addNote: (note: LearningNote) => void;
  updateNote: (id: string, updates: Partial<LearningNote>) => void;
  stats: Stats;
  t: any; // helper for translations
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Helper Components ---

const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { settings, updateSettings, t } = useApp();
  const [tempKey, setTempKey] = useState(settings.apiKey || '');
  const [tempBaseUrl, setTempBaseUrl] = useState(settings.apiBaseUrl || '');

  // Sync temp key with settings when opened
  useEffect(() => {
    setTempKey(settings.apiKey || '');
    setTempBaseUrl(settings.apiBaseUrl || '');
  }, [isOpen, settings.apiKey, settings.apiBaseUrl]);

  const handleSave = () => {
    updateSettings({ 
      apiKey: tempKey, 
      apiBaseUrl: tempBaseUrl 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#F2F2F7] w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-100 z-10">
          <h2 className="text-xl font-black text-slate-900">{t.settings}</h2>
          <button onClick={onClose} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Daily Goal */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-white">
             <div className="flex items-center gap-3 mb-4 text-slate-800 font-bold">
               <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><Zap size={20} /></div>
               {t.dailyGoal}
             </div>
             <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100">
               <button 
                 onClick={() => updateSettings({ dailyGoal: Math.max(1, settings.dailyGoal - 1) })}
                 className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 active:scale-95 transition hover:bg-gray-50"
               >-</button>
               <span className="text-3xl font-black text-slate-900 tabular-nums">{settings.dailyGoal}</span>
               <button 
                 onClick={() => updateSettings({ dailyGoal: settings.dailyGoal + 1 })}
                 className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 active:scale-95 transition hover:bg-gray-50"
               >+</button>
             </div>
          </div>

          {/* Languages */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest px-1 ml-1">Languages</h3>
            
            {/* Native */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-white">
              <label className="block text-sm font-bold text-gray-500 mb-2 ml-1">{t.nativeTitle}</label>
              <div className="relative">
                <select 
                  value={settings.nativeLanguage}
                  onChange={(e) => updateSettings({ nativeLanguage: e.target.value })}
                  className="w-full bg-gray-50 text-slate-900 font-bold rounded-xl px-4 py-3 border border-gray-100 focus:ring-2 focus:ring-[#34C759] outline-none appearance-none"
                >
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Target */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-white">
              <label className="block text-sm font-bold text-gray-500 mb-2 ml-1">{t.targetTitle}</label>
              <div className="relative">
                <select 
                  value={settings.targetLanguage}
                  onChange={(e) => updateSettings({ targetLanguage: e.target.value })}
                  className="w-full bg-gray-50 text-slate-900 font-bold rounded-xl px-4 py-3 border border-gray-100 focus:ring-2 focus:ring-[#34C759] outline-none appearance-none"
                >
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* API Config (Key & Base URL) - HIDDEN BY DEFAULT FOR USER SAFETY
              Developers: Uncomment this block if you want to allow users to input their own keys via UI,
              or configure it in services/geminiService.ts using process.env.API_KEY
          */}
          {/*
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-white">
             <div className="flex items-center gap-3 mb-4 text-slate-800 font-bold">
               <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Key size={20} /></div>
               {t.apiKey}
             </div>
             
             <div className="space-y-2 mb-4">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1">API Key</p>
                <input 
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  onBlur={handleSave}
                  placeholder={t.apiKeyPlaceholder}
                  className="w-full bg-gray-50 text-slate-900 rounded-xl px-4 py-3 border border-gray-100 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                />
             </div>

             <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1">{t.apiBaseUrl}</p>
                   <Link size={12} className="text-gray-400" />
                 </div>
                <input 
                  type="text"
                  value={tempBaseUrl}
                  onChange={(e) => setTempBaseUrl(e.target.value)}
                  onBlur={handleSave}
                  placeholder={t.apiBaseUrlPlaceholder}
                  className="w-full bg-gray-50 text-slate-900 rounded-xl px-4 py-3 border border-gray-100 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                />
             </div>
             <p className="text-[10px] text-gray-400 mt-3 px-1">
               {t.apiKeyDesc}
             </p>
          </div>
          */}

        </div>
      </div>
    </div>
  );
};

// --- Components ---

// 1. Onboarding Component (Optimized)
const Onboarding = () => {
  const { settings, updateSettings, t } = useApp();
  const navigate = useNavigate();
  
  // Steps: 0 = Native, 1 = Target
  const [step, setStep] = useState(0);
  const [native, setNative] = useState(settings.nativeLanguage || 'Chinese');
  const [target, setTarget] = useState(settings.targetLanguage || 'English');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Local helper to get translations based on the *currently selected native language* 
  // rather than the globally saved one (for immediate feedback)
  const currentT = TRANSLATIONS[native] || TRANSLATIONS['English'];

  const handleSelection = (langCode: string) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (step === 0) {
      setNative(langCode);
      // Short delay for visual feedback before auto-advance
      setTimeout(() => {
        setStep(1);
        setIsTransitioning(false);
      }, 400);
    } else {
      setTarget(langCode);
      setTimeout(() => {
        updateSettings({ nativeLanguage: native, targetLanguage: langCode, onboarded: true });
        navigate('/');
      }, 400);
    }
  };

  const handleBack = () => {
    setStep(0);
    setIsTransitioning(false);
  };

  const currentSelection = step === 0 ? native : target;

  return (
    <div className="h-full bg-[#F2F2F7] flex flex-col relative overflow-hidden">
      {/* Navigation */}
      <div className="pt-safe px-6 pb-2 flex justify-between items-center h-16 shrink-0">
        {step === 1 ? (
          <button 
            onClick={handleBack} 
            className="flex items-center text-[#34C759] font-semibold -ml-2 hover:opacity-70 transition-opacity"
          >
             <ChevronLeft size={24} strokeWidth={2.5} />
             <span>{currentT.back}</span>
          </button>
        ) : <div />}
      </div>

      {/* Header - iOS Large Title Style */}
      <div className="px-6 mb-6 animate-in slide-in-from-left-4 fade-in duration-500 shrink-0">
        <h1 className="text-[32px] leading-tight font-black text-slate-900 mb-2 tracking-tight">
          {step === 0 ? currentT.nativeTitle : currentT.targetTitle}
        </h1>
        <p className="text-gray-500 text-lg font-medium leading-relaxed">
          {step === 0 ? currentT.nativeDesc : currentT.targetDesc}
        </p>
      </div>

      {/* Grid - Adjusted for 10 items */}
      <div className="flex-1 overflow-y-auto px-4 pb-12 no-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang, index) => {
            const isSelected = currentSelection === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelection(lang.code)}
                className={`
                  relative group flex flex-col items-center justify-center p-4 h-28 rounded-[1.5rem] transition-all duration-300
                  ${isSelected 
                    ? 'bg-green-50 border-[2px] border-[#34C759] shadow-lg shadow-green-100/50 scale-[1.02] z-10' 
                    : 'bg-white border-[2px] border-transparent shadow-sm hover:bg-gray-50 hover:shadow-md'}
                `}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <span className="text-4xl mb-2 filter drop-shadow-sm transform transition-transform group-hover:scale-110 duration-300">
                  {lang.flag}
                </span>
                <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-[#34C759]' : 'text-gray-600'}`}>
                  {lang.label}
                </span>
                
                {/* Selection Indicator */}
                <div className={`
                    absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300
                    ${isSelected ? 'bg-[#34C759] scale-100 opacity-100' : 'bg-transparent scale-50 opacity-0'}
                  `}>
                    <Check size={12} className="text-white" strokeWidth={4} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Image Resizer Utility to prevent LocalStorage overflow
const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1024; // Limit max dimension to 1024px

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Compress to JPEG 0.7 to significantly reduce size
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// 2. Navigation Component
const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isProfile = location.pathname === '/profile';

  if (location.pathname.startsWith('/detail') || location.pathname === '/onboarding') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-20 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
      <button 
        onClick={() => navigate('/')} 
        className={`p-2 transition-all duration-300 flex-1 ${isHome ? 'text-[#34C759] scale-105' : 'text-gray-300 hover:text-gray-400'}`}
      >
        <div className="flex flex-col items-center gap-1">
          <Flower size={26} strokeWidth={isHome ? 2.5 : 2} />
          {isHome && <div className="w-1 h-1 bg-[#34C759] rounded-full" />}
        </div>
      </button>

      {/* The Floating Capture Button (Centered, slightly raised) */}
      <div className="relative -top-6 flex-1 flex justify-center">
        <label className="flex items-center justify-center w-16 h-16 bg-black text-white rounded-full shadow-lg shadow-gray-400/50 cursor-pointer transform transition-all hover:scale-105 active:scale-95">
          <Camera size={28} />
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                 try {
                   // Resize image before navigating to prevent LocalStorage quota exceeded errors
                   const resized = await resizeImage(file);
                   navigate('/detail/new', { state: { imageSrc: resized } });
                 } catch (err) {
                   console.error("Error processing image", err);
                 }
              }
            }}
          />
        </label>
      </div>

      <button 
        onClick={() => navigate('/profile')} 
        className={`p-2 transition-all duration-300 flex-1 ${isProfile ? 'text-[#34C759] scale-105' : 'text-gray-300 hover:text-gray-400'}`}
      >
        <div className="flex flex-col items-center gap-1">
          <User size={26} strokeWidth={isProfile ? 2.5 : 2} />
          {isProfile && <div className="w-1 h-1 bg-[#34C759] rounded-full" />}
        </div>
      </button>
    </div>
  );
};

// 3. Home (Garden & Collection)
const HomePage = () => {
  const { notes, t } = useApp();
  const [activeTab, setActiveTab] = useState<'garden' | 'collection'>('garden');
  const [collectionTab, setCollectionTab] = useState<'words' | 'sentences'>('words');
  const [searchTerm, setSearchTerm] = useState('');
  const [shuffledNotes, setShuffledNotes] = useState<LearningNote[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial sort: Starred first, then by date
    let sorted = [...notes].sort((a, b) => {
      if (a.isStarred === b.isStarred) return b.timestamp - a.timestamp;
      return a.isStarred ? -1 : 1;
    });
    setShuffledNotes(sorted);
  }, [notes]);

  const handleShuffle = () => {
    const shuffled = [...notes].sort(() => Math.random() - 0.5);
    setShuffledNotes(shuffled);
  };

  const savedWords = notes.flatMap(note => 
    note.objects.filter(obj => obj.isSaved).map(obj => ({
      ...obj,
      sourceImage: note.imageUrl,
      noteId: note.id
    }))
  );

  const savedSentences = notes.flatMap(note => 
    note.comments.filter(c => c.isSaved).map(c => ({
      ...c,
      sourceImage: note.imageUrl,
      noteId: note.id
    }))
  );

  const filteredNotes = shuffledNotes.filter(n => {
    const term = searchTerm.toLowerCase();
    return n.comments.some(c => c.content.toLowerCase().includes(term) || c.translation.toLowerCase().includes(term)) ||
           n.objects.some(o => o.label.toLowerCase().includes(term));
  });

  return (
    <div className="h-full bg-[#F2F2F7] relative flex flex-col overflow-hidden">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">

        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#F2F2F7]/95 backdrop-blur-xl pt-safe px-6 pb-2 transition-all">
          <div className="flex items-end justify-between mb-4 mt-2">
             <div className="flex items-baseline gap-5">
               <button 
                 onClick={() => setActiveTab('garden')}
                 className={`text-3xl font-black transition-colors tracking-tight flex items-center gap-2 ${activeTab === 'garden' ? 'text-black' : 'text-gray-300'}`}
               >
                 <span className={activeTab === 'garden' ? 'text-[#34C759]' : 'text-gray-300'}><Flower size={28} /></span>
                 {t.garden}
               </button>
               <button 
                 onClick={() => setActiveTab('collection')}
                 className={`text-xl font-bold transition-colors ${activeTab === 'collection' ? 'text-black text-2xl' : 'text-gray-300'}`}
               >
                 {t.collection}
               </button>
             </div>
             
             {activeTab === 'garden' && (
               <button 
                 onClick={handleShuffle} 
                 className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-500 hover:text-[#34C759] hover:scale-105 transition-all"
               >
                 <RefreshCw size={20} />
               </button>
             )}
          </div>
          
          {/* Search Bar - Only in Garden */}
          {activeTab === 'garden' && (
            <div className="relative group mb-2 animate-in fade-in slide-in-from-top-2">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400 group-focus-within:text-black transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-gray-900 rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#34C759]/20 shadow-sm border-none text-base font-medium placeholder:text-gray-400 transition-all"
              />
            </div>
          )}

          {/* Collection Tabs */}
          {activeTab === 'collection' && (
            <div className="flex bg-gray-200/50 p-1 rounded-xl mb-2 animate-in fade-in slide-in-from-top-2">
              <button 
                onClick={() => setCollectionTab('words')}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${collectionTab === 'words' ? 'bg-white shadow-sm text-[#34C759]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t.savedWords} ({savedWords.length})
              </button>
              <button 
                onClick={() => setCollectionTab('sentences')}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${collectionTab === 'sentences' ? 'bg-white shadow-sm text-[#34C759]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t.savedSentences} ({savedSentences.length})
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="px-4 pt-2 pb-24 relative z-10 mx-auto max-w-[1600px]">
          
          {/* GARDEN VIEW */}
          {activeTab === 'garden' && (
             filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-20 text-center animate-in fade-in zoom-in duration-500 opacity-60">
                 <div className="w-24 h-24 bg-white/50 border-4 border-white shadow-sm rounded-full flex items-center justify-center text-[#34C759] mb-6 transform -rotate-3">
                   <Sprout size={48} fill="currentColor" className="text-[#34C759]" />
                 </div>
                 <h3 className="text-xl font-black text-slate-800 mb-2">{t.emptyStateTitle}</h3>
                 <p className="text-gray-400 font-medium max-w-xs mx-auto mb-8">
                    {t.emptyStateDesc}
                 </p>
                 <div className="animate-bounce mt-4 opacity-30">
                   <ArrowDown size={32} className="text-[#34C759]" />
                 </div>
              </div>
            ) : (
              // Responsive Masonry Grid using Tailwind Columns
              <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                {filteredNotes.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => navigate(`/detail/${note.id}`)}
                    className="break-inside-avoid mb-4 bg-white rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer relative group transform hover:-translate-y-1 hover:scale-[1.01]"
                  >
                    <div className="relative">
                       <img src={note.imageUrl} alt="Note" className="w-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                       <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg">
                         <p className="text-[10px] font-bold text-white/90">
                           {new Date(note.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                         </p>
                       </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-3">
                        "{note.comments.find(c => c.persona === 'Beginner')?.content}"
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {note.objects.slice(0, 3).map(obj => (
                          <span key={obj.id} className="text-[11px] font-semibold bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full border border-gray-100">
                            {obj.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* COLLECTION VIEW */}
          {activeTab === 'collection' && (
            (collectionTab === 'words' && savedWords.length === 0) || (collectionTab === 'sentences' && savedSentences.length === 0) ? (
              <div className="flex flex-col items-center justify-center pt-20 opacity-50">
                 <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl mb-4 text-gray-400">
                   {collectionTab === 'words' ? '🔤' : '💬'}
                 </div>
                 <p className="text-gray-500 font-medium">{t.noSavedItems}</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                {collectionTab === 'words' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {savedWords.map((word, idx) => (
                      <div 
                        key={`${word.id}-${idx}`}
                        onClick={() => navigate(`/detail/${word.noteId}`)}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform"
                      >
                         <div className="text-2xl font-black text-[#34C759] mb-1">{word.label}</div>
                         <div className="text-gray-400 text-sm font-medium">{word.nativeLabel}</div>
                      </div>
                    ))}
                  </div>
                )}

                {collectionTab === 'sentences' && (
                   <div className="space-y-3 max-w-2xl mx-auto">
                     {savedSentences.map((sentence, idx) => (
                       <div 
                         key={`${sentence.id}-${idx}`}
                         onClick={() => navigate(`/detail/${sentence.noteId}`)}
                         className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                       >
                         <div className="flex items-start gap-3">
                            <div className="mt-1 min-w-[24px]">
                              {sentence.persona === 'Beginner' && '🐣'}
                              {sentence.persona === 'Grammar Geek' && '🤓'}
                              {sentence.persona === 'Poetic Master' && '🎭'}
                            </div>
                            <div>
                              <p className="text-slate-900 font-medium leading-relaxed mb-1">{sentence.content}</p>
                              <p className="text-gray-500 text-sm">{sentence.translation}</p>
                            </div>
                         </div>
                       </div>
                     ))}
                   </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// 5. Detail View
const DetailView = () => {
  const { notes, addNote, updateNote, settings, t } = useApp();
  const { state } = useLocation();
  const navigate = useNavigate();
  const params = useLocation().pathname.split('/');
  const noteId = params[params.length - 1]; // 'new' or UUID

  const [loading, setLoading] = useState(false);
  const [currentNote, setCurrentNote] = useState<LearningNote | null>(null);
  
  // Interaction States
  const [previewObjectId, setPreviewObjectId] = useState<string | null>(null);
  const [activeObject, setActiveObject] = useState<InteractiveObject | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);

  const [inputText, setInputText] = useState('');
  const [showPoster, setShowPoster] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null); // For poster selection
  const [isPosterOverlay, setIsPosterOverlay] = useState(true); // Poster layout mode
  const [commentsCollapsed, setCommentsCollapsed] = useState(false);
  
  // Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Swipe States
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const posterRef = useRef<HTMLDivElement>(null);

  // Initialize or Load
  useEffect(() => {
    if (noteId === 'new') {
      if (state?.imageSrc) {
        setLoading(true);
        // Process Image
        const process = async () => {
          try {
            const base64 = state.imageSrc.split(',')[1];
            const mimeType = state.imageSrc.split(';')[0].split(':')[1];
            const analysis = await GeminiService.analyzeImage(
              base64, 
              mimeType, 
              settings.nativeLanguage, 
              settings.targetLanguage,
              settings.apiKey,
              settings.apiBaseUrl // Pass custom base URL
            );

            const newNote: LearningNote = {
              id: Date.now().toString(),
              imageUrl: state.imageSrc,
              timestamp: Date.now(),
              objects: analysis.objects,
              comments: analysis.comments,
              isStarred: false,
              isMastered: false
            };
            setCurrentNote(newNote);
            setLoading(false);
          } catch (e) {
            console.error(e);
            alert("Failed to analyze image. Check your API Key in Settings or try again.");
            navigate('/');
          }
        };
        process();
      } else {
        navigate('/');
      }
    } else {
      const found = notes.find(n => n.id === noteId);
      if (found) setCurrentNote(found);
      else navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, state]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentIndex = notes.findIndex(n => n.id === noteId);
  const isGalleryMode = currentIndex !== -1 && noteId !== 'new';

  const navigateImage = (direction: 'next' | 'prev') => {
    if (!isGalleryMode) return;
    
    if (direction === 'next') {
      if (currentIndex < notes.length - 1) {
        navigate(`/detail/${notes[currentIndex + 1].id}`);
      } else {
        showToast(t.noMorePhotos);
      }
    } else {
      if (currentIndex > 0) {
        navigate(`/detail/${notes[currentIndex - 1].id}`);
      } else {
         showToast(t.noMorePhotos);
      }
    }
  };

  // Handle Swipe Navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    // Only swipe if not interacting with object popover
    if (activeObject) return;
    if (!isGalleryMode) return; 

    if (isLeftSwipe) { // Next
      navigateImage('next');
    }

    if (isRightSwipe) { // Previous
      navigateImage('prev');
    }
  };

  const handleSave = () => {
    if (!currentNote) {
       navigate('/');
       return;
    }
    const exists = notes.find(n => n.id === currentNote.id);
    if (!exists) addNote(currentNote);
    else updateNote(currentNote.id, currentNote);
    navigate('/');
  };

  const toggleHeart = () => {
    if (!currentNote) return;
    const updated = { ...currentNote, isMastered: !currentNote.isMastered };
    setCurrentNote(updated);
    if (noteId !== 'new') updateNote(currentNote.id, { isMastered: updated.isMastered });
    else {
      addNote(updated);
      navigate(`/detail/${updated.id}`, { replace: true });
    }
  };

  // Toggle saving an individual object (word)
  const toggleObjectSave = (objId: string) => {
    if (!currentNote) return;
    const updatedObjects = currentNote.objects.map(obj => 
      obj.id === objId ? { ...obj, isSaved: !obj.isSaved } : obj
    );
    const updatedNote = { ...currentNote, objects: updatedObjects };
    setCurrentNote(updatedNote);
    
    // Also update active object state if it's the one being toggled
    if (activeObject && activeObject.id === objId) {
      setActiveObject({ ...activeObject, isSaved: !activeObject.isSaved });
    }

    if (noteId !== 'new') updateNote(currentNote.id, { objects: updatedObjects });
  };

  // Toggle saving an individual comment (sentence)
  const toggleCommentSave = (commentId: string) => {
    if (!currentNote) return;
    const updatedComments = currentNote.comments.map(c => 
      c.id === commentId ? { ...c, isSaved: !c.isSaved } : c
    );
    const updatedNote = { ...currentNote, comments: updatedComments };
    setCurrentNote(updatedNote);
    if (noteId !== 'new') updateNote(currentNote.id, { comments: updatedComments });
  };

  const handlePlayAudio = (text: string, id: string) => {
    if (audioLoadingId) return; // Prevent multiple requests
    setAudioLoadingId(id);
    GeminiService.playTextToSpeech(text, {
      onPlaying: () => {
        // Keep the loading ID to show "playing" state (or change to a playing state)
        // For simplicity, we keep it as "active"
      },
      onEnded: () => setAudioLoadingId(null)
    }, settings.apiKey, settings.apiBaseUrl); // Pass custom base URL
  };

  const openPoster = () => {
    // Select the first "Poetic" comment by default, or just the first one
    const defaultComment = currentNote?.comments.find(c => c.persona === 'Poetic Master') || currentNote?.comments[0];
    setSelectedCommentId(defaultComment?.id || null);
    setShowPoster(true);
  };

  const downloadPoster = async () => {
    if (posterRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(posterRef.current);
        const link = document.createElement('a');
        link.download = `photoaitalk-poster-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Poster generation failed', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F2F2F7] space-y-4">
        <Loader2 className="animate-spin text-black" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">{t.loading}</p>
      </div>
    );
  }

  if (!currentNote) return null;

  return (
    <div 
      className="h-screen w-full bg-black relative flex flex-col overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 transition-opacity duration-300">
        <img src={currentNote.imageUrl} alt="Scene" className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Header Actions */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pt-safe">
        <button onClick={handleSave} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-md hover:bg-white/30 transition active:scale-95">
          <ChevronLeft size={24} />
        </button>
        <button onClick={openPoster} className="flex items-center gap-1 text-white drop-shadow-md bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold border border-white/30 hover:bg-white/30 transition">
          <Share2 size={14} />
          {t.share}
        </button>
      </div>

      {/* Navigation Arrows (Only in Gallery Mode) */}
      {isGalleryMode && (
        <>
          <button 
             onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
             className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/40 transition active:scale-95"
          >
            <ChevronLeft size={28} />
          </button>
          <button 
             onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
             className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-black/40 transition active:scale-95"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in zoom-in duration-200">
          <div className="bg-black/80 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <AlertCircle size={24} className="text-[#34C759]" />
            <span className="font-bold text-lg">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Interactive Bubbles Layer */}
      <div className="absolute inset-0 z-10">
        {currentNote.objects.map(obj => {
          const isPreview = previewObjectId === obj.id;
          
          return (
            <div
              key={obj.id}
              className="absolute"
              style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
            >
              {/* Dot - Visible only if not in preview mode for this object */}
              {!isPreview && (
                <button
                  onClick={() => setPreviewObjectId(obj.id)}
                  className="w-12 h-12 -ml-6 -mt-6 rounded-full bg-white/20 backdrop-blur-md border border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.5)] flex items-center justify-center animate-pulse hover:animate-none hover:scale-110 transition-transform"
                >
                  <div className="w-3 h-3 bg-[#34C759] rounded-full shadow-glow"></div>
                </button>
              )}

              {/* Preview Pill - Frosted Glass */}
              {isPreview && (
                <div className="absolute -translate-x-1/2 -translate-y-full mb-2 flex items-center gap-2 z-30 animate-in fade-in zoom-in duration-200">
                  <div 
                    onClick={() => {
                       setPreviewObjectId(null);
                       setActiveObject(obj);
                    }}
                    className="cursor-pointer bg-white/20 backdrop-blur-lg border border-white/30 text-white px-4 py-2 rounded-full font-bold shadow-xl hover:bg-white/30 transition active:scale-95 whitespace-nowrap"
                  >
                    {obj.label}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewObjectId(null); }}
                    className="bg-black/40 backdrop-blur-md text-white rounded-full p-1 hover:bg-black/60"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Object Card (Popover) */}
      {activeObject && (
        <>
          <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={() => setActiveObject(null)} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl text-center w-72 animate-in fade-in zoom-in duration-200 border border-white/50 relative">
             <button 
               onClick={() => setActiveObject(null)}
               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
             >
               <X size={20} />
             </button>
             
             {/* Bookmark Object */}
             <button 
               onClick={() => toggleObjectSave(activeObject.id)}
               className={`absolute top-4 left-4 p-2 rounded-full transition-colors ${activeObject.isSaved ? 'text-[#34C759] bg-green-50' : 'text-gray-300 hover:text-gray-400'}`}
             >
               <Bookmark size={20} fill={activeObject.isSaved ? "currentColor" : "none"} />
             </button>

             <h3 className="text-3xl font-bold text-[#34C759] mb-1 mt-4">{activeObject.label}</h3>
             <p className="text-gray-500 mb-6 font-medium text-lg">{activeObject.nativeLabel}</p>
             
             <button 
                onClick={() => handlePlayAudio(activeObject.label, activeObject.id)} 
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${audioLoadingId === activeObject.id ? 'bg-green-100 text-[#34C759]' : 'bg-[#34C759] text-white shadow-lg shadow-green-300 active:scale-95'}`}
             >
               {audioLoadingId === activeObject.id ? (
                 <Loader2 className="animate-spin" size={28} />
               ) : (
                 <Volume2 size={28} />
               )}
             </button>
             <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tap to Listen</p>
          </div>
        </>
      )}

      {/* Comments Area (Collapsible) */}
      <div 
        className={`mt-auto z-20 w-full px-4 pb-2 transition-all duration-300 ease-in-out flex flex-col ${commentsCollapsed ? 'h-auto' : 'max-h-[60%]'}`}
      >
        {/* Collapse Toggle Header */}
        <div className="flex justify-center mb-2">
            <button 
              onClick={() => setCommentsCollapsed(!commentsCollapsed)}
              className="bg-black/40 backdrop-blur-md border border-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 hover:bg-black/60 transition"
            >
              {commentsCollapsed ? (
                <>Show Insights <ChevronUp size={14} /></>
              ) : (
                <>Hide Insights <ChevronDown size={14} /></>
              )}
            </button>
        </div>

        {/* Scrollable List */}
        {!commentsCollapsed && (
          <div className="overflow-y-auto no-scrollbar space-y-3 pb-2">
            {currentNote.comments.map((comment, idx) => (
              <div key={comment.id} className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white relative group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1 text-green-200">
                      {comment.persona === 'Beginner' && '🐣 Beginner'}
                      {comment.persona === 'Grammar Geek' && '🤓 Grammar'}
                      {comment.persona === 'Poetic Master' && '🎭 Poetic'}
                    </span>
                    <button 
                      onClick={() => handlePlayAudio(comment.content, comment.id)} 
                      className={`opacity-80 hover:opacity-100 transition-transform active:scale-90 ${audioLoadingId === comment.id ? 'animate-pulse text-green-300' : ''}`}
                    >
                      {audioLoadingId === comment.id ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                    </button>
                  </div>
                  
                  {/* Save Sentence Button */}
                  <button 
                    onClick={() => toggleCommentSave(comment.id)}
                    className={`p-1.5 rounded-full transition-colors ${comment.isSaved ? 'text-[#34C759] bg-white' : 'text-white/30 hover:text-white/70'}`}
                  >
                    <Bookmark size={14} fill={comment.isSaved ? "currentColor" : "none"} />
                  </button>
                </div>
                <p className="text-lg leading-snug font-medium mb-1 drop-shadow-sm pr-6">{comment.content}</p>
                <p className="text-sm text-white/70">{comment.translation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="z-20 w-full bg-black/80 backdrop-blur-xl px-4 py-3 pb-safe border-t border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.practicePlaceholder}
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:bg-white/20 transition text-sm"
          />
          <button 
            onClick={toggleHeart}
            className={`p-3 rounded-full transition-transform active:scale-90 ${currentNote.isMastered ? 'bg-[#34C759] text-white shadow-lg shadow-green-900/50' : 'bg-white/10 text-white/60'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={currentNote.isMastered ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </div>

      {/* Poster Overlay */}
      {showPoster && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[100]">
          {/* Scrollable area for the poster preview */}
          <div className="flex-1 w-full flex items-center justify-center overflow-y-auto min-h-0 py-4 no-scrollbar">
             <div ref={posterRef} className="bg-white p-4 rounded-xl shadow-2xl w-full max-w-[320px] transition-all"> 
               <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-2">
                  {/* Main Image - adapts height */}
                  <img src={currentNote.imageUrl} className="w-full h-auto block" crossOrigin="anonymous" />
                  
                  {/* Overlay Mode */}
                  {isPosterOverlay && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pt-16">
                       <p className="text-white font-serif italic text-lg text-center leading-relaxed drop-shadow-md">
                         "{currentNote.comments.find(c => c.id === selectedCommentId)?.content}"
                       </p>
                    </div>
                  )}
               </div>
               
               {/* Below Mode */}
               {!isPosterOverlay && (
                 <div className="py-6 px-2">
                    <p className="text-slate-800 font-serif italic text-lg text-center leading-relaxed">
                      "{currentNote.comments.find(c => c.id === selectedCommentId)?.content}"
                    </p>
                 </div>
               )}
               
               {/* Footer */}
               <div className="flex justify-between items-center px-1 mt-1 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-[#34C759]"></div>
                     <span className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">PhotoAITalk Garden</span>
                  </div>
                   <span className="text-gray-300 text-[10px] font-bold">{new Date().toLocaleDateString()}</span>
               </div>
             </div>
          </div>
        
          {/* Controls Container - Fixed at bottom */}
          <div className="w-full max-w-sm space-y-4 pb-safe animate-in slide-in-from-bottom-6">
             
             {/* Poster Layout Toggle */}
             <div className="flex justify-center">
               <div className="flex bg-white/10 p-1 rounded-lg">
                  <button 
                    onClick={() => setIsPosterOverlay(true)} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${isPosterOverlay ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
                  >
                     <Layers size={14} />
                     {t.layoutOverlay}
                  </button>
                  <button 
                    onClick={() => setIsPosterOverlay(false)} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${!isPosterOverlay ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
                  >
                     <AlignVerticalJustifyCenter size={14} />
                     {t.layoutBelow}
                  </button>
               </div>
             </div>

             {/* Comment Selector */}
             <div className="flex gap-4 justify-center">
                {currentNote.comments.map(c => {
                   const isSelected = selectedCommentId === c.id;
                   let icon = '🐣';
                   if(c.persona === 'Grammar Geek') icon = '🤓';
                   if(c.persona === 'Poetic Master') icon = '🎭';
                   
                   return (
                     <button
                       key={c.id}
                       onClick={() => setSelectedCommentId(c.id)}
                       className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all ${isSelected ? 'bg-white border-[#34C759] scale-110 shadow-lg -translate-y-1' : 'bg-white/10 border-transparent text-white/50 hover:bg-white/20'}`}
                     >
                       {icon}
                     </button>
                   );
                })}
             </div>
          
             {/* Action Buttons */}
             <div className="flex gap-3">
                <button onClick={() => setShowPoster(false)} className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold border border-white/20 hover:bg-white/20 transition active:scale-95">
                  {t.close}
                </button>
                <button onClick={downloadPoster} className="flex-1 bg-[#34C759] text-white py-3 rounded-xl font-bold shadow-lg shadow-green-900/50 hover:bg-[#2da84a] transition flex items-center justify-center gap-2 active:scale-95">
                  <Download size={18} />
                  {t.save}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 6. Profile Page (Redesigned)
const ProfilePage = () => {
  const { notes, settings, updateSettings, t } = useApp();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const stats = {
    notes: notes.length,
    words: notes.reduce((acc, note) => acc + note.objects.length, 0),
    sentences: notes.reduce((acc, note) => acc + (note.userSentence ? 1 : 0), 0)
  };

  const masteredCount = notes.filter(n => n.isMastered).length;
  // Use settings.dailyGoal with a default fallback of 5
  const goalTarget = settings.dailyGoal || 5;
  const progressPercent = Math.min((stats.notes / goalTarget) * 100, 100);

  const handleLogout = () => {
    // In a real app this would clear session, here we just go to onboarding for demo
    updateSettings({ onboarded: false });
    navigate('/onboarding');
  };

  return (
    <div className="h-full bg-[#F2F2F7] flex flex-col overflow-hidden">
      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Header Card */}
        <div className="bg-white pt-safe pb-8 px-6 rounded-b-[2.5rem] shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <Globe size={120} />
          </div>
          
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-5xl shadow-xl mb-4 border-4 border-white">
              🧙‍♂️
            </div>
            <h2 className="text-2xl font-black text-slate-900">Language Explorer</h2>
            
            <div className="flex items-center gap-3 mt-3 bg-[#F2F2F7] pl-4 pr-3 py-1.5 rounded-full">
               <span className="text-sm font-semibold text-gray-500">{settings.nativeLanguage}</span>
               <ArrowRight size={14} className="text-gray-300" />
               <span className="text-sm font-bold text-black flex items-center gap-1">
                 {settings.targetLanguage}
               </span>
            </div>
          </div>
          
          {/* Main Stats Row */}
          <div className="flex justify-between mt-8 px-6 max-w-sm mx-auto">
             <div className="text-center flex-1">
                <div className="text-2xl font-black text-slate-900">{stats.notes}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t.scenes}</div>
             </div>
             <div className="w-px bg-gray-100 h-10 self-center mx-2"></div>
             <div className="text-center flex-1">
                <div className="text-2xl font-black text-slate-900">{stats.words}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t.words}</div>
             </div>
             <div className="w-px bg-gray-100 h-10 self-center mx-2"></div>
             <div className="text-center flex-1">
                <div className="text-2xl font-black text-slate-900">{masteredCount}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t.mastered}</div>
             </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-5 space-y-5">
          
          {/* Daily Goal Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-white">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-yellow-100 p-1.5 rounded-lg text-yellow-600"><Zap size={18} fill="currentColor" /></span>
                {t.dailyGoal}
              </h3>
              <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-full text-gray-500">{stats.notes}/{goalTarget}</span>
            </div>
            
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div 
                style={{ width: `${progressPercent}%` }} 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
              ></div>
            </div>
            <p className="text-gray-500 text-sm font-medium">
              {stats.notes >= goalTarget ? t.goalComplete : t.goalProgress(goalTarget - stats.notes)}
            </p>
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-white">
             <button 
               onClick={() => setShowSettings(true)}
               className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-100"
             >
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                   <Settings size={16} />
                 </div>
                 <span className="font-semibold text-gray-700">{t.settings}</span>
               </div>
               <ChevronDown size={16} className="text-gray-400 -rotate-90" />
             </button>
             
             <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-red-500">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                   <LogOut size={16} />
                 </div>
                 <span className="font-semibold">{t.logout}</span>
               </div>
             </button>
          </div>
          
          <div className="text-center pt-4">
            <p className="text-xs font-medium text-gray-300">PhotoAITalk v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main App Logic ---

const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  // Simple persistence with localStorage
  const [settings, setSettingsState] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('photoaitalk_settings');
    // Ensure dailyGoal exists (migration for existing users)
    const defaults = { nativeLanguage: 'English', targetLanguage: 'Spanish', dailyGoal: 5, onboarded: false };
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaults, ...parsed };
    }
    return defaults;
  });

  const [notes, setNotesState] = useState<LearningNote[]>(() => {
    const saved = localStorage.getItem('photoaitalk_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettingsState(newSettings);
    localStorage.setItem('photoaitalk_settings', JSON.stringify(newSettings));
  };

  const addNote = (note: LearningNote) => {
    const newNotes = [note, ...notes];
    setNotesState(newNotes);
    try {
      localStorage.setItem('photoaitalk_notes', JSON.stringify(newNotes));
    } catch (e) {
      console.error("Storage full or error saving notes", e);
      // Fail silently but log error, keeping in-memory state so user can continue session
    }
  };

  const updateNote = (id: string, updates: Partial<LearningNote>) => {
    const newNotes = notes.map(n => n.id === id ? { ...n, ...updates } : n);
    setNotesState(newNotes);
    try {
      localStorage.setItem('photoaitalk_notes', JSON.stringify(newNotes));
    } catch (e) {
      console.error("Storage full or error updating notes", e);
    }
  };

  const t = TRANSLATIONS[settings.nativeLanguage] || TRANSLATIONS['English'];

  return (
    <AppContext.Provider value={{ 
      settings, 
      updateSettings, 
      notes, 
      addNote, 
      updateNote, 
      stats: { noteCount: notes.length, wordCount: 0, sentenceCount: 0 },
      t
    }}>
      {children}
    </AppContext.Provider>
  );
};

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { settings } = useApp();
  if (!settings.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <div className="font-sans antialiased text-slate-900 bg-[#F2F2F7] h-full selection:bg-green-200">
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/detail/:id" element={<ProtectedRoute><DetailView /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Routes>
          <BottomNav />
        </div>
      </AppProvider>
    </HashRouter>
  );
}
