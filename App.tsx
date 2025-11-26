import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Camera, Home, User, Settings, Loader2, RefreshCw, Search, ChevronDown, ChevronUp, X, Share2, Volume2, Download, ArrowRight, Check, Zap, Globe, LogOut } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

import { UserSettings, LearningNote, Stats, InteractiveObject } from './types';
import * as GeminiService from './services/geminiService';

// --- Constants ---
const LANGUAGES = [
  { code: 'Chinese', label: '中文', flag: '🇨🇳' },
  { code: 'English', label: 'English', flag: '🇺🇸' },
  { code: 'British', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'French', label: 'Français', flag: '🇫🇷' },
  { code: 'Spanish', label: 'Español', flag: '🇪🇸' },
  { code: 'Japanese', label: '日本語', flag: '🇯🇵' },
  { code: 'Korean', label: '한국어', flag: '🇰🇷' },
  { code: 'German', label: 'Deutsch', flag: '🇩🇪' },
];

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

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col relative overflow-hidden">
      {/* Progress / Navigation */}
      <div className="pt-safe px-6 pb-2 flex justify-between items-center">
        {step === 1 && (
          <button onClick={() => setStep(0)} className="p-2 -ml-2 text-gray-400 hover:text-gray-800 transition">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        )}
        <div className="flex-1"></div>
      </div>

      {/* Header */}
      <div className="px-8 mb-6 text-center">
        <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
          {step === 0 ? "What is your native language?" : "What do you want to learn?"}
        </h1>
        <p className="text-gray-500 text-xs font-medium px-4">
          {step === 0 
            ? "We'll use this to provide translations." 
            : "Switching languages will not affect your mastered words."}
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="grid grid-cols-2 gap-4">
          {LANGUAGES.map((lang) => {
            const isSelected = currentSelection === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelection(lang.code)}
                className={`
                  relative flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-200
                  ${isSelected 
                    ? 'bg-white ring-[3px] ring-black shadow-lg scale-[1.02] z-10' 
                    : 'bg-white shadow-sm hover:bg-gray-50 border border-transparent'}
                `}
              >
                <span className="text-5xl mb-3 filter drop-shadow-sm">{lang.flag}</span>
                <span className={`text-base font-bold ${isSelected ? 'text-black' : 'text-gray-600'}`}>
                  {lang.label}
                </span>
                {isSelected && (
                   <div className="absolute top-3 right-3 text-black">
                     <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" strokeWidth={4} />
                     </div>
                   </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Fixed Button */}
      <div className="fixed bottom-0 left-0 right-0 p-8 pb-safe bg-gradient-to-t from-[#F2F2F7] via-[#F2F2F7] to-transparent z-20 flex justify-center">
        <button
          onClick={handleNext}
          className="bg-black text-white w-full max-w-xs py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {step === 0 ? (
            <>Next <ArrowRight size={20} /></>
          ) : (
            "Start Learning"
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
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 pb-safe pt-2 px-8 flex justify-between items-center z-50 h-20 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
      <button 
        onClick={() => navigate('/')} 
        className={`p-2 transition-all duration-300 ${isHome ? 'text-black scale-105' : 'text-gray-300 hover:text-gray-400'}`}
      >
        <div className="flex flex-col items-center gap-1">
          <Home size={26} strokeWidth={isHome ? 2.5 : 2} />
          {isHome && <div className="w-1 h-1 bg-black rounded-full" />}
        </div>
      </button>

      {/* The Floating Capture Button */}
      <div className="relative -top-6">
        <label className="flex items-center justify-center w-16 h-16 bg-black text-white rounded-full shadow-lg shadow-gray-400/50 cursor-pointer transform transition-all hover:scale-105 active:scale-95">
          <Camera size={28} />
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
        className={`p-2 transition-all duration-300 ${isProfile ? 'text-black scale-105' : 'text-gray-300 hover:text-gray-400'}`}
      >
        <div className="flex flex-col items-center gap-1">
          <User size={26} strokeWidth={isProfile ? 2.5 : 2} />
          {isProfile && <div className="w-1 h-1 bg-black rounded-full" />}
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
    <div className="min-h-screen bg-[#F2F2F7] pb-24">
      {/* Modern Header */}
      <div className="sticky top-0 z-20 bg-[#F2F2F7]/95 backdrop-blur-xl pt-safe px-6 pb-2 transition-all">
        <div className="flex items-center justify-between mb-4 mt-2">
          <h1 className="text-3xl font-black text-black tracking-tight">Gallery</h1>
          <button 
            onClick={handleShuffle} 
            className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:text-black hover:scale-105 transition-all"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        
        {/* Modern Search Bar */}
        <div className="relative group mb-2">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400 group-focus-within:text-black transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search your world..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white text-gray-900 rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-black/5 shadow-sm border-none text-base font-medium placeholder:text-gray-400 transition-all"
          />
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="px-4 pt-2 masonry-grid">
        {filtered.map(note => (
          <div 
            key={note.id} 
            onClick={() => navigate(`/detail/${note.id}`)}
            className="break-inside-avoid mb-4 bg-white rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer relative group transform hover:-translate-y-1"
          >
            <div className="relative">
               <img src={note.imageUrl} alt="Note" className="w-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
               {/* Date Badge */}
               <div className="absolute top-3 left-3 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg">
                 <p className="text-[10px] font-bold text-white/90">
                   {new Date(note.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                 </p>
               </div>
               {/* Star Badge */}
               {note.isStarred && (
                <div className="absolute top-3 right-3 bg-amber-400 text-white p-1.5 rounded-full shadow-sm">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </div>
               )}
            </div>
            
            <div className="p-4">
              <p className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-3">
                "{note.comments.find(c => c.persona === 'Beginner')?.content}"
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {note.objects.slice(0, 3).map(obj => (
                  <span key={obj.id} className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                    {obj.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
             <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl opacity-50">📷</div>
             <p className="font-medium">Capture a photo to start!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Detail View (Kept mostly the same, ensuring consistent feel)
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

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F2F2F7] space-y-4">
        <Loader2 className="animate-spin text-black" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">Observing the scene...</p>
      </div>
    );
  }

  if (!currentNote) return null;

  return (
    <div className="h-screen w-full bg-black relative flex flex-col overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={currentNote.imageUrl} alt="Scene" className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Header Actions */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pt-safe">
        <button onClick={() => { handleSave(); navigate('/'); }} className="text-white drop-shadow-md p-2 rounded-full hover:bg-white/10 transition">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button onClick={() => setShowPoster(true)} className="flex items-center gap-1 text-white drop-shadow-md bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold border border-white/30 hover:bg-white/30 transition">
          <Share2 size={14} />
          Share
        </button>
      </div>

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
                  <div className="w-3 h-3 bg-white rounded-full shadow-glow"></div>
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl text-center w-72 animate-in fade-in zoom-in duration-200 border border-white/50">
             <button 
               onClick={() => setActiveObject(null)}
               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
             >
               <X size={20} />
             </button>

             <h3 className="text-3xl font-bold text-indigo-900 mb-1">{activeObject.label}</h3>
             <p className="text-gray-500 mb-6 font-medium text-lg">{activeObject.nativeLabel}</p>
             
             <button 
                onClick={() => handlePlayAudio(activeObject.label, activeObject.id)} 
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${audioLoadingId === activeObject.id ? 'bg-indigo-100 text-indigo-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-300 active:scale-95'}`}
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
              <div key={comment.id} className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1 text-indigo-200">
                    {comment.persona === 'Beginner' && '🐣 Beginner'}
                    {comment.persona === 'Grammar Geek' && '🤓 Grammar'}
                    {comment.persona === 'Poetic Master' && '🎭 Poetic'}
                  </span>
                  <button 
                    onClick={() => handlePlayAudio(comment.content, comment.id)} 
                    className={`opacity-80 hover:opacity-100 transition-transform active:scale-90 ${audioLoadingId === comment.id ? 'animate-pulse text-indigo-300' : ''}`}
                  >
                    {audioLoadingId === comment.id ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                  </button>
                </div>
                <p className="text-lg leading-snug font-medium mb-1 drop-shadow-sm">{comment.content}</p>
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
            placeholder="Practice a sentence..." 
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:bg-white/20 transition text-sm"
          />
          <button 
            onClick={toggleHeart}
            className={`p-3 rounded-full transition-transform active:scale-90 ${currentNote.isMastered ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/50' : 'bg-white/10 text-white/60'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={currentNote.isMastered ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button 
            onClick={toggleStar}
            className={`p-3 rounded-full transition-transform active:scale-90 ${currentNote.isStarred ? 'bg-amber-400 text-white shadow-lg shadow-amber-900/50' : 'bg-white/10 text-white/60'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={currentNote.isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>
        </div>
      </div>

      {/* Poster Overlay */}
      {showPoster && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
          <div ref={posterRef} className="bg-white p-5 rounded-2xl shadow-2xl max-w-sm w-full transform rotate-1 mb-6">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-xl relative mb-4 bg-gray-100">
               <img src={currentNote.imageUrl} className="w-full h-full object-cover" crossOrigin="anonymous" />
               <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-20">
                  <p className="text-white font-serif italic text-xl text-center leading-relaxed drop-shadow-md">
                    "{currentNote.comments.find(c => c.persona === 'Poetic Master')?.content}"
                  </p>
               </div>
            </div>
            <div className="flex justify-between items-center text-gray-400 text-[10px] uppercase tracking-widest font-bold px-1">
               <div className="flex items-center gap-1">
                 <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                 <span>PicPic</span>
               </div>
               <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-4 w-full max-w-sm">
             <button onClick={() => setShowPoster(false)} className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold border border-white/20 hover:bg-white/20 transition">Close</button>
             <button onClick={downloadPoster} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/50 hover:bg-indigo-500 transition flex items-center justify-center gap-2">
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
    <div className="min-h-screen bg-[#F2F2F7] pb-32">
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
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Scenes</div>
           </div>
           <div className="w-px bg-gray-100 h-10 self-center mx-2"></div>
           <div className="text-center flex-1">
              <div className="text-2xl font-black text-slate-900">{stats.words}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Words</div>
           </div>
           <div className="w-px bg-gray-100 h-10 self-center mx-2"></div>
           <div className="text-center flex-1">
              <div className="text-2xl font-black text-slate-900">{masteredCount}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Mastered</div>
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
              Daily Goal
            </h3>
            <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-full text-gray-500">{stats.notes}/5</span>
          </div>
          
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div 
              style={{ width: `${progressPercent}%` }} 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
            ></div>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            {stats.notes >= 5 ? "Goal completed! Great job! 🎉" : `Capture ${5 - stats.notes} more photos to reach your goal.`}
          </p>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-white">
           <button className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-100">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                 <Settings size={16} />
               </div>
               <span className="font-semibold text-gray-700">Settings</span>
             </div>
             <ChevronDown size={16} className="text-gray-400 -rotate-90" />
           </button>
           
           <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-red-500">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                 <LogOut size={16} />
               </div>
               <span className="font-semibold">Log Out</span>
             </div>
           </button>
        </div>
        
        <div className="text-center pt-4">
          <p className="text-xs font-medium text-gray-300">PicPic v1.0.0</p>
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
        <div className="font-sans antialiased text-slate-900 bg-[#F2F2F7] h-full">
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