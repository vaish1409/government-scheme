import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mic, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';

export default function Onboarding() {
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-10 bg-gradient-to-b from-teal-light to-cream">
      {/* Language toggle — top right, always visible, never buried in a menu */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1.5 bg-white/80 rounded-full px-4 py-2 text-sm font-semibold text-teal shadow-soft"
        >
          <Globe size={16} />
          {lang === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>

      <div className="flex flex-col items-center text-center mt-4">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="w-28 h-28 bg-teal rounded-full flex items-center justify-center shadow-soft mb-6"
        >
          <Mic size={56} color="white" strokeWidth={1.8} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl font-display font-extrabold text-ink"
        >
          {t('appName')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-lg text-gray-600 mt-2 font-medium"
        >
          {t('tagline')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 mt-8 w-full"
        >
          <div className="bg-white rounded-xl2 p-4 shadow-card flex flex-col items-center gap-2">
            <Mic className="text-teal" size={28} />
            <p className="text-sm font-semibold text-ink">{t('onbTalk')}</p>
          </div>
          <div className="bg-white rounded-xl2 p-4 shadow-card flex flex-col items-center gap-2">
            <GraduationCap className="text-marigold-dark" size={28} />
            <p className="text-sm font-semibold text-ink">{t('onbCourses')}</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <Button variant="marigold" icon={Mic} onClick={() => navigate('/assistant')}>{t('startTalking')}</Button>
        <Button variant="ghost" onClick={() => navigate('/login')}>{t('login')}</Button>
        <Button variant="ghost" onClick={() => navigate('/signup')}>{t('signup')}</Button>
        <button onClick={() => navigate('/officer')} className="w-full text-center text-sm text-gray-500 underline">{t('officerLink')}</button>
      </motion.div>
    </div>
  );
}
