
import { X, Zap, ChevronDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { LANGUAGES } from '../constants/languages';

export const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { settings, updateSettings, t } = useApp();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div
                className="bg-[#F2F2F7] w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300"
                onClick={e => e.stopPropagation()}
            >

                {/* Header */}
                <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-100 z-10">
                    <h2 className="text-xl font-black text-slate-900">{t.settings}</h2>
                    <button onClick={onClose} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">

                    {/* Daily Goal */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-white">
                        <div className="flex items-center gap-3 mb-4 text-slate-800 font-bold">
                            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><Zap size={20} /></div>
                            {t.dailyGoal}
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100">
                            <button
                                onClick={() => updateSettings({ dailyGoal: Math.max(1, settings.dailyGoal - 1) })}
                                className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 active:scale-95 transition hover:bg-gray-50"
                            >-</button>
                            <span className="text-3xl font-black text-slate-900 tabular-nums">{settings.dailyGoal}</span>
                            <button
                                onClick={() => updateSettings({ dailyGoal: settings.dailyGoal + 1 })}
                                className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 active:scale-95 transition hover:bg-gray-50"
                            >+</button>
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest px-1 ml-1">Languages</h3>

                        {/* Native */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-white">
                            <label className="block text-sm font-bold text-gray-500 mb-2 ml-1">{t.nativeTitle}</label>
                            <div className="relative">
                                <select
                                    value={settings.nativeLanguage}
                                    onChange={(e) => updateSettings({ nativeLanguage: e.target.value })}
                                    className="w-full bg-gray-50 text-slate-900 font-bold rounded-xl px-4 py-3 border border-gray-100 focus:ring-2 focus:ring-[#34C759] outline-none appearance-none"
                                >
                                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronDown size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Target */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-white">
                            <label className="block text-sm font-bold text-gray-500 mb-2 ml-1">{t.targetTitle}</label>
                            <div className="relative">
                                <select
                                    value={settings.targetLanguage}
                                    onChange={(e) => updateSettings({ targetLanguage: e.target.value })}
                                    className="w-full bg-gray-50 text-slate-900 font-bold rounded-xl px-4 py-3 border border-gray-100 focus:ring-2 focus:ring-[#34C759] outline-none appearance-none"
                                >
                                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronDown size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API Config (Key & Base URL) - HIDDEN BY DEFAULT FOR USER SAFETY
              Developers: Uncomment this block if you want to allow users to input their own keys via UI,
              or configure it in services/geminiService.ts using process.env.API_KEY
          */}
                    {/*
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-white">
             <div className="flex items-center gap-3 mb-4 text-slate-800 font-bold">
               <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Key size={20} /></div>
               {t.apiKey}
             </div>
             
             <div className="space-y-2 mb-4">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1">API Key</p>
                <input 
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  onBlur={handleSave}
                  placeholder={t.apiKeyPlaceholder}
                  className="w-full bg-gray-50 text-slate-900 rounded-xl px-4 py-3 border border-gray-100 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                />
             </div>

             <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-wider ml-1">{t.apiBaseUrl}</p>
                   <Link size={12} className="text-gray-400" />
                 </div>
                <input 
                  type="text"
                  value={tempBaseUrl}
                  onChange={(e) => setTempBaseUrl(e.target.value)}
                  onBlur={handleSave}
                  placeholder={t.apiBaseUrlPlaceholder}
                  className="w-full bg-gray-50 text-slate-900 rounded-xl px-4 py-3 border border-gray-100 focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                />
             </div>
             <p className="text-[10px] text-gray-400 mt-3 px-1">
               {t.apiKeyDesc}
             </p>
          </div>
          */}

                </div>
            </div>
        </div>
    );
};
