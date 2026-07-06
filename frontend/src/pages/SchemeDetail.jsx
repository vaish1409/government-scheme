import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import { schemesApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';

export default function SchemeDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scheme, setScheme] = useState(null);

  useEffect(() => {
    schemesApi.bySlug(slug).then(({ data }) => setScheme(data.scheme)).catch(() => {});
  }, [slug]);

  if (!scheme) return <div className="p-6 text-center text-gray-400">...</div>;

  return (
    <div className="min-h-screen bg-cream px-5 pt-6 pb-10 max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="tap-target -ml-3 mb-3">
        <ArrowLeft className="text-ink" />
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-ink mb-2">{scheme.name}</h1>
        <p className="text-gray-600 leading-relaxed mb-6">{scheme.description}</p>

        <div className="bg-marigold-light rounded-xl2 p-4 mb-4">
          <h2 className="font-display font-semibold text-ink mb-1">Benefits</h2>
          <p className="text-gray-700">{scheme.benefits}</p>
        </div>

        <div className="bg-white rounded-xl2 p-4 mb-4 shadow-card">
          <h2 className="font-display font-semibold text-ink mb-2 flex items-center gap-2">
            <FileText size={18} className="text-teal" /> {t('documentsNeeded')}
          </h2>
          <ul className="space-y-1.5">
            {(scheme.documentsRequired || []).map((doc, i) => (
              <li key={i} className="text-gray-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" /> {doc}
              </li>
            ))}
          </ul>
        </div>

        {scheme.applyUrl && (
          <a href={scheme.applyUrl} target="_blank" rel="noreferrer">
            <Button icon={ExternalLink}>{t('howToApply')}</Button>
          </a>
        )}
      </motion.div>
    </div>
  );
}
