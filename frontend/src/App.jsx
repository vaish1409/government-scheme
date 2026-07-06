import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { useSync } from './hooks/useSync';

import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Lessons from './pages/Lessons';
import LessonPlayer from './pages/LessonPlayer';
import Schemes from './pages/Schemes';
import SchemeDetail from './pages/SchemeDetail';
import Eligibility from './pages/Eligibility';
import EligibilityResults from './pages/EligibilityResults';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import SyncBanner from './components/SyncBanner';

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { isOnline, status } = useSync(!!user);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">...</div>;
  if (!user) return <Navigate to="/" replace state={{ from: location }} />;

  // Hide the bottom nav on full-screen flows like the lesson player and quiz
  const hideNav = ['/lessons/', '/eligibility', '/schemes/'].some((p) => location.pathname.startsWith(p))
    && location.pathname !== '/schemes';

  return (
    <div className="min-h-screen bg-cream">
      <SyncBanner isOnline={isOnline} syncStatus={status} />
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/home" element={<ProtectedLayout><Home /></ProtectedLayout>} />
      <Route path="/lessons" element={<ProtectedLayout><Lessons /></ProtectedLayout>} />
      <Route path="/lessons/:id" element={<ProtectedLayout><LessonPlayer /></ProtectedLayout>} />
      <Route path="/schemes" element={<ProtectedLayout><Schemes /></ProtectedLayout>} />
      <Route path="/schemes/:slug" element={<ProtectedLayout><SchemeDetail /></ProtectedLayout>} />
      <Route path="/eligibility" element={<ProtectedLayout><Eligibility /></ProtectedLayout>} />
      <Route path="/eligibility/results" element={<ProtectedLayout><EligibilityResults /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
