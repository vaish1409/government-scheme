import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAllLocalProgress } from '../db/offlineStore';
import Button from '../components/Button';

export default function Profile() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    getAllLocalProgress().then((events) => {
      setCompletedCount(events.filter((e) => e.completed).length);
    });
  }, []);

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <h1 className="text-2xl font-display font-bold text-ink mb-6">{t('profile')}</h1>

      <div className="bg-white rounded-xl2 shadow-card p-5 mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-teal-light flex items-center justify-center text-2xl font-display font-bold text-teal">
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg text-ink">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.phone}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-teal rounded-xl2 p-5 mb-4 text-center shadow-soft"
      >
        <p className="text-teal-light text-sm font-medium">{t('myProgress')}</p>
        <p className="text-4xl font-display font-extrabold text-white mt-1">{completedCount}</p>
        <p className="text-teal-light text-sm">{t('lessonsCompleted')}</p>
      </motion.div>

      <button
        onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
        className="w-full bg-white rounded-xl2 shadow-card p-4 flex items-center gap-3 mb-3"
      >
        <Globe className="text-teal" size={20} />
        <span className="font-medium text-ink">{lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}</span>
      </button>

      <Button variant="outline" icon={LogOut} onClick={logout}>{t('logout')}</Button>
    </div>
  );
}
