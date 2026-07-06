import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const categoryColor = {
  health: 'bg-coral-light text-coral',
  finance: 'bg-marigold-light text-marigold-dark',
  agriculture: 'bg-teal-light text-teal',
  education: 'bg-teal-light text-teal',
  women: 'bg-coral-light text-coral',
  other: 'bg-gray-100 text-gray-600',
};

export default function SchemeCard({ scheme, onClick, index = 0 }) {
  const { t } = useLanguage();

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
      whileTap={{ scale: 0.97 }}
      className="w-full bg-white rounded-xl2 shadow-card p-4 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${categoryColor[scheme.category] || categoryColor.other}`}>
            <Sparkles size={12} /> {scheme.category}
          </span>
          <h3 className="font-display font-semibold text-ink mt-2">{scheme.name}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{scheme.benefits}</p>
        </div>
        <ChevronRight className="text-gray-300 flex-shrink-0 mt-1" size={22} />
      </div>
    </motion.button>
  );
}
