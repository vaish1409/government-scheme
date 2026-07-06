import { motion } from 'framer-motion';
import { PlayCircle, Headphones, CheckCircle2, Clock } from 'lucide-react';

const categoryEmoji = {
  finance: '💰',
  maternal_health: '🤰',
  general_health: '🩺',
  digital_literacy: '📱',
};

export default function LessonCard({ lesson, completed, onClick }) {
  const MediaIcon = lesson.mediaType === 'video' ? PlayCircle : Headphones;
  const minutes = Math.round((lesson.durationSeconds || 60) / 60) || 1;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="w-full bg-white rounded-xl2 shadow-card p-4 flex items-center gap-4 text-left"
    >
      <div className="text-3xl flex-shrink-0 w-14 h-14 bg-teal-light rounded-xl2 flex items-center justify-center">
        {categoryEmoji[lesson.category] || '📘'}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-ink truncate">{lesson.title}</h3>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MediaIcon size={15} /> {minutes} min
          </span>
          {completed && (
            <span className="flex items-center gap-1 text-teal font-medium">
              <CheckCircle2 size={15} /> Done
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
