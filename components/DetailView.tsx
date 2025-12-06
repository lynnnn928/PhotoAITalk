import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Loader2, ChevronLeft, ChevronRight, X, Share2, Volume2, Download,
    ChevronDown, ChevronUp, Bookmark, Layers, AlignVerticalJustifyCenter,
    AlertCircle, BookOpen, MoreVertical, Trash2, Eye, EyeOff
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';

import { LearningNote, InteractiveObject } from '../types';
import * as GeminiService from '../services/geminiService';
import { PopupCard } from './PopupCard';
import { useApp } from '../contexts/AppContext';

// 5. Detail View
export const DetailView = () => {
    const { notes, addNote, updateNote, deleteNote, settings, t } = useApp();
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
    const [posterDataUrl, setPosterDataUrl] = useState<string | null>(null); // For iOS save modal
    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null); // For poster selection
    const [isPosterOverlay, setIsPosterOverlay] = useState(true); // Poster layout mode
    const [commentsCollapsed, setCommentsCollapsed] = useState(true); // Default collapsed for focus on image
    const [showMenu, setShowMenu] = useState(false); // Top right menu
    const [selectedWord, setSelectedWord] = useState<{ text: string; translation: string; pinyin?: string; loading: boolean } | null>(null); // Word card state

    // Image dimension tracking for adaptive layout
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number; ratio: number } | null>(null);
    const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number } | null>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Toasts
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Swipe States
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const posterRef = useRef<HTMLDivElement>(null);

    // Handle image load to get dimensions
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        const ratio = img.naturalHeight / img.naturalWidth;
        setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight,
            ratio: ratio
        });
        // Also update container dimensions when image loads
        if (imageContainerRef.current) {
            setContainerDimensions({
                width: imageContainerRef.current.clientWidth,
                height: imageContainerRef.current.clientHeight
            });
        }
    };

    // Calculate bubble position to avoid screen edges
    const getBubblePosition = (x: number, y: number) => {
        const margin = 15; // percentage from edge
        let horizontal: 'left' | 'right' | 'center' = 'center';
        let vertical: 'top' | 'bottom' = 'top';

        // Horizontal positioning
        if (x < margin) horizontal = 'right';
        else if (x > 100 - margin) horizontal = 'left';

        // Vertical positioning
        if (y < 20) vertical = 'bottom';

        return { horizontal, vertical };
    };

    // Helper to normalize coordinates (handle pixels vs percentage)
    const normalizeCoordinate = (val: number, max: number) => {
        if (val > 100 && max > 0) {
            return (val / max) * 100;
        }
        return val;
    };

    // Calculate actual image render bounds for object-contain mode
    const getImageRenderBounds = () => {
        if (!imageDimensions || !containerDimensions) {
            return { offsetX: 0, offsetY: 0, renderWidth: containerDimensions?.width || 0, renderHeight: containerDimensions?.height || 0 };
        }

        const containerRatio = containerDimensions.width / containerDimensions.height;
        const imageRatio = imageDimensions.width / imageDimensions.height;

        let renderWidth, renderHeight, offsetX, offsetY;

        if (imageRatio > containerRatio) {
            // Image is wider - fills width, has vertical padding
            renderWidth = containerDimensions.width;
            renderHeight = containerDimensions.width / imageRatio;
            offsetX = 0;
            offsetY = (containerDimensions.height - renderHeight) / 2;
        } else {
            // Image is taller - fills height, has horizontal padding
            renderHeight = containerDimensions.height;
            renderWidth = containerDimensions.height * imageRatio;
            offsetX = (containerDimensions.width - renderWidth) / 2;
            offsetY = 0;
        }

        return { offsetX, offsetY, renderWidth, renderHeight };
    };

    // Convert percentage coordinates to pixel position within the actual image area
    const getPixelPosition = (percentX: number, percentY: number) => {
        const bounds = getImageRenderBounds();
        const pixelX = bounds.offsetX + (percentX / 100) * bounds.renderWidth;
        const pixelY = bounds.offsetY + (percentY / 100) * bounds.renderHeight;
        return { x: pixelX, y: pixelY };
    };

    // Update container dimensions on mount and resize
    useEffect(() => {
        const updateContainerSize = () => {
            if (imageContainerRef.current) {
                setContainerDimensions({
                    width: imageContainerRef.current.clientWidth,
                    height: imageContainerRef.current.clientHeight
                });
            }
        };

        updateContainerSize();
        window.addEventListener('resize', updateContainerSize);
        return () => window.removeEventListener('resize', updateContainerSize);
    }, []);

    // Track if we've already processed a new image to prevent duplicate analysis
    const hasProcessedRef = useRef(false);

    // Initialize or Load
    useEffect(() => {
        if (noteId === 'new') {
            // Prevent duplicate analysis on mobile (state object can change on resize/orientation)
            if (hasProcessedRef.current) return;

            if (state?.imageSrc) {
                hasProcessedRef.current = true;
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
                        hasProcessedRef.current = false; // Allow retry on error
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
    }


    const handleDelete = () => {
        if (!currentNote) return;
        if (confirm('Are you sure you want to delete this photo?')) {
            if (noteId !== 'new') {
                deleteNote(currentNote.id);
            }
            navigate('/');
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

    // Check if a word is already saved
    const isWordSaved = (word: string) => {
        if (!currentNote) return false;
        return currentNote.objects.some(obj => obj.label.toLowerCase() === word.toLowerCase() && obj.isSaved);
    };

    // Toggle saving a word (adds as a virtual object if not exists)
    const toggleWordSave = (word: string, translation: string) => {
        if (!currentNote) return;
        const lowerWord = word.toLowerCase();
        const existingIndex = currentNote.objects.findIndex(obj => obj.label.toLowerCase() === lowerWord);

        let updatedObjects;
        if (existingIndex >= 0) {
            // Toggle existing
            updatedObjects = [...currentNote.objects];
            updatedObjects[existingIndex] = {
                ...updatedObjects[existingIndex],
                isSaved: !updatedObjects[existingIndex].isSaved
            };
        } else {
            // Add new virtual object (off-screen)
            const newObj: InteractiveObject = {
                id: `word-${Date.now()}`,
                label: word,
                nativeLabel: translation,
                x: -100, // Off-screen
                y: -100,
                isSaved: true
            };
            updatedObjects = [...currentNote.objects, newObj];
        }

        const updatedNote = { ...currentNote, objects: updatedObjects };
        setCurrentNote(updatedNote);
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
        if (posterRef.current && currentNote) {
            try {
                // Preload image to ensure it's cached before capture
                const img = new Image();
                img.crossOrigin = 'anonymous';
                await new Promise<void>((resolve) => {
                    img.onload = () => resolve();
                    img.onerror = () => resolve(); // Continue even on error
                    img.src = currentNote.imageUrl;
                });

                // Wait for poster DOM to fully render (longer delay for first time)
                await new Promise(r => setTimeout(r, 300));

                const dataUrl = await htmlToImage.toPng(posterRef.current, {
                    cacheBust: true,
                });

                // Check if iOS Safari (doesn't support programmatic download)
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

                if (isIOS) {
                    // On iOS, show in-app modal for long-press save
                    setPosterDataUrl(dataUrl);
                } else {
                    // Desktop: use download link
                    const link = document.createElement('a');
                    link.download = `photoaitalk-poster-${Date.now()}.png`;
                    link.href = dataUrl;
                    link.click();
                }
            } catch (error) {
                console.error('Poster generation failed', error);
            }
        }
    }


    // Handle word click
    const handleWordClick = async (word: string, context: string) => {
        // Clean word (remove punctuation)
        const cleanWord = word.replace(/[.,!?;:()"]/g, '');
        if (!cleanWord) return;

        setSelectedWord({ text: cleanWord, translation: '', loading: true });

        // Fetch translation
        const result = await GeminiService.translateWord(
            cleanWord,
            context,
            settings.nativeLanguage,
            settings.targetLanguage
        );

        setSelectedWord({
            text: cleanWord,
            translation: result.translation,
            pinyin: result.pinyin,
            loading: false
        });
    };

    // Render text with clickable words
    const renderClickableText = (text: string) => {
        // Split by spaces but keep punctuation attached or separate?
        // Simple split by space for now
        return text.split(' ').map((word, idx) => (
            <span
                key={idx}
                onClick={(e) => {
                    e.stopPropagation();
                    handleWordClick(word, text);
                }}
                className="cursor-pointer hover:bg-[#34C759]/20 hover:text-[#34C759] rounded px-0.5 transition-colors"
            >
                {word}{' '}
            </span>
        ));
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
            {/* Background Image with Gaussian Blur */}
            <div
                ref={imageContainerRef}
                className="absolute inset-0 z-0 flex items-center justify-center"
            >
                {/* Blurred background layer - always show */}
                <img
                    src={currentNote.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60"
                />
                {/* Main image - always use contain */}
                <img
                    src={currentNote.imageUrl}
                    alt="Scene"
                    className="w-full h-full object-contain relative z-[1]"
                    onLoad={handleImageLoad}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none z-[2]" />
            </div>

            {/* Header Actions */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pt-safe pointer-events-none">
                <button onClick={handleSave} className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-md hover:bg-white/30 transition active:scale-95">
                    <ChevronLeft size={24} />
                </button>

                {/* More Menu */}
                <div className="relative pointer-events-auto">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-md hover:bg-white/30 transition active:scale-95"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-12 z-50 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/50 overflow-hidden min-w-[140px] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                <button
                                    onClick={handleDelete}
                                    className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-50 flex items-center gap-2 text-sm font-medium transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
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
                {/* Show hint if no objects detected */}
                {currentNote.objects.length === 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md text-white px-6 py-4 rounded-2xl text-center max-w-xs">
                        <p className="text-lg font-bold mb-2">🔍 No objects detected</p>
                        <p className="text-sm opacity-80">The AI couldn't identify objects in this image. Try uploading a clearer photo with distinct objects.</p>
                    </div>
                )}
                {/* Only render bubbles when dimensions are loaded */}
                {imageDimensions && containerDimensions && currentNote.objects.map(obj => {
                    const isPreview = previewObjectId === obj.id;
                    const normX = normalizeCoordinate(obj.x, imageDimensions.width);
                    const normY = normalizeCoordinate(obj.y, imageDimensions.height);
                    const bubblePos = getBubblePosition(normX, normY);
                    const pixelPos = getPixelPosition(normX, normY);

                    return (
                        <div
                            key={obj.id}
                            className="absolute"
                            style={{ left: `${pixelPos.x}px`, top: `${pixelPos.y}px` }}
                        >
                            {/* Dot - Visible only if not in preview mode for this object */}
                            {!isPreview && (
                                <button
                                    onClick={() => setPreviewObjectId(obj.id)}
                                    className="w-8 h-8 -ml-4 -mt-4 rounded-full bg-white/20 backdrop-blur-md border border-white/50 shadow-[0_0_12px_rgba(255,255,255,0.4)] flex items-center justify-center animate-pulse hover:animate-none hover:scale-110 transition-transform"
                                >
                                    <div className="w-2 h-2 bg-[#34C759] rounded-full shadow-glow"></div>
                                </button>
                            )}

                            {/* Preview Pill - Smart Edge Avoidance */}
                            {isPreview && (
                                <div
                                    className={`absolute flex items-center gap-2 z-30 animate-in fade-in zoom-in duration-200
                                        ${bubblePos.vertical === 'top' ? '-translate-y-full mb-2' : 'translate-y-2 mt-6'}
                                        ${bubblePos.horizontal === 'center' ? '-translate-x-1/2' : ''}
                                        ${bubblePos.horizontal === 'left' ? '-translate-x-full -ml-2' : ''}
                                        ${bubblePos.horizontal === 'right' ? 'ml-2' : ''}
                                    `}
                                >
                                    <div
                                        onClick={() => {
                                            setPreviewObjectId(null);
                                            setActiveObject(obj);
                                        }}
                                        className="cursor-pointer bg-white/20 backdrop-blur-lg border border-white/30 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-xl hover:bg-white/30 transition active:scale-95 whitespace-nowrap"
                                    >
                                        {obj.label}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setPreviewObjectId(null); }}
                                        className="bg-black/40 backdrop-blur-md text-white rounded-full p-1 hover:bg-black/60"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Full Object Card (Popover) */}
            {/* Full Object Card (Popover) */}
            {activeObject && (
                <PopupCard
                    title={activeObject.label}
                    subtitle={activeObject.nativeLabel}
                    onClose={() => setActiveObject(null)}
                    onSave={() => toggleObjectSave(activeObject.id)}
                    isSaved={activeObject.isSaved}
                    onPlayAudio={() => handlePlayAudio(activeObject.label, activeObject.id)}
                    isPlayingAudio={audioLoadingId === activeObject.id}
                />
            )}

            {/* Comments Area (Collapsible) */}
            <div
                className={`mt-auto z-20 w-full px-4 pb-2 transition-all duration-300 ease-in-out flex flex-col ${commentsCollapsed ? 'h-0 opacity-0 overflow-hidden' : 'max-h-[60%] opacity-100'}`}
            >

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
                                <p className="text-lg leading-snug font-medium mb-1 drop-shadow-sm pr-6">{renderClickableText(comment.content)}</p>
                                <p className="text-sm text-white/70">{comment.translation}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="z-20 w-full bg-black/80 backdrop-blur-xl px-6 py-4 pb-safe border-t border-white/10 shadow-2xl">
                <div className="flex items-center justify-between">
                    {/* Left: Native Expressions Toggle (Text Button) */}
                    <button
                        onClick={() => setCommentsCollapsed(!commentsCollapsed)}
                        className="flex items-center gap-2 text-white/90 hover:text-white transition-colors active:scale-95"
                    >
                        {commentsCollapsed ? <Eye size={20} /> : <EyeOff size={20} />}
                        <span className="text-sm font-medium">
                            {t.nativeExpressions || 'Native Expressions'}
                        </span>
                    </button>

                    {/* Right: Action Buttons Group */}
                    <div className="flex items-center gap-3">
                        {/* Share / Poster */}
                        <button
                            onClick={openPoster}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all active:scale-95"
                        >
                            <Share2 size={20} />
                        </button>

                        {/* Mastered / Collection */}
                        <button
                            onClick={toggleHeart}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${currentNote.isMastered ? 'bg-[#34C759] text-white shadow-[0_0_10px_rgba(52,199,89,0.5)]' : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'}`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill={currentNote.isMastered ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                        </button>
                    </div>
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

                        {/* Comment Selector - Text Labels */}
                        <div className="flex gap-2 justify-center">
                            {currentNote.comments.map(c => {
                                const isSelected = selectedCommentId === c.id;
                                let label = t.styleSimple || 'Simple';
                                if (c.persona === 'Grammar Geek') label = t.styleAdvanced || 'Advanced';
                                if (c.persona === 'Poetic Master') label = t.stylePoetic || 'Poetic';

                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCommentId(c.id)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${isSelected ? 'bg-white border-[#34C759] text-black shadow-lg -translate-y-1' : 'bg-white/10 border-transparent text-white/60 hover:bg-white/20 hover:text-white'}`}
                                    >
                                        {label}
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

            {/* iOS Save Modal - Shows generated poster for long-press save */}
            {posterDataUrl && (
                <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-4">
                    <div className="flex-1 w-full flex items-center justify-center overflow-auto">
                        <img
                            src={posterDataUrl}
                            alt="Generated Poster"
                            className="max-w-full max-h-full object-contain rounded-xl"
                        />
                    </div>
                    <p className="text-white text-center mt-4 mb-2 font-medium">📱 长按图片保存到相册</p>
                    <button
                        onClick={() => setPosterDataUrl(null)}
                        className="bg-white/10 text-white px-8 py-3 rounded-xl font-bold border border-white/20 hover:bg-white/20 transition mb-safe"
                    >
                        {t.close}
                    </button>
                </div>
            )}
            {/* Word Card Modal */}
            {/* Word Card Modal */}
            {selectedWord && (
                <PopupCard
                    title={selectedWord.text}
                    subtitle={selectedWord.loading ? null : selectedWord.translation}
                    isLoading={selectedWord.loading}
                    onClose={() => setSelectedWord(null)}
                    onPlayAudio={() => handlePlayAudio(selectedWord.text, 'word-audio')}
                    isPlayingAudio={audioLoadingId === 'word-audio'}
                    onSave={() => toggleWordSave(selectedWord.text, selectedWord.translation)}
                    isSaved={isWordSaved(selectedWord.text)}
                />
            )}
        </div>
    );
};