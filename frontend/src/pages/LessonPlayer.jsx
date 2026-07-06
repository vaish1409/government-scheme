import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { lessonsApi } from '../api/client';
import { queueProgressEvent } from '../db/offlineStore';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';

export default function LessonPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [lesson, setLesson] = useState(null);
  const [done, setDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    lessonsApi.list().then(({ data }) => {
      const found = data.lessons.find((l) => l.id === id);
      setLesson(found);
    });
  }, [id]);

  const markComplete = async () => {
    // This writes to IndexedDB immediately and returns — it does NOT wait on
    // a network call. The event syncs in the background whenever the device
    // is next online (see hooks/useSync.js). This is the whole point of
    // offline-first: the user's action is never blocked by connectivity.
    await queueProgressEvent({ lessonId: id, completed: true, progressPercent: 100 });
    setDone(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1400);
  };

  if (!lesson) {
    return <div className="p-6 text-center text-gray-400">...</div>;
  }

  return (
    <div className="min-h-screen bg-cream px-5 pt-6 pb-10 max-w-md mx-auto relative overflow-hidden">
      <button onClick={() => navigate(-1)} className="tap-target -ml-3 mb-3">
        <ArrowLeft className="text-ink" />
      </button>

      <div className="bg-teal rounded-xl2 aspect-video flex items-center justify-center mb-5 shadow-soft">
        {lesson.mediaType === 'video' ? (
          <video controls className="w-full h-full rounded-xl2" src={lesson.mediaUrl} poster={lesson.thumbnailUrl} />
        ) : (
          <div className="text-center">
            <p className="text-5xl mb-2">🎧</p>
            <audio controls className="mt-2" src={lesson.mediaUrl} />
          </div>
        )}
      </div>

      <h1 className="text-xl font-display font-bold text-ink mb-2">{lesson.title}</h1>
      <p className="text-gray-600 leading-relaxed mb-8">{lesson.description}</p>

      <Button
        onClick={markComplete}
        variant={done ? 'outline' : 'primary'}
        icon={done ? CheckCircle2 : undefined}
        disabled={done}
      >
        {done ? t('completed') : t('markComplete')}
      </Button>

      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <span className="text-8xl">🎉</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
