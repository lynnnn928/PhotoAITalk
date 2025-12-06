import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Flower, Camera, User } from 'lucide-react';
import { resizeImage } from '../utils/imageUtils';

export const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isHome = location.pathname === '/';
    const isProfile = location.pathname === '/profile';

    if (location.pathname.startsWith('/detail') || location.pathname === '/onboarding') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-20 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
            <button
                onClick={() => navigate('/')}
                className={`p-2 transition-all duration-300 flex-1 ${isHome ? 'text-[#34C759] scale-105' : 'text-gray-300 hover:text-gray-400'}`}
            >
                <div className="flex flex-col items-center gap-1">
                    <Flower size={26} strokeWidth={isHome ? 2.5 : 2} />
                    {isHome && <div className="w-1 h-1 bg-[#34C759] rounded-full" />}
                </div>
            </button>

            {/* The Floating Capture Button (Centered, slightly raised) */}
            <div className="relative -top-6 flex-1 flex justify-center">
                <label className="flex items-center justify-center w-16 h-16 bg-black text-white rounded-full shadow-lg shadow-gray-400/50 cursor-pointer transform transition-all hover:scale-105 active:scale-95">
                    <Camera size={28} />
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                try {
                                    // Resize image before navigating to prevent LocalStorage quota exceeded errors
                                    const resized = await resizeImage(file);
                                    navigate('/detail/new', { state: { imageSrc: resized } });
                                } catch (err) {
                                    console.error("Error processing image", err);
                                }
                            }
                        }}
                    />
                </label>
            </div>

            <button
                onClick={() => navigate('/profile')}
                className={`p-2 transition-all duration-300 flex-1 ${isProfile ? 'text-[#34C759] scale-105' : 'text-gray-300 hover:text-gray-400'}`}
            >
                <div className="flex flex-col items-center gap-1">
                    <User size={26} strokeWidth={isProfile ? 2.5 : 2} />
                    {isProfile && <div className="w-1 h-1 bg-[#34C759] rounded-full" />}
                </div>
            </button>
        </div>
    );
};
