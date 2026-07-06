import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SyncBanner({ isOnline, syncStatus }) {
  const { t } = useLanguage();

  let content = null;
  if (!isOnline) {
    content = { icon: WifiOff, text: t('offlineBanner'), bg: 'bg-ink text-white' };
  } else if (syncStatus === 'syncing') {
    content = { icon: RefreshCw, text: t('syncingBanner'), bg: 'bg-marigold text-ink', spin: true };
  } else if (syncStatus === 'synced') {
    content = { icon: CheckCircle2, text: t('syncedBanner'), bg: 'bg-teal text-white' };
  }

  return (
    <AnimatePresence>
      {content && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className={`${content.bg} flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium sticky top-0 z-30`}
        >
          <content.icon size={16} className={content.spin ? 'animate-spin' : ''} />
          {content.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
