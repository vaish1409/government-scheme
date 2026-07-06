import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { schemesApi } from '../api/client';
import SchemeCard from '../components/SchemeCard';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';

export default function Schemes() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    schemesApi.list().then(({ data }) => setSchemes(data.schemes)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <h1 className="text-2xl font-display font-bold text-ink mb-4">{t('schemes')}</h1>

      <div className="mb-5">
        <Button variant="marigold" onClick={() => navigate('/eligibility')}>
          {t('checkEligibility')}
        </Button>
      </div>

      {loading && <p className="text-center text-gray-400 mt-10">...</p>}

      <div className="space-y-3">
        {schemes.map((scheme, i) => (
          <SchemeCard key={scheme.id} scheme={scheme} index={i} onClick={() => navigate(`/schemes/${scheme.slug}`)} />
        ))}
      </div>
    </div>
  );
}
