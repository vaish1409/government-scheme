import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { eligibilityApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';

const STATES = [
  'Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Rajasthan',
  'Tamil Nadu', 'West Bengal', 'Madhya Pradesh', 'Gujarat', 'Other',
];
const OCCUPATIONS = ['farmer', 'self-employed', 'student', 'unemployed', 'salaried', 'other'];

export default function Eligibility() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    age: user?.age || '',
    gender: user?.gender || '',
    state: user?.state || '',
    occupation: user?.occupation || '',
    annualIncome: user?.annualIncome || '',
    isPregnantOrLactating: false,
    hasBankAccount: user?.hasBankAccount || false,
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      label: t('age'),
      render: () => (
        <input
          type="number"
          autoFocus
          value={answers.age}
          onChange={(e) => setAnswers({ ...answers, age: e.target.value })}
          className="w-full text-center text-3xl font-display font-bold rounded-xl2 border-2 border-teal-light bg-white px-4 py-6 focus:border-teal outline-none"
        />
      ),
      valid: () => answers.age !== '' && Number(answers.age) > 0,
    },
    {
      label: 'Gender',
      render: () => (
        <div className="grid grid-cols-3 gap-3">
          {[['male', t('male')], ['female', t('female')], ['other', t('other')]].map(([val, label]) => (
            <OptionButton key={val} selected={answers.gender === val} onClick={() => setAnswers({ ...answers, gender: val })}>
              {label}
            </OptionButton>
          ))}
        </div>
      ),
      valid: () => !!answers.gender,
    },
    {
      label: t('state'),
      render: () => (
        <select
          value={answers.state}
          onChange={(e) => setAnswers({ ...answers, state: e.target.value })}
          className="w-full rounded-xl2 border-2 border-teal-light bg-white px-4 py-4 text-lg focus:border-teal outline-none"
        >
          <option value="" disabled>—</option>
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
      valid: () => !!answers.state,
    },
    {
      label: t('occupation'),
      render: () => (
        <div className="grid grid-cols-2 gap-3">
          {OCCUPATIONS.map((occ) => (
            <OptionButton key={occ} selected={answers.occupation === occ} onClick={() => setAnswers({ ...answers, occupation: occ })}>
              {occ}
            </OptionButton>
          ))}
        </div>
      ),
      valid: () => !!answers.occupation,
    },
    {
      label: t('income'),
      render: () => (
        <input
          type="number"
          autoFocus
          value={answers.annualIncome}
          onChange={(e) => setAnswers({ ...answers, annualIncome: e.target.value })}
          className="w-full text-center text-3xl font-display font-bold rounded-xl2 border-2 border-teal-light bg-white px-4 py-6 focus:border-teal outline-none"
        />
      ),
      valid: () => answers.annualIncome !== '',
    },
    ...(answers.gender === 'female'
      ? [{
          label: t('pregnantQuestion'),
          render: () => (
            <div className="grid grid-cols-2 gap-3">
              <OptionButton selected={answers.isPregnantOrLactating === true} onClick={() => setAnswers({ ...answers, isPregnantOrLactating: true })}>{t('yes')}</OptionButton>
              <OptionButton selected={answers.isPregnantOrLactating === false} onClick={() => setAnswers({ ...answers, isPregnantOrLactating: false })}>{t('no')}</OptionButton>
            </div>
          ),
          valid: () => true,
        }]
      : []),
    {
      label: t('bankAccountQuestion'),
      render: () => (
        <div className="grid grid-cols-2 gap-3">
          <OptionButton selected={answers.hasBankAccount === true} onClick={() => setAnswers({ ...answers, hasBankAccount: true })}>{t('yes')}</OptionButton>
          <OptionButton selected={answers.hasBankAccount === false} onClick={() => setAnswers({ ...answers, hasBankAccount: false })}>{t('no')}</OptionButton>
        </div>
      ),
      valid: () => true,
    },
  ];

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    setLoading(true);
    try {
      const { data } = await eligibilityApi.check({
        ...answers,
        age: Number(answers.age),
        annualIncome: Number(answers.annualIncome),
      });
      navigate('/eligibility/results', { state: { results: data } });
    } catch (err) {
      alert('Could not check eligibility. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-5 pt-6 pb-10 max-w-md mx-auto">
      <button onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))} className="tap-target -ml-3 mb-2">
        <ArrowLeft className="text-ink" />
      </button>

      <div className="h-2 bg-teal-light rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-marigold rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <h1 className="text-2xl font-display font-bold text-ink mb-6">{current.label}</h1>
          {current.render()}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10">
        <Button onClick={handleNext} disabled={!current.valid() || loading}>
          {loading ? '...' : step === steps.length - 1 ? t('seeResults') : t('continue')}
        </Button>
      </div>
    </div>
  );
}

function OptionButton({ children, selected, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`capitalize rounded-xl2 py-4 px-3 font-semibold border-2 transition-colors ${
        selected ? 'bg-teal border-teal text-white' : 'bg-white border-teal-light text-ink'
      }`}
    >
      {children}
    </motion.button>
  );
}
