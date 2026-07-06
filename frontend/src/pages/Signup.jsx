import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';

const STATES = [
  'Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Rajasthan',
  'Tamil Nadu', 'West Bengal', 'Madhya Pradesh', 'Gujarat', 'Other',
];

export default function Signup() {
  const { t } = useLanguage();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', password: '', age: '', state: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup({ ...form, age: Number(form.age) });
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-6 py-8">
      <button onClick={() => navigate(-1)} className="tap-target -ml-3 mb-2">
        <ArrowLeft className="text-ink" />
      </button>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-bold text-ink mb-6"
      >
        {t('signup')}
      </motion.h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label={t('name')} value={form.name} onChange={update('name')} required />
        <Field label={t('phone')} type="tel" value={form.phone} onChange={update('phone')} required />
        <Field label={t('password')} type="password" value={form.password} onChange={update('password')} required />
        <Field label={t('age')} type="number" value={form.age} onChange={update('age')} required />

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1.5">{t('state')}</label>
          <select
            value={form.state}
            onChange={update('state')}
            required
            className="w-full rounded-xl2 border-2 border-teal-light bg-white px-4 py-3 text-lg focus:border-teal outline-none"
          >
            <option value="" disabled>—</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-coral text-sm font-medium bg-coral-light rounded-xl2 px-4 py-3">{error}</p>
        )}

        <div className="pt-2">
          <Button type="submit" disabled={loading}>{loading ? '...' : t('continue')}</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-600 mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl2 border-2 border-teal-light bg-white px-4 py-3 text-lg focus:border-teal outline-none"
      />
    </div>
  );
}
