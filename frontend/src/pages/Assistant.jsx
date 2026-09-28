import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, Square, Volume2, Keyboard, SkipForward, Send, CheckCircle2, WifiOff, Loader2 } from 'lucide-react';
import { livelihoodApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useVoice } from '../hooks/useVoice';
import Button from '../components/Button';

export const PROFILE_KEY = 'saksham:profile';

/*
  The interview. The server is stateless: each turn we send the current
  profile plus what the person said, and get back the updated profile and the
  next question. The same endpoint can sit behind a WhatsApp voice-note bot or
  an IVR call later.
*/
export default function Assistant() {
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const voice = useVoice(lang);

  const [started, setStarted] = useState(false);
  const [profile, setProfile] = useState(null);
  const [question, setQuestion] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [progress, setProgress] = useState({ index: 0, total: 8 });
  const [understood, setUnderstood] = useState([]); // what we just understood, shown as ticks
  const [heard, setHeard] = useState('');
  const [typed, setTyped] = useState('');
  const [showType, setShowType] = useState(!voice.sttSupported);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const applyTurn = async (data) => {
    setProfile(data.profile);
    setUnderstood(data.understood || []);
    setProgress(data.progress);
    setAttempts(data.nextAttempts || 0);

    if (data.done) {
      sessionStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
      await voice.say(data.message);
      navigate('/results', { state: { profile: data.profile } });
      return;
    }
    setQuestion(data.next);
    await voice.say(`${data.message} ${data.next.prompt}`);
  };

  const call = async (body) => {
    setBusy(true);
    setNotice('');
    try {
      const { data } = await livelihoodApi.turn(body);
      setBusy(false);
      await applyTurn(data);
    } catch {
      setBusy(false);
      setNotice(t('serverError'));
    }
  };

  const start = () => {
    setStarted(true);
    call({ lang });
  };

  const submit = async (text) => {
    const said = (text || '').trim();
    if (!said || !question) return;
    setHeard(said);
    setTyped('');
    await call({ lang, questionId: question.id, transcript: said, profile, attempts });
  };

  const onMic = async () => {
    if (voice.listening) return voice.stopListening();
    setNotice('');
    const { text, error } = await voice.listen();
    if (text) return submit(text);
    if (error === 'not-allowed' || error === 'service-not-allowed') {
      setShowType(true);
      setNotice(t('micBlocked'));
    } else if (error === 'network') {
      setShowType(true);
      setNotice(t('speechNeedsInternet'));
    } else {
      setNotice(t('didNotHear'));
    }
  };

  const repeat = () => question && voice.say(question.prompt);
  const skip = () => submit('skip');

  const micState = voice.listening ? 'listening' : busy ? 'busy' : 'idle';

  return (
    <div className="min-h-screen bg-cream px-5 pt-5 pb-10 max-w-md mx-auto flex flex-col">
      {/* top bar */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/')} className="tap-target -ml-3" aria-label={t('back')}>
          <ArrowLeft className="text-ink" />
        </button>
        <div className="flex rounded-full bg-white shadow-card p-1" role="group" aria-label="Language">
          {[['en', 'English'], ['hi', 'हिंदी']].map(([code, name]) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold ${lang === code ? 'bg-teal text-white' : 'text-teal'}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {!isOnline && (
        <div className="flex items-start gap-2 bg-ink text-white rounded-xl2 px-4 py-3 text-sm mb-4">
          <WifiOff size={18} className="mt-0.5 flex-shrink-0" />
          <span>{t('interviewNeedsInternet')}</span>
        </div>
      )}

      {!started ? (
        <Intro t={t} onStart={start} sttSupported={voice.sttSupported} />
      ) : (
        <>
          {/* progress: one segment per question */}
          <div className="flex gap-1.5 mb-6" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.index}>
            {Array.from({ length: progress.total }).map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i < progress.index ? 'bg-teal' : i === progress.index ? 'bg-marigold' : 'bg-teal-light'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={question?.id + question?.prompt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5"
            >
              {understood.length > 0 && (
                <ul className="mb-3 space-y-1">
                  {understood.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm text-teal-dark">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="bg-white rounded-xl2 shadow-card p-5">
                <div className="flex items-start gap-3">
                  <p className="flex-1 text-2xl font-display font-semibold text-ink leading-snug">
                    {question ? question.prompt : '…'}
                  </p>
                  <button onClick={repeat} className="tap-target bg-teal-light rounded-full text-teal flex-shrink-0" aria-label={t('repeatQuestion')}>
                    <Volume2 size={22} className={voice.speaking ? 'animate-pulse' : ''} />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* what the person said, live */}
          <div className="min-h-[3rem] text-center px-2 mb-2">
            {(voice.interim || heard) && (
              <p className="text-gray-600 italic">“{voice.interim || heard}”</p>
            )}
          </div>

          {/* mic */}
          <div className="flex flex-col items-center mb-5">
            <button
              onClick={onMic}
              disabled={busy || !question || !voice.sttSupported}
              aria-label={voice.listening ? t('stopListening') : t('tapToSpeak')}
              className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-soft transition-colors disabled:opacity-50 ${
                micState === 'listening' ? 'bg-coral' : 'bg-teal'
              }`}
            >
              {micState === 'listening' && <span className="absolute inset-0 rounded-full bg-coral/40 animate-ping" />}
              {micState === 'busy' ? (
                <Loader2 size={44} color="white" className="animate-spin relative" />
              ) : micState === 'listening' ? (
                <Square size={38} color="white" fill="white" className="relative" />
              ) : (
                <Mic size={48} color="white" className="relative" />
              )}
            </button>
            <p className="mt-3 font-display font-semibold text-ink">
              {micState === 'listening' ? t('listening') : micState === 'busy' ? t('thinking') : voice.sttSupported ? t('tapToSpeak') : t('typeYourAnswer')}
            </p>
          </div>

          {notice && <p className="text-center text-coral text-sm font-medium bg-coral-light rounded-xl2 px-4 py-3 mb-4">{notice}</p>}

          {/* typed fallback */}
          {showType && (
            <div className="flex gap-2 mb-4">
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit(typed)}
                placeholder={t('typeYourAnswer')}
                aria-label={t('typeYourAnswer')}
                className="flex-1 rounded-xl2 border-2 border-teal-light bg-white px-4 py-3 text-lg focus:border-teal outline-none"
              />
              <button
                onClick={() => submit(typed)}
                disabled={busy || !typed.trim()}
                aria-label={t('send')}
                className="tap-target bg-marigold rounded-xl2 text-ink disabled:opacity-50 min-w-[56px]"
              >
                <Send size={22} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-auto">
            {voice.sttSupported && (
              <button onClick={() => setShowType((v) => !v)} className="flex items-center justify-center gap-2 bg-white rounded-xl2 shadow-card py-3 font-semibold text-teal">
                <Keyboard size={20} /> {t('typeInstead')}
              </button>
            )}
            <button
              onClick={skip}
              disabled={busy || !question}
              className={`flex items-center justify-center gap-2 bg-white rounded-xl2 shadow-card py-3 font-semibold text-gray-600 disabled:opacity-50 ${voice.sttSupported ? '' : 'col-span-2'}`}
            >
              <SkipForward size={20} /> {t('skipQuestion')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Intro({ t, onStart, sttSupported }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col items-center text-center pt-6">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          className="w-28 h-28 bg-teal rounded-full flex items-center justify-center shadow-soft mb-6"
        >
          <Mic size={52} color="white" />
        </motion.div>
        <h1 className="text-3xl font-display font-extrabold text-ink mb-3">{t('assistantTitle')}</h1>
        <p className="text-lg text-gray-600 mb-6">{t('assistantIntro')}</p>

        <div className="bg-white rounded-xl2 shadow-card p-4 text-left text-sm text-gray-600 space-y-2 w-full">
          <p>🎙️ {t('privacyVoice')}</p>
          <p>🔒 {t('privacyStore')}</p>
          {!sttSupported && <p className="text-coral font-medium">⌨️ {t('noMicSupport')}</p>}
        </div>
      </div>
      <div className="pt-6">
        <Button variant="marigold" icon={Mic} onClick={onStart}>{t('startTalking')}</Button>
      </div>
    </div>
  );
}
