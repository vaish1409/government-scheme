import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lessonsApi } from '../api/client';
import { getAllLocalProgress } from '../db/offlineStore';
import LessonCard from '../components/LessonCard';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'finance', label: '💰 Finance' },
  { key: 'maternal_health', label: '🤰 Maternal' },
  { key: 'general_health', label: '🩺 Health' },
  { key: 'digital_literacy', label: '📱 Digital' },
];

export default function Lessons() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lessonsApi
      .list()
      .then(({ data }) => setLessons(data.lessons))
      .catch(() => {}) // offline & no cache yet — the empty state below handles this
      .finally(() => setLoading(false));

    getAllLocalProgress().then((events) => {
      const done = new Set(events.filter((e) => e.completed).map((e) => e.lessonId));
      setCompletedIds(done);
    });
  }, []);

  const filtered = category === 'all' ? lessons : lessons.filter((l) => l.category === category);

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <h1 className="text-2xl font-display font-bold text-ink mb-1">{t('lessonsTitle')}</h1>
      <p className="text-gray-500 mb-4">{t('lessonsSubtitle')}</p>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              category === c.key ? 'bg-teal text-white' : 'bg-white text-gray-600 shadow-card'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-gray-400 mt-10">...</p>}

      {!loading && filtered.length === 0 && (
        <div className="text-center mt-16">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-gray-500">No lessons available offline yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            completed={completedIds.has(lesson.id)}
            onClick={() => navigate(`/lessons/${lesson.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
