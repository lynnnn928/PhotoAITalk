import React, { createContext, useContext, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { UserSettings, LearningNote, Stats } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { StorageService } from '../services/storageService';

interface AppContextType {
    settings: UserSettings;
    updateSettings: (s: Partial<UserSettings>) => void;
    notes: LearningNote[];
    addNote: (note: LearningNote) => void;
    updateNote: (id: string, updates: Partial<LearningNote>) => void;
    deleteNote: (id: string) => void;
    stats: Stats;
    t: any; // helper for translations
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
};

export const AppProvider = ({ children }: { children?: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettingsState] = useState<UserSettings>({
        nativeLanguage: 'English',
        targetLanguage: 'Spanish',
        dailyGoal: 5,
        onboarded: false,
    });
    const [notes, setNotesState] = useState<LearningNote[]>([]);

    // Initialize IndexedDB and load data
    useEffect(() => {
        const initStorage = async () => {
            try {
                // Initialize database
                await StorageService.initDB();

                // Run migration from localStorage (if not already done)
                await StorageService.migrateFromLocalStorage();

                // Load settings
                const savedSettings = await StorageService.getSettings();
                if (savedSettings) {
                    setSettingsState(prev => ({ ...prev, ...savedSettings }));
                } else {
                    // Fallback to localStorage for first load
                    const localSettings = localStorage.getItem('photoaitalk_settings');
                    if (localSettings) {
                        setSettingsState(prev => ({ ...prev, ...JSON.parse(localSettings) }));
                    }
                }

                // Load notes
                const savedNotes = await StorageService.getNotes();
                if (savedNotes.length > 0) {
                    setNotesState(savedNotes);
                } else {
                    // Fallback to localStorage for first load
                    const localNotes = localStorage.getItem('photoaitalk_notes');
                    if (localNotes) {
                        setNotesState(JSON.parse(localNotes));
                    }
                }
            } catch (error) {
                console.error('Failed to initialize storage:', error);
                // Fallback to localStorage
                const localSettings = localStorage.getItem('photoaitalk_settings');
                const localNotes = localStorage.getItem('photoaitalk_notes');
                if (localSettings) setSettingsState(prev => ({ ...prev, ...JSON.parse(localSettings) }));
                if (localNotes) setNotesState(JSON.parse(localNotes));
            } finally {
                setIsLoading(false);
            }
        };

        initStorage();
    }, []);

    const updateSettings = async (updates: Partial<UserSettings>) => {
        const newSettings = { ...settings, ...updates };
        setSettingsState(newSettings);

        try {
            await StorageService.saveSettings(newSettings);
        } catch (e) {
            // Fallback to localStorage
            localStorage.setItem('photoaitalk_settings', JSON.stringify(newSettings));
        }
    };

    const addNote = async (note: LearningNote) => {
        const newNotes = [note, ...notes];
        setNotesState(newNotes);

        try {
            await StorageService.saveNote(note);
        } catch (e) {
            console.error("Error saving note:", e);
            // Fallback to localStorage
            try {
                localStorage.setItem('photoaitalk_notes', JSON.stringify(newNotes));
            } catch (localError) {
                console.error("localStorage also failed:", localError);
            }
        }
    };

    const updateNote = async (id: string, updates: Partial<LearningNote>) => {
        const newNotes = notes.map(n => n.id === id ? { ...n, ...updates } : n);
        setNotesState(newNotes);

        try {
            await StorageService.updateNote(id, updates);
        } catch (e) {
            console.error("Error updating note:", e);
            // Fallback to localStorage
            try {
                localStorage.setItem('photoaitalk_notes', JSON.stringify(newNotes));
            } catch (localError) {
                console.error("localStorage also failed:", localError);
            }
        }
    };

    const deleteNote = async (id: string) => {
        const newNotes = notes.filter(n => n.id !== id);
        setNotesState(newNotes);

        try {
            await StorageService.deleteNote(id);
        } catch (e) {
            console.error("Error deleting note:", e);
            // Fallback to localStorage
            try {
                localStorage.setItem('photoaitalk_notes', JSON.stringify(newNotes));
            } catch (localError) {
                console.error("localStorage also failed:", localError);
            }
        }
    };

    const t = TRANSLATIONS[settings.nativeLanguage] || TRANSLATIONS['English'];

    // Show loading state while initializing
    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#F2F2F7]">
                <Loader2 className="w-8 h-8 animate-spin text-[#34C759]" />
            </div>
        );
    }

    return (
        <AppContext.Provider value={{
            settings,
            updateSettings,
            notes,
            addNote,
            updateNote,
            deleteNote,
            stats: { noteCount: notes.length, wordCount: 0, sentenceCount: 0 },
            t
        }}>
            {children}
        </AppContext.Provider>
    );
};
