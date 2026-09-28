import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mic, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { user } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-500 text-sm">👋</p>
          <h1 className="text-2xl font-display font-bold text-ink">{user?.name?.split(' ')[0] || t('appName')}</h1>
        </div>
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1.5 bg-white rounded-full px-3 py-2 text-sm font-semibold text-teal shadow-card"
        >
          <Globe size={15} />
          {lang === 'en' ? 'हिं' : 'EN'}
        </button>
      </div>

      <motion.button
        onClick={() => navigate('/assistant')}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-marigold rounded-xl2 p-5 shadow-soft flex items-center gap-4 mb-4 text-left"
      >
        <div className="w-14 h-14 bg-white/30 rounded-xl2 flex items-center justify-center flex-shrink-0">
          <Mic color="#1E2A28" size={28} />
        </div>
        <div>
          <h2 className="text-ink font-display font-bold text-lg">{t('talkTitle')}</h2>
          <p className="text-ink/70 text-sm">{t('talkSubtitle')}</p>
        </div>
      </motion.button>

      <motion.button
        onClick={() => navigate('/lessons')}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="w-full bg-teal rounded-xl2 p-5 shadow-soft flex items-center gap-4 text-left"
      >
        <div className="w-14 h-14 bg-white/20 rounded-xl2 flex items-center justify-center flex-shrink-0">
          <BookOpen color="white" size={28} />
        </div>
        <div>
          <h2 className="text-white font-display font-bold text-lg">{t('lessonsTitle')}</h2>
          <p className="text-teal-light text-sm">{t('lessonsSubtitle')}</p>
        </div>
      </motion.button>

    </div>
  );
}
