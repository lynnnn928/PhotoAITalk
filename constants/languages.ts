// Language definitions for PhotoAITalk

export interface Language {
    code: string;
    label: string;
    flag: string;
}

export const LANGUAGES: Language[] = [
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

export const THEME_COLOR = '#34C759';
