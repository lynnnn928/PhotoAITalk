import React from 'react';
import { X, Bookmark, Volume2, Loader2 } from 'lucide-react';

interface PopupCardProps {
    title: string;
    subtitle: React.ReactNode;
    onClose: () => void;
    onSave?: () => void;
    isSaved?: boolean;
    onPlayAudio: () => void;
    isPlayingAudio: boolean;
    isLoading?: boolean; // For word translation loading
}

export const PopupCard: React.FC<PopupCardProps> = ({
    title,
    subtitle,
    onClose,
    onSave,
    isSaved = false,
    onPlayAudio,
    isPlayingAudio,
    isLoading = false
}) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl text-center w-72 animate-in fade-in zoom-in duration-200 border border-white/50 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                {/* Bookmark Button */}
                {onSave && (
                    <button
                        onClick={onSave}
                        className={`absolute top-4 left-4 p-2 rounded-full transition-colors ${isSaved ? 'text-[#34C759] bg-green-50' : 'text-gray-300 hover:text-gray-400'}`}
                    >
                        <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                )}
                {/* Placeholder for alignment if no save button */}
                {!onSave && (
                    <div className="absolute top-4 left-4 text-gray-300 p-2">
                        <Bookmark size={20} />
                    </div>
                )}

                <h3 className="text-3xl font-bold text-[#34C759] mb-1 mt-4 tracking-tight">{title}</h3>

                <div className="text-gray-500 mb-6 font-medium text-lg min-h-[1.75rem]">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                        subtitle
                    )}
                </div>

                <button
                    onClick={onPlayAudio}
                    className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${isPlayingAudio ? 'bg-green-100 text-[#34C759]' : 'bg-[#34C759] text-white shadow-lg shadow-green-300 active:scale-95'}`}
                >
                    {isPlayingAudio ? (
                        <Loader2 className="animate-spin" size={28} />
                    ) : (
                        <Volume2 size={28} />
                    )}
                </button>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tap to Listen</p>
            </div>
        </div>
    );
};
