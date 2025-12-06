/**
 * IndexedDB Storage Service for PhotoAITalk
 * Provides persistent storage for learning notes with auto-migration from localStorage
 */

import { LearningNote, UserSettings } from '../types';

const DB_NAME = 'photoaitalk';
const DB_VERSION = 1;
const NOTES_STORE = 'notes';
const SETTINGS_STORE = 'settings';

let db: IDBDatabase | null = null;

/**
 * Initialize the IndexedDB database
 */
export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Failed to open IndexedDB:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('IndexedDB initialized successfully');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            // Create notes store
            if (!database.objectStoreNames.contains(NOTES_STORE)) {
                const notesStore = database.createObjectStore(NOTES_STORE, { keyPath: 'id' });
                notesStore.createIndex('timestamp', 'timestamp', { unique: false });
            }

            // Create settings store
            if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
                database.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
            }
        };
    });
};

/**
 * Save a note to IndexedDB
 */
export const saveNote = async (note: LearningNote): Promise<void> => {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([NOTES_STORE], 'readwrite');
        const store = transaction.objectStore(NOTES_STORE);
        const request = store.put(note);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

/**
 * Get all notes from IndexedDB
 */
export const getNotes = async (): Promise<LearningNote[]> => {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([NOTES_STORE], 'readonly');
        const store = transaction.objectStore(NOTES_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
            // Sort by timestamp descending (newest first)
            const notes = request.result.sort((a, b) => b.timestamp - a.timestamp);
            resolve(notes);
        };
        request.onerror = () => reject(request.error);
    });
};

/**
 * Update a note in IndexedDB
 */
export const updateNote = async (id: string, updates: Partial<LearningNote>): Promise<void> => {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([NOTES_STORE], 'readwrite');
        const store = transaction.objectStore(NOTES_STORE);
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const note = getRequest.result;
            if (note) {
                const updatedNote = { ...note, ...updates };
                const putRequest = store.put(updatedNote);
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
            } else {
                resolve(); // Note not found, silently resolve
            }
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
};

/**
 * Delete a note from IndexedDB
 */
export const deleteNote = async (id: string): Promise<void> => {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([NOTES_STORE], 'readwrite');
        const store = transaction.objectStore(NOTES_STORE);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

/**
 * Save settings to IndexedDB
 */
export const saveSettings = async (settings: UserSettings): Promise<void> => {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([SETTINGS_STORE], 'readwrite');
        const store = transaction.objectStore(SETTINGS_STORE);
        const request = store.put({ key: 'userSettings', ...settings });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

/**
 * Get settings from IndexedDB
 */
export const getSettings = async (): Promise<UserSettings | null> => {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction([SETTINGS_STORE], 'readonly');
        const store = transaction.objectStore(SETTINGS_STORE);
        const request = store.get('userSettings');

        request.onsuccess = () => {
            if (request.result) {
                const { key, ...settings } = request.result;
                resolve(settings as UserSettings);
            } else {
                resolve(null);
            }
        };
        request.onerror = () => reject(request.error);
    });
};

/**
 * Migrate data from localStorage to IndexedDB
 */
export const migrateFromLocalStorage = async (): Promise<boolean> => {
    try {
        // Check if migration already done
        const migrationKey = 'photoaitalk_migrated_to_indexeddb';
        if (localStorage.getItem(migrationKey)) {
            return false; // Already migrated
        }

        await initDB();

        // Migrate notes
        const notesJson = localStorage.getItem('photoaitalk_notes');
        if (notesJson) {
            const notes: LearningNote[] = JSON.parse(notesJson);
            for (const note of notes) {
                await saveNote(note);
            }
            console.log(`Migrated ${notes.length} notes to IndexedDB`);
        }

        // Migrate settings
        const settingsJson = localStorage.getItem('photoaitalk_settings');
        if (settingsJson) {
            const settings: UserSettings = JSON.parse(settingsJson);
            await saveSettings(settings);
            console.log('Migrated settings to IndexedDB');
        }

        // Mark migration as complete
        localStorage.setItem(migrationKey, 'true');

        // Optionally clear old localStorage data (commented for safety)
        // localStorage.removeItem('photoaitalk_notes');
        // localStorage.removeItem('photoaitalk_settings');

        console.log('Migration from localStorage to IndexedDB completed');
        return true;
    } catch (error) {
        console.error('Migration failed:', error);
        return false;
    }
};

/**
 * Storage Service API
 */
export const StorageService = {
    initDB,
    saveNote,
    getNotes,
    updateNote,
    deleteNote,
    saveSettings,
    getSettings,
    migrateFromLocalStorage,
};

export default StorageService;
