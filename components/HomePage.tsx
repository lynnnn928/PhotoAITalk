import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flower, RefreshCw, Search, Sprout, ArrowDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { LearningNote } from '../types';

export const HomePage = () => {
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
                <div className="px-2 pt-2 pb-24 relative z-10 mx-auto max-w-[1600px]">

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
                            // Responsive Grid Layout (more reliable than CSS columns)
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                {filteredNotes.map(note => (
                                    <div
                                        key={note.id}
                                        onClick={() => navigate(`/detail/${note.id}`)}
                                        className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition-all cursor-pointer relative group transform hover:-translate-y-1 hover:scale-[1.01]"
                                    >
                                        <div className="relative aspect-square">
                                            <img src={note.imageUrl} alt="Note" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                            <div className="absolute top-2 left-2 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-lg">
                                                <p className="text-[10px] font-bold text-white/90">
                                                    {new Date(note.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-2">
                                            <p className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 mb-1.5">
                                                "{note.comments.find(c => c.persona === 'Beginner')?.content}"
                                            </p>
                                            <div className="flex gap-1 flex-wrap">
                                                {note.objects.slice(0, 3).map(obj => (
                                                    <span key={obj.id} className="text-[9px] font-semibold bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded-full border border-gray-100">
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
