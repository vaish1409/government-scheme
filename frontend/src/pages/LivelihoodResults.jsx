import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, Pencil, UserCheck, MapPin, FileText, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { livelihoodApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../hooks/useVoice';
import { PROFILE_KEY } from './Assistant';
import CourseCard from '../components/CourseCard';
import ProfileEditor from '../components/ProfileEditor';
import Button from '../components/Button';

const SAVED_KEY = 'saksham:sessionId';

function loadProfile(location) {
  if (location.state?.profile) return location.state.profile;
  try {
    return JSON.parse(sessionStorage.getItem(PROFILE_KEY));
  } catch {
    return null;
  }
}

export default function LivelihoodResults() {
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const voice = useVoice(lang);

  const [profile, setProfile] = useState(() => loadProfile(location));
  const [meta, setMeta] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [listeningId, setListeningId] = useState(null);

  // save + consent
  const [consent, setConsent] = useState(false);
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem(SAVED_KEY));
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!profile) navigate('/assistant', { replace: true });
  }, [profile, navigate]);

  useEffect(() => {
    livelihoodApi.meta().then(({ data }) => setMeta(data)).catch(() => {});
  }, []);

  // Recommendations come from the server and depend only on the profile and language.
  useEffect(() => {
    if (!profile) return undefined;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    livelihoodApi
      .recommend({ profile, lang })
      .then(({ data }) => { if (!cancelled) setResult(data); })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [profile, lang]);

  const labelOf = useMemo(() => {
    const map = (list) => Object.fromEntries((list || []).map((x) => [x.key, x[lang]]));
    return { trades: map(meta?.trades), education: map(meta?.education) };
  }, [meta, lang]);

  const speak = async (id, text) => {
    setListeningId(id);
    await voice.say(text);
    setListeningId(null);
  };

  const cardSummary = (rec) =>
    `${rec.course.title}. ${t('nsqfLevel')} ${rec.course.nsqf}. ${rec.reasons.slice(0, 3).join(' ')} ${rec.pathway.primary === 'self' ? rec.pathway.enterprise : rec.pathway.role}.`;

  const readAll = () => {
    if (!result) return;
    const intro = result.recommendations.length ? t('hereAreOptions') : t('noMatch');
    speak('all', [intro, ...result.recommendations.map((r, i) => `${i + 1}. ${cardSummary(r)}`)].join(' '));
  };

  const saveProfile = (p) => {
    setProfile(p);
    sessionStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setEditing(false);
  };

  const send = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const { data } = await livelihoodApi.recommend({ profile, lang, save: true, consent: true, contactPhone: phone });
      sessionStorage.setItem(SAVED_KEY, data.sessionId);
      setSessionId(data.sessionId);
    } catch {
      setSaveError(t('serverError'));
    } finally {
      setSaving(false);
    }
  };

  const deleteMine = async () => {
    try {
      await livelihoodApi.deleteSession(sessionId);
    } catch { /* the id is unguessable; if the call fails the person can retry */ return; }
    sessionStorage.removeItem(SAVED_KEY);
    setSessionId(null);
    setConsent(false);
  };

  const startOver = () => {
    sessionStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(SAVED_KEY);
    navigate('/assistant');
  };

  if (!profile) return null;

  const chips = [
    profile.state,
    profile.age && `${profile.age} ${t('years')}`,
    profile.education && labelOf.education[profile.education],
    profile.employmentPreference && t({ self: 'prefOwn', wage: 'prefJob', either: 'prefEither' }[profile.employmentPreference]),
    profile.travel && t({ local: 'travelLocal', district: 'travelDistrict', anywhere: 'travelAnywhere' }[profile.travel]),
    ...(profile.interests || []).map((k) => labelOf.trades[k]),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-cream px-5 pt-5 pb-16 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/')} className="tap-target -ml-3" aria-label={t('back')}>
          <ArrowLeft className="text-ink" />
        </button>
        <div className="flex rounded-full bg-white shadow-card p-1" role="group" aria-label="Language">
          {[['en', 'English'], ['hi', 'हिंदी']].map(([code, name]) => (
            <button key={code} onClick={() => setLang(code)} aria-pressed={lang === code}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold ${lang === code ? 'bg-teal text-white' : 'text-teal'}`}>
              {name}
            </button>
          ))}
        </div>
      </div>

      <h1 className="text-3xl font-display font-extrabold text-ink mb-1">{t('yourOptions')}</h1>
      <p className="text-gray-600 mb-4">{t('yourOptionsSub')}</p>

      {/* what we understood: correctable */}
      {editing && meta ? (
        <div className="mb-6">
          <ProfileEditor profile={profile} meta={meta} onSave={saveProfile} onCancel={() => setEditing(false)} />
        </div>
      ) : (
        <div className="bg-white rounded-xl2 shadow-card p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-semibold text-ink">{t('whatWeUnderstood')}</p>
            <button onClick={() => setEditing(true)} disabled={!meta} className="flex items-center gap-1.5 text-teal font-semibold text-sm disabled:opacity-40">
              <Pencil size={15} /> {t('correct')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => <span key={c} className="px-3 py-1 rounded-full bg-teal-light text-teal-dark text-sm font-medium">{c}</span>)}
          </div>
        </div>
      )}

      {result?.needsCounsellor && (
        <div className="flex items-start gap-3 bg-marigold-light rounded-xl2 p-4 mb-5">
          <UserCheck size={22} className="text-marigold-dark flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-display font-semibold text-ink">{t('counsellorWillCheck')}</p>
            <ul className="list-disc pl-5 text-sm text-gray-700 mt-1">
              {result.counsellorReasons.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
        </div>
      )}

      <Button variant="outline" icon={Volume2} onClick={readAll} disabled={!result || loading}>
        {listeningId === 'all' ? t('speaking') : t('readAloud')}
      </Button>

      {loading && !result && <p className="text-center text-gray-400 mt-10"><Loader2 className="inline animate-spin" /></p>}
      {failed && <p className="text-center text-coral font-medium bg-coral-light rounded-xl2 px-4 py-3 mt-6">{t('serverError')}</p>}

      {result && (
        <div className={`mt-6 space-y-4 ${loading ? 'opacity-60' : ''}`}>
          {result.recommendations.length === 0 && (
            <div className="text-center bg-white rounded-xl2 shadow-card p-6">
              <p className="text-4xl mb-2">🧭</p>
              <p className="text-gray-700">{t('noMatch')}</p>
            </div>
          )}
          {result.recommendations.map((rec) => (
            <CourseCard
              key={rec.course.id}
              rec={rec}
              speaking={listeningId === rec.course.id}
              onListen={(text) => speak(rec.course.id, text || cardSummary(rec))}
            />
          ))}
        </div>
      )}

      {/* local opportunities */}
      {result?.opportunities?.topTrades?.length > 0 && (
        <div className="bg-white rounded-xl2 shadow-card p-5 mt-6">
          <p className="flex items-center gap-2 font-display font-semibold text-ink mb-1"><MapPin size={18} className="text-teal" /> {t('workInYourState')}</p>
          {result.opportunities.note && <p className="text-gray-600 text-sm mb-3">{result.opportunities.note}</p>}
          <div className="flex flex-wrap gap-2">
            {result.opportunities.topTrades.map((x) => (
              <span key={x.trade} className={`px-3 py-1 rounded-full text-sm font-semibold ${x.level === 3 ? 'bg-teal text-white' : 'bg-teal-light text-teal-dark'}`}>{x.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* documents */}
      {result?.documents?.length > 0 && (
        <div className="bg-white rounded-xl2 shadow-card p-5 mt-4">
          <p className="flex items-center gap-2 font-display font-semibold text-ink mb-2"><FileText size={18} className="text-teal" /> {t('keepReady')}</p>
          <ul className="list-disc pl-5 text-gray-700">{result.documents.map((d) => <li key={d}>{d}</li>)}</ul>
        </div>
      )}

      {/* send to counsellor, with consent */}
      <div className="bg-white rounded-xl2 shadow-card p-5 mt-4">
        {sessionId ? (
          <div className="space-y-3">
            <p className="flex items-center gap-2 font-display font-semibold text-teal"><CheckCircle2 size={20} /> {t('sentToCounsellor')}</p>
            <p className="text-sm text-gray-600">{t('sentNote')}</p>
            <Button variant="outline" icon={Trash2} onClick={deleteMine}>{t('deleteMyData')}</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-display font-semibold text-ink">{t('talkToCounsellor')}</p>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-6 h-6 accent-teal flex-shrink-0 mt-0.5" />
              <span>{t('consentText')}</span>
            </label>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">{t('phoneOptional')}</label>
              <input type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl2 border-2 border-teal-light bg-white px-4 py-3 text-lg focus:border-teal outline-none" />
            </div>
            {saveError && <p className="text-coral text-sm font-medium">{saveError}</p>}
            <Button onClick={send} disabled={!consent || saving || !result}>{saving ? '...' : t('sendToCounsellor')}</Button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button variant="ghost" onClick={startOver}>{t('startOver')}</Button>
      </div>
    </div>
  );
}
