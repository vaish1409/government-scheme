import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PartyPopper, ArrowLeft } from 'lucide-react';
import SchemeCard from '../components/SchemeCard';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';

export default function EligibilityResults() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const results = state?.results;

  if (!results) {
    navigate('/eligibility');
    return null;
  }

  const { eligibleSchemes, eligibleCount } = results;

  return (
    <div className="min-h-screen bg-cream px-5 pt-6 pb-10 max-w-md mx-auto">
      <button onClick={() => navigate('/home')} className="tap-target -ml-3 mb-2">
        <ArrowLeft className="text-ink" />
      </button>

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        className="text-center py-6"
      >
        {eligibleCount > 0 ? (
          <>
            <motion.div
              initial={{ rotate: -20 }}
              animate={{ rotate: [0, -15, 15, -8, 0] }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-block"
            >
              <PartyPopper size={48} className="text-marigold" />
            </motion.div>
            <h1 className="text-2xl font-display font-bold text-ink mt-3">
              {t('eligibleFor')} {eligibleCount} {t('schemesFound')}!
            </h1>
          </>
        ) : (
          <>
            <p className="text-5xl mb-2">🔍</p>
            <h1 className="text-xl font-display font-bold text-ink">{t('noSchemesFound')}</h1>
          </>
        )}
      </motion.div>

      <div className="space-y-3 mt-4">
        {eligibleSchemes.map((scheme, i) => (
          <SchemeCard
            key={scheme.id}
            scheme={scheme}
            index={i}
            onClick={() => navigate(`/schemes/${scheme.slug}`)}
          />
        ))}
      </div>

      <div className="mt-8">
        <Button variant="outline" onClick={() => navigate('/home')}>{t('home')}</Button>
      </div>
    </div>
  );
}
