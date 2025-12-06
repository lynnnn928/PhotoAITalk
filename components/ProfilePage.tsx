import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, Zap, Settings, ChevronDown, LogOut } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { SettingsModal } from './SettingsModal';

export const ProfilePage = () => {
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
