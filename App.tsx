import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Camera, Home, User, Settings, Loader2, RefreshCw, Search, ChevronDown, ChevronUp, X, Share2, Volume2, Download, ArrowRight, Check, Zap, Globe, LogOut, Shuffle, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

import { UserSettings, LearningNote, Stats, InteractiveObject } from './types';
import * as GeminiService from './services/geminiService';

// --- Constants ---

// 1. Languages Data
const LANGUAGES = [
  { id: 'English', code: 'US', label: 'English', flag: '🇺🇸' },
  { id: 'Chinese', code: 'CN', label: '中文', flag: '🇨🇳' },
  { id: 'Spanish', code: 'ES', label: 'Español', flag: '🇪🇸' },
  { id: 'French', code: 'FR', label: 'Français', flag: '🇫🇷' },
  { id: 'Japanese', code: 'JP', label: '日本語', flag: '🇯🇵' },
  { id: 'Korean', code: 'KR', label: '한국어', flag: '🇰🇷' },
  { id: 'German', code: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'Italian', code: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { id: 'Russian', code: 'RU', label: 'Русский', flag: '🇷🇺' },
  { id: 'Portuguese', code: 'PT', label: 'Português', flag: '🇵🇹' },
];

// 2. UI Translations
const UI_TEXT: Record<string, any> = {
  'English': {
    nativeTitle: "Native Language",
    nativeDesc: "Choose the language you know best.",
    targetTitle: "Target Language",
    targetDesc: "Choose the language you want to learn.",
    next: "Next",
    start: "Start Journey"
  },
  'Chinese': {
    nativeTitle: "母语",
    nativeDesc: "选择您最熟悉的语言。",
    targetTitle: "目标语言",
    targetDesc: "选择您想学习的语言。",
    next: "下一步",
    start: "开始旅程"
  },
  'Spanish': {
    nativeTitle: "Lengua Materna",
    nativeDesc: "Elige el idioma que mejor conoces.",
    targetTitle: "Idioma Objetivo",
    targetDesc: "Elige el idioma que quieres aprender.",
    next: "Siguiente",
    start: "Empezar"
  },
  'French': {
    nativeTitle: "Langue Maternelle",
    nativeDesc: "Choisissez la langue que vous maîtrisez le mieux.",
    targetTitle: "Langue Cible",
    targetDesc: "Choisissez la langue que vous souhaitez apprendre.",
    next: "Suivant",
    start: "Commencer"
  },
  'Japanese': {
    nativeTitle: "母国語",
    nativeDesc: "最も得意な言語を選択してください。",
    targetTitle: "学習言語",
    targetDesc: "学びたい言語を選択してください。",
    next: "次へ",
    start: "始める"
  },
  'Korean': {
    nativeTitle: "모국어",
    nativeDesc: "가장 익숙한 언어를 선택하세요.",
    targetTitle: "학습할 언어",
    targetDesc: "배우고 싶은 언어를 선택하세요.",
    next: "다음",
    start: "시작하기"
  },
  'German': {
    nativeTitle: "Muttersprache",
    nativeDesc: "Wählen Sie die Sprache, die Sie am besten beherrschen.",
    targetTitle: "Zielsprache",
    targetDesc: "Wählen Sie die Sprache, die Sie lernen möchten.",
    next: "Weiter",
    start: "Starten"
  },
  'Italian': {
    nativeTitle: "Madrelingua",
    nativeDesc: "Scegli la lingua che conosci meglio.",
    targetTitle: "Lingua di destinazione",
    targetDesc: "Scegli la lingua che vuoi imparare.",
    next: "Avanti",
    start: "Iniziare"
  },
  'Russian': {
    nativeTitle: "Родной язык",
    nativeDesc: "Выберите язык, который вы знаете лучше всего.",
    targetTitle: "Изучаемый язык",
    targetDesc: "Выберите язык, который вы хотите изучать.",
    next: "Далее",
    start: "Начать"
  },
  'Portuguese': {
    nativeTitle: "Língua Nativa",
    nativeDesc: "Escolha o idioma que você conhece melhor.",
    targetTitle: "Idioma Alvo",
    targetDesc: "Escolha o idioma que você deseja aprender.",
    next: "Próximo",
    start: "Começar"
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
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Helper Components ---

const Fireworks = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style>
        {`
          @keyframes firework {
            0% { transform: translate(var(--x), var(--initialY)); width: var(--initialSize); opacity: 1; }
            50% { width: 0.5rem; opacity: 1; }
            100% { width: var(--finalSize); opacity: 0; }
          }
          .firework, .firework::before, .firework::after {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 0.5rem;
            aspect-ratio: 1;
            background: radial-gradient(circle, #ff0 0.2rem, #0000 0) 50% 0% / 50% 50%, 
                        radial-gradient(circle, #f0f 0.2rem, #0000 0) 0% 50% / 50% 50%, 
                        radial-gradient(circle, #0ff 0.2rem, #0000 0) 50% 100% / 50% 50%, 
                        radial-gradient(circle, #0f0 0.2rem, #0000 0) 100% 50% / 50% 50%;
            background-repeat: no-repeat;
            animation: firework 2s infinite;
          }
          .firework::before { transform: translate(-50%, -50%) rotate(45deg); }
          .firework::after { transform: translate(-50%, -50%) rotate(-45deg); }
        `}
      </style>
      <div className="firework" style={{ "--x": "-20%", "--initialY": "60vmin", "--initialSize": "0.5rem", "--finalSize": "40vmin", animationDelay: "0s" } as React.CSSProperties}></div>
      <div className="firework" style={{ "--x": "30%", "--initialY": "60vmin", "--initialSize": "0.5rem", "--finalSize": "40vmin", animationDelay: "0.4s" } as React.CSSProperties}></div>
      <div className="firework" style={{ "--x": "-30%", "--initialY": "60vmin", "--initialSize": "0.5rem", "--finalSize": "40vmin", animationDelay: "0.8s" } as React.CSSProperties}></div>
      <div className="firework" style={{ "--x": "10%", "--initialY": "60vmin", "--initialSize": "0.5rem", "--finalSize": "40vmin", animationDelay: "1.2s" } as React.CSSProperties}></div>
    </div>
  );
};

// --- Components ---

// 1. Onboarding Component
const Onboarding = () => {
  const { settings, updateSettings } = useApp();
  const navigate = useNavigate();
  
  // Steps: 0 = Native, 1 = Target
  const [step, setStep] = useState(0);
  const [native, setNative] = useState(settings.nativeLanguage || 'Chinese');
  const [target, setTarget] = useState(settings.targetLanguage || 'English');

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else {
      updateSettings({ nativeLanguage: native, targetLanguage: target, onboarded: true });
      navigate('/');
    }
  };

  const currentSelection = step === 0 ? native : target;
  const setSelection = step === 0 ? setNative : setTarget;

  // Dynamic Text Logic
  // The UI text is driven by the Native Language selection.
  // In Step 0: It updates as you change selection.
  // In Step 1: It stays in the language selected in Step 0.
  const displayLang = native;
  const t = UI_TEXT[displayLang] || UI_TEXT['English'];

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden text-white">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[60%] bg-indigo-900/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-purple-900/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Progress / Navigation */}
      <div className="pt-safe px-6 pb-2 flex justify-between items-center z-10">
        {step === 1 && (
          <button onClick={() => setStep(0)} className="p-2 -ml-2 text-zinc-400 hover:text-white transition">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        )}
        <div className="flex-1"></div>
      </div>

      {/* Header */}
      <div className="px-8 mb-6 text-center z-10">
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight transition-all duration-300">
          {step === 0 ? t.nativeTitle : t.targetTitle}
        </h1>
        <p className="text-zinc-400 text-sm font-medium px-4 leading-relaxed transition-all duration-300">
          {step === 0 ? t.nativeDesc : t.targetDesc}
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 z-10 no-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang) => {
            const isSelected = currentSelection === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => setSelection(lang.id)}
                className={`
                  relative flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-all duration-200 border
                  ${isSelected 
                    ? 'bg-white border-white text-black scale-[1.02] shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                    : 'bg-zinc-900/60 border-white/10 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}
                `}
              >
                <div className={`text-xl font-black mb-1 ${isSelected ? 'text-black' : 'text-zinc-500'}`}>{lang.code}</div>
                <div className="text-sm font-bold">
                  {lang.label}
                </div>
                {isSelected && (
                   <div className="absolute top-2 right-2">
                     <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" strokeWidth={4} />
                     </div>
                   </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <div className="fixed bottom-0 left-0 right-0 p-8 pb-safe bg-gradient-to-t from-black via-black/90 to-transparent z-20 flex justify-center">
        <button
          onClick={handleNext}
          className="bg-white text-black w-full max-w-xs py-4 rounded-full font-bold text-lg shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {step === 0 ? (
            <>
              {t.next} <ArrowRight size={20} />
            </>
          ) : (
            t.start
          )}
        </button>
      </div>
    </div>
  );
};

// 2. Navigation Component
const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isProfile = location.pathname === '/profile';

  if (location.pathname.startsWith('/detail') || location.pathname === '/onboarding') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe pt-2 px-8 flex justify-between items-center z-50 h-20">
      <button 
        onClick={() => navigate('/')} 
        className={`p-2 transition-all duration-300 ${isHome ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-zinc-500 hover:text-zinc-300'}`}
      >
        <div className="flex flex-col items-center gap-1">
          <Home size={26} strokeWidth={isHome ? 2.5 : 2} />
          {isHome && <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]" />}
        </div>
      </button>

      {/* The Floating Capture Button */}
      <div className="relative -top-6">
        <label className="flex items-center justify-center w-16 h-16 bg-white text-black rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-pointer transform transition-all hover:scale-105 active:scale-95 border-4 border-black">
          <Camera size={28} strokeWidth={2.5} />
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                 const reader = new FileReader();
                 reader.onloadend = () => {
                   navigate('/detail/new', { state: { imageSrc: reader.result as string } });
                 };
                 reader.readAsDataURL(file);
              }
            }}
          />
        </label>
      </div>

      <button 
        onClick={() => navigate('/profile')} 
        className={`p-2 transition-all duration-300 ${isProfile ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-zinc-500 hover:text-zinc-300'}`}
      >
        <div className="flex flex-col items-center gap-1">
          <User size={26} strokeWidth={isProfile ? 2.5 : 2} />
          {isProfile && <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]" />}
        </div>
      </button>
    </div>
  );
};

// 3. Home (Visual Notebook)
const HomePage = () => {
  const { notes, updateNote } = useApp();
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

  const filtered = shuffledNotes.filter(n => {
    const term = searchTerm.toLowerCase();
    return n.comments.some(c => c.content.toLowerCase().includes(term) || c.translation.toLowerCase().includes(term)) ||
           n.objects.some(o => o.label.toLowerCase().includes(term));
  });

  return (
    <div className="min-h-screen bg-black pb-24 relative text-white">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-indigo-900/10 blur-[80px] rounded-full"></div>
      </div>

      {/* Modern Header */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl pt-safe px-6 pb-4 transition-all border-b border-white/5">
        <div className="flex items-center justify-between mb-4 mt-2">
          <h1 className="text-3xl font-black text-white tracking-tight">Gallery</h1>
          <button 
            onClick={handleShuffle} 
            className="p-2 bg-zinc-900 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        
        {/* Modern Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-500 group-focus-within:text-white transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search your memories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/80 text-white rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-white/20 shadow-inner border border-white/5 placeholder:text-zinc-600 transition-all"
          />
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="px-4 pt-4 masonry-grid relative z-10">
        {filtered.map(note => (
          <div 
            key={note.id} 
            onClick={() => navigate(`/detail/${note.id}`)}
            className="break-inside-avoid mb-4 bg-zinc-900/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/5 shadow-lg transition-all cursor-pointer relative group transform hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            <div className="relative">
               <img src={note.imageUrl} alt="Note" className="w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-90"></div>
               {/* Date Badge */}
               <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                 <p className="text-[10px] font-bold text-white/80">
                   {new Date(note.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                 </p>
               </div>
               {/* Star Badge */}
               {note.isStarred && (
                <div className="absolute top-3 right-3 bg-yellow-500/20 text-yellow-400 p-1.5 rounded-full border border-yellow-500/30 backdrop-blur-md">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </div>
               )}
            </div>
            
            <div className="p-4 pt-2">
              <p className="font-bold text-white text-base leading-snug line-clamp-2 mb-3 drop-shadow-sm">
                "{note.comments.find(c => c.persona === 'Beginner')?.content}"
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {note.objects.slice(0, 3).map(obj => (
                  <span key={obj.id} className="text-[10px] font-semibold bg-white/10 text-zinc-300 px-2.5 py-1 rounded-full border border-white/5">
                    {obj.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 gap-6 h-[50vh]">
             <Fireworks />
             <div className="w-24 h-24 bg-zinc-900/50 backdrop-blur-md rounded-full flex items-center justify-center text-4xl border border-white/10 z-10 animate-bounce shadow-[0_0_20px_rgba(255,255,255,0.1)]">
               📸
             </div>
             <p className="font-bold text-lg text-white/80 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 z-10">
               Capture your first moment
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Detail View
const DetailView = () => {
  const { notes, addNote, updateNote, settings } = useApp();
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
  const [commentsCollapsed, setCommentsCollapsed] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Swipe States using refs for better performance
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const minSwipeDistance = 50;
  
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
              settings.targetLanguage
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
            alert("Failed to analyze image. Try again.");
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

  // Handle Swipe Navigation (Pointer Events for Mouse + Touch)
  const onPointerDown = (e: React.PointerEvent) => {
    touchEnd.current = null;
    touchStart.current = e.clientX;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    touchEnd.current = e.clientX;
  };

  const onPointerUp = () => {
    if (touchStart.current === null || touchEnd.current === null) return;
    
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Only swipe if not interacting with object popover
    if (activeObject) return;
    if (noteId === 'new') return; // Don't swipe on new note preview

    // Find current index
    const currentIndex = notes.findIndex(n => n.id === noteId);
    if (currentIndex === -1) return;

    if (isLeftSwipe) { // Next
      if (currentIndex < notes.length - 1) {
        navigate(`/detail/${notes[currentIndex + 1].id}`);
      } else {
        setShowEndDialog(true);
      }
    }

    if (isRightSwipe) { // Previous
      if (currentIndex > 0) {
        navigate(`/detail/${notes[currentIndex - 1].id}`);
      }
    }
  };

  const handleShuffleReview = () => {
    if (notes.length === 0) return;
    const randomIdx = Math.floor(Math.random() * notes.length);
    navigate(`/detail/${notes[randomIdx].id}`);
    setShowEndDialog(false);
  };

  const handleSave = () => {
    if (!currentNote) return;
    const exists = notes.find(n => n.id === currentNote.id);
    if (!exists) addNote(currentNote);
    else updateNote(currentNote.id, currentNote);
  };

  const toggleStar = () => {
    if (!currentNote) return;
    const updated = { ...currentNote, isStarred: !currentNote.isStarred };
    setCurrentNote(updated);
    if (noteId !== 'new') updateNote(currentNote.id, { isStarred: updated.isStarred });
    else {
      addNote(updated);
      navigate(`/detail/${updated.id}`, { replace: true });
    }
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

  const handlePlayAudio = (text: string, id: string) => {
    if (audioLoadingId) return; // Prevent multiple requests
    setAudioLoadingId(id);
    GeminiService.playTextToSpeech(text, {
      onPlaying: () => {
        // Keep the loading ID to show "playing" state (or change to a playing state)
        // For simplicity, we keep it as "active"
      },
      onEnded: () => setAudioLoadingId(null)
    });
  };

  const downloadPoster = async () => {
    if (posterRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(posterRef.current);
        const link = document.createElement('a');
        link.download = 'picpic-poster.png';
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Poster generation failed', error);
      }
    }
  };

  // Helper for Nav Arrows
  const currentIndex = notes.findIndex(n => n.id === noteId);
  const showLeftArrow = currentIndex > 0;
  const showRightArrow = true; // Always show right arrow (either next or finish)

  const goNext = () => {
      if (currentIndex < notes.length - 1) {
        navigate(`/detail/${notes[currentIndex + 1].id}`);
      } else {
        setShowEndDialog(true);
      }
  };

  const goPrev = () => {
     if (currentIndex > 0) {
        navigate(`/detail/${notes[currentIndex - 1].id}`);
      }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black space-y-4">
        <Loader2 className="animate-spin text-white" size={48} />
        <p className="text-zinc-400 font-medium animate-pulse">Observing the scene...</p>
      </div>
    );
  }

  if (!currentNote) return null;

  return (
    <div 
      className="h-screen w-full bg-black relative flex flex-col overflow-hidden touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp} // Safety to catch swipe release outside
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 transition-opacity duration-300">
        <img src={currentNote.imageUrl} alt="Scene" className="w-full h-full object-cover opacity-80" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* Header Actions */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pt-safe pointer-events-none">
        <button onClick={() => { handleSave(); navigate('/'); }} className="pointer-events-auto text-white drop-shadow-md p-2 rounded-full hover:bg-white/10 transition">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button onClick={() => setShowPoster(true)} className="pointer-events-auto flex items-center gap-1 text-white drop-shadow-md bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20 hover:bg-black/60 transition">
          <Share2 size={14} />
          Share
        </button>
      </div>

      {/* Navigation Chevrons (Visual Hints) */}
      {noteId !== 'new' && (
        <>
          {showLeftArrow && (
             <div 
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white/30 hover:text-white transition-colors cursor-pointer p-2 rounded-full hover:bg-black/30"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
             >
                <ChevronLeft size={40} strokeWidth={1} />
             </div>
          )}
          {showRightArrow && (
             <div 
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white/30 hover:text-white transition-colors cursor-pointer p-2 rounded-full hover:bg-black/30"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
             >
                <ChevronRight size={40} strokeWidth={1} />
             </div>
          )}
        </>
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
                  className="w-12 h-12 -ml-6 -mt-6 rounded-full bg-white/10 backdrop-blur-md border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center justify-center animate-pulse hover:animate-none hover:scale-110 transition-transform group"
                >
                  <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_white] group-hover:scale-125 transition-transform"></div>
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
                    className="cursor-pointer bg-black/60 backdrop-blur-lg border border-white/20 text-white px-4 py-2 rounded-full font-bold shadow-xl hover:bg-black/80 transition active:scale-95 whitespace-nowrap"
                  >
                    {obj.label}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewObjectId(null); }}
                    className="bg-black/50 backdrop-blur-md text-zinc-300 rounded-full p-1 hover:text-white hover:bg-black/70 border border-white/10"
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
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setActiveObject(null)} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-zinc-900/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl text-center w-72 animate-in fade-in zoom-in duration-200 border border-white/10">
             <button 
               onClick={() => setActiveObject(null)}
               className="absolute top-4 right-4 text-zinc-500 hover:text-white"
             >
               <X size={20} />
             </button>

             <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{activeObject.label}</h3>
             <p className="text-zinc-400 mb-8 font-medium text-lg border-t border-white/10 pt-2 inline-block px-4">{activeObject.nativeLabel}</p>
             
             <button 
                onClick={() => handlePlayAudio(activeObject.label, activeObject.id)} 
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-all ${audioLoadingId === activeObject.id ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95'}`}
             >
               {audioLoadingId === activeObject.id ? (
                 <Loader2 className="animate-spin" size={28} />
               ) : (
                 <Volume2 size={28} />
               )}
             </button>
             <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Tap to Listen</p>
          </div>
        </>
      )}

      {/* End of List Dialog */}
      {showEndDialog && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-zinc-900/95 border border-white/10 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
              <div className="w-16 h-16 bg-white/5 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-white/10">
                🎉
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Review Complete!</h2>
              <p className="text-zinc-400 mb-6">You've reached the end of your gallery.</p>
              
              <div className="space-y-3">
                 <button 
                   onClick={handleShuffleReview}
                   className="w-full bg-white text-black py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-gray-200 transition active:scale-95"
                 >
                   <Shuffle size={18} />
                   Shuffle & Review
                 </button>
                 <button 
                   onClick={() => navigate('/')}
                   className="w-full bg-black/50 border border-white/10 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition active:scale-95"
                 >
                   <LayoutGrid size={18} />
                   Return to Gallery
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Comments Area (Collapsible) */}
      <div 
        className={`mt-auto z-20 w-full px-4 pb-2 transition-all duration-300 ease-in-out flex flex-col ${commentsCollapsed ? 'h-auto' : 'max-h-[60%]'}`}
      >
        {/* Collapse Toggle Header */}
        <div className="flex justify-center mb-2">
            <button 
              onClick={() => setCommentsCollapsed(!commentsCollapsed)}
              className="bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 hover:bg-black/80 transition"
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
              <div key={comment.id} className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-white/5 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1
                     ${comment.persona === 'Beginner' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : ''}
                     ${comment.persona === 'Grammar Geek' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : ''}
                     ${comment.persona === 'Poetic Master' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : ''}
                  `}>
                    {comment.persona}
                  </span>
                  <div className="flex-1"></div>
                  <button 
                    onClick={() => handlePlayAudio(comment.content, comment.id)} 
                    className={`opacity-60 hover:opacity-100 transition-all active:scale-90 ${audioLoadingId === comment.id ? 'animate-pulse text-indigo-400' : ''}`}
                  >
                    {audioLoadingId === comment.id ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                  </button>
                </div>
                <p className="text-lg leading-snug font-medium mb-1 drop-shadow-sm">{comment.content}</p>
                <p className="text-sm text-zinc-400">{comment.translation}</p>
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
            placeholder="Practice a sentence..." 
            className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:bg-white/20 transition text-sm focus:border-white/30"
          />
          <button 
            onClick={toggleHeart}
            className={`p-3 rounded-full transition-transform active:scale-90 border border-transparent ${currentNote.isMastered ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10 hover:text-zinc-300'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={currentNote.isMastered ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button 
            onClick={toggleStar}
            className={`p-3 rounded-full transition-transform active:scale-90 border border-transparent ${currentNote.isStarred ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10 hover:text-zinc-300'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={currentNote.isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>
        </div>
      </div>

      {/* Poster Overlay */}
      {showPoster && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div ref={posterRef} className="bg-zinc-900 p-5 rounded-2xl shadow-2xl max-w-sm w-full transform rotate-1 mb-8 border border-white/10">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-xl relative mb-4 bg-black">
               <img src={currentNote.imageUrl} className="w-full h-full object-cover" crossOrigin="anonymous" />
               <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 pt-24">
                  <p className="text-white font-serif italic text-xl text-center leading-relaxed drop-shadow-md">
                    "{currentNote.comments.find(c => c.persona === 'Poetic Master')?.content}"
                  </p>
               </div>
            </div>
            <div className="flex justify-between items-center text-zinc-500 text-[10px] uppercase tracking-widest font-bold px-1">
               <div className="flex items-center gap-1">
                 <div className="w-2 h-2 rounded-full bg-white"></div>
                 <span>PicPic</span>
               </div>
               <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-4 w-full max-w-sm">
             <button onClick={() => setShowPoster(false)} className="flex-1 bg-black/50 text-white py-3 rounded-xl font-bold border border-white/10 hover:bg-white/10 transition">Close</button>
             <button onClick={downloadPoster} className="flex-1 bg-white text-black py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-gray-200 transition flex items-center justify-center gap-2">
               <Download size={18} />
               Save
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Profile Page (Redesigned)
const ProfilePage = () => {
  const { notes, settings, updateSettings } = useApp();
  const navigate = useNavigate();

  const stats = {
    notes: notes.length,
    words: notes.reduce((acc, note) => acc + note.objects.length, 0),
    sentences: notes.reduce((acc, note) => acc + (note.userSentence ? 1 : 0), 0)
  };

  const masteredCount = notes.filter(n => n.isMastered).length;
  const progressPercent = Math.min((stats.notes / 5) * 100, 100);

  const handleLogout = () => {
    // In a real app this would clear session, here we just go to onboarding for demo
    updateSettings({ onboarded: false });
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-black pb-32 text-white">
      {/* Header Card */}
      <div className="bg-zinc-900 pt-safe pb-8 px-6 rounded-b-[2.5rem] shadow-lg mb-6 relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-0 p-6 opacity-10">
           <Globe size={120} className="text-white" />
        </div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-5xl shadow-xl mb-4 border-2 border-white/20">
            🧙‍♂️
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Language Explorer</h2>
          
          <div className="flex items-center gap-3 mt-3 bg-black/40 pl-4 pr-3 py-1.5 rounded-full border border-white/5">
             <span className="text-sm font-semibold text-zinc-400">{settings.nativeLanguage}</span>
             <ArrowRight size={14} className="text-zinc-600" />
             <span className="text-sm font-bold text-white flex items-center gap-1">
               {settings.targetLanguage}
             </span>
          </div>
        </div>
        
        {/* Main Stats Row */}
        <div className="flex justify-between mt-8 px-6 max-w-sm mx-auto">
           <div className="text-center flex-1">
              <div className="text-2xl font-black text-white">{stats.notes}</div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Scenes</div>
           </div>
           <div className="w-px bg-white/10 h-10 self-center mx-2"></div>
           <div className="text-center flex-1">
              <div className="text-2xl font-black text-white">{stats.words}</div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Words</div>
           </div>
           <div className="w-px bg-white/10 h-10 self-center mx-2"></div>
           <div className="text-center flex-1">
              <div className="text-2xl font-black text-white">{masteredCount}</div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Mastered</div>
           </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-5 space-y-5">
        
        {/* Daily Goal Card */}
        <div className="bg-zinc-900 p-6 rounded-3xl shadow-lg border border-white/5">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="bg-yellow-500/20 p-1.5 rounded-lg text-yellow-500"><Zap size={18} fill="currentColor" /></span>
              Daily Goal
            </h3>
            <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-full text-zinc-400 border border-white/5">{stats.notes}/5</span>
          </div>
          
          <div className="relative h-3 bg-black rounded-full overflow-hidden mb-3 border border-white/5">
            <div 
              style={{ width: `${progressPercent}%` }} 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(234,179,8,0.5)]"
            ></div>
          </div>
          <p className="text-zinc-500 text-sm font-medium">
            {stats.notes >= 5 ? "Goal completed! Great job! 🎉" : `Capture ${5 - stats.notes} more photos to reach your goal.`}
          </p>
        </div>

        {/* Menu Items */}
        <div className="bg-zinc-900 rounded-3xl shadow-lg overflow-hidden border border-white/5">
           <button className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors border-b border-white/5 group">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition">
                 <Settings size={16} />
               </div>
               <span className="font-semibold text-zinc-200">Settings</span>
             </div>
             <ChevronDown size={16} className="text-zinc-600 -rotate-90" />
           </button>
           
           <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-red-400 group">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500/20 transition">
                 <LogOut size={16} />
               </div>
               <span className="font-semibold">Log Out</span>
             </div>
           </button>
        </div>
        
        <div className="text-center pt-4">
          <p className="text-xs font-medium text-zinc-700">PicPic v1.0.0</p>
        </div>
      </div>
    </div>
  );
};


// --- Main App Logic ---

const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  // Simple persistence with localStorage
  const [settings, setSettingsState] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('picpic_settings');
    return saved ? JSON.parse(saved) : { nativeLanguage: 'English', targetLanguage: 'Spanish', onboarded: false };
  });

  const [notes, setNotesState] = useState<LearningNote[]>(() => {
    const saved = localStorage.getItem('picpic_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettingsState(newSettings);
    localStorage.setItem('picpic_settings', JSON.stringify(newSettings));
  };

  const addNote = (note: LearningNote) => {
    const newNotes = [note, ...notes];
    setNotesState(newNotes);
    localStorage.setItem('picpic_notes', JSON.stringify(newNotes));
  };

  const updateNote = (id: string, updates: Partial<LearningNote>) => {
    const newNotes = notes.map(n => n.id === id ? { ...n, ...updates } : n);
    setNotesState(newNotes);
    localStorage.setItem('picpic_notes', JSON.stringify(newNotes));
  };

  return (
    <AppContext.Provider value={{ 
      settings, 
      updateSettings, 
      notes, 
      addNote, 
      updateNote,
      stats: { noteCount: notes.length, wordCount: 0, sentenceCount: 0 } // Computed in components
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
        <div className="font-sans antialiased text-white bg-black h-full">
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