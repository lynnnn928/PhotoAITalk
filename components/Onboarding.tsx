import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { LANGUAGES } from '../constants/languages';
import { TRANSLATIONS } from '../constants/translations';

export const Onboarding = () => {
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
