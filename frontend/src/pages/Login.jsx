import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';

export default function Login() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid phone number or password');
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
        {t('login')}
      </motion.h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1.5">{t('phone')}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full rounded-xl2 border-2 border-teal-light bg-white px-4 py-3 text-lg focus:border-teal outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1.5">{t('password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl2 border-2 border-teal-light bg-white px-4 py-3 text-lg focus:border-teal outline-none"
          />
        </div>

        {error && (
          <p className="text-coral text-sm font-medium bg-coral-light rounded-xl2 px-4 py-3">{error}</p>
        )}

        <div className="pt-2">
          <Button type="submit" disabled={loading}>{loading ? '...' : t('login')}</Button>
        </div>
      </form>
    </div>
  );
}
