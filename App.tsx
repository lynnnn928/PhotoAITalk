
import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Import components from modular files
import { DetailView } from './components/DetailView';
import { HomePage } from './components/HomePage';
import { ProfilePage } from './components/ProfilePage';
import { Onboarding } from './components/Onboarding';
import { BottomNav } from './components/BottomNav';

// Import context
import { AppProvider, useApp } from './contexts/AppContext';

// --- App Orchestration ---

const AppContent = () => {
  const { settings } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to onboarding if not done
  useEffect(() => {
    if (!settings.onboarded && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
    }
  }, [settings.onboarded, location.pathname, navigate]);

  return (
    <div className="h-full w-full flex flex-col bg-[#F2F2F7]">
      <div className="flex-1 relative overflow-hidden w-full h-full">
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/detail/:id" element={<DetailView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </HashRouter>
  );
};

export default App;
