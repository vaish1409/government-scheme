import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, RefreshCw, AlertTriangle, Users, UserCheck, GraduationCap, BadgeCheck } from 'lucide-react';
import { livelihoodApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';

/*
  Officer / counsellor view. It answers the questions the GIA issues list raises:
  where is demand, what skills are missing, is what people want available locally,
  and what happens after a recommendation (enrolled, completed, placed, dropped).
  The key is held in memory only, so closing the tab signs the officer out.
*/

function Bars({ rows, valueKey = 'count', labelKey, extra }) {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]));
  if (!rows.length) return <p className="text-gray-400 text-sm">—</p>;
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r[labelKey]}>
          <div className="flex justify-between text-sm mb-1 gap-3">
            <span className="text-ink font-medium">{r[labelKey]}</span>
            <span className="text-gray-600 tabular-nums flex-shrink-0">{r[valueKey]}{extra ? extra(r) : ''}</span>
          </div>
          <div className="h-2.5 bg-teal-light rounded-full overflow-hidden">
            <div className="h-full bg-teal rounded-full" style={{ width: `${(r[valueKey] / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const Card = ({ title, children, sub }) => (
  <section className="bg-white rounded-xl2 shadow-card p-5">
    <h2 className="font-display font-bold text-ink text-lg">{title}</h2>
    {sub && <p className="text-sm text-gray-500 mb-3">{sub}</p>}
    {!sub && <div className="mb-3" />}
    {children}
  </section>
);

const FUNNEL = [
  ['none', 'Not followed up', 'bg-gray-300'],
  ['enrolled', 'Enrolled', 'bg-marigold'],
  ['completed', 'Completed training', 'bg-teal'],
  ['placed', 'Placed / earning', 'bg-teal-dark'],
  ['dropped', 'Dropped out', 'bg-coral'],
];

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState(null);
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (k) => {
    setLoading(true);
    setError('');
    try {
      const [d, s] = await Promise.all([
        livelihoodApi.dashboard(k, lang),
        livelihoodApi.sessions(k, { review: 'true', status: 'pending' }),
      ]);
      setData(d.data);
      setQueue(s.data.sessions.slice(0, 8));
      setAuthed(true);
    } catch (e) {
      setAuthed(false);
      setError(e.response?.status === 401 ? 'Wrong officer key.' : e.response?.status === 503 ? 'Officer access is not set up on the server.' : 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => { if (authed) load(key); }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (id, body) => {
    await livelihoodApi.updateSession(key, id, body);
    load(key);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-cream px-6 py-8 max-w-md mx-auto">
        <button onClick={() => navigate('/')} className="tap-target -ml-3 mb-4"><ArrowLeft className="text-ink" /></button>
        <div className="w-16 h-16 rounded-full bg-teal-light flex items-center justify-center mb-4"><Lock className="text-teal" /></div>
        <h1 className="text-2xl font-display font-bold text-ink mb-1">Officer dashboard</h1>
        <p className="text-gray-600 mb-6">For district officers and counsellors. Enter the officer key.</p>
        <input
          type="password" value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(key)}
          aria-label="Officer key" placeholder="Officer key"
          className="w-full rounded-xl2 border-2 border-teal-light bg-white px-4 py-3 text-lg focus:border-teal outline-none mb-3"
        />
        {error && <p className="text-coral text-sm font-medium bg-coral-light rounded-xl2 px-4 py-3 mb-3">{error}</p>}
        <Button onClick={() => load(key)} disabled={!key || loading}>{loading ? '...' : 'Open dashboard'}</Button>
      </div>
    );
  }

  const { totals, byState, interests, topCourses, skillGaps, funnel, preference } = data;
  const funnelMax = Math.max(1, ...FUNNEL.map(([k]) => funnel[k]));

  return (
    <div className="min-h-screen bg-cream px-5 pt-5 pb-16 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/')} className="tap-target -ml-3" aria-label="Back"><ArrowLeft className="text-ink" /></button>
        <button onClick={() => load(key)} className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-card text-teal font-semibold text-sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <h1 className="text-3xl font-display font-extrabold text-ink mb-1">Livelihood planning dashboard</h1>
      {totals.demoSessions > 0 && (
        <p className="text-sm text-marigold-dark bg-marigold-light rounded-xl2 px-3 py-2 mb-4">
          {totals.demoSessions} of {totals.sessions} sessions are generated demo data.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          [Users, totals.sessions, 'Interviews'],
          [UserCheck, totals.pendingCounsellor, 'Awaiting counsellor'],
          [AlertTriangle, totals.needsReview, 'Flagged for review'],
          [BadgeCheck, funnel.placementRate === null ? '—' : `${funnel.placementRate}%`, 'Placed, of followed up'],
        ].map(([Icon, n, label]) => (
          <div key={label} className="bg-white rounded-xl2 shadow-card p-4">
            <Icon size={20} className="text-teal mb-2" />
            <p className="text-3xl font-display font-extrabold text-ink tabular-nums">{n}</p>
            <p className="text-sm text-gray-600">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Demand by state" sub="Where beneficiaries are asking for help">
          <Bars rows={byState} labelKey="state" />
        </Card>

        <Card title="What people want to learn" sub="The note after each bar counts requests from states where that work is scarce">
          <Bars rows={interests} labelKey="label" extra={(r) => (r.lowLocalDemand > 0 ? `  ·  ${r.lowLocalDemand} in low-demand states` : '')} />
        </Card>

        <Card title="Most recommended courses" sub="Top pick per interview">
          <Bars rows={topCourses.map((c) => ({ ...c, label: `${c.title} (L${c.nsqf})` }))} labelKey="label" />
        </Card>

        <Card title="Common skill gaps" sub="Skills the top pick would add">
          <Bars rows={skillGaps} labelKey="skill" />
        </Card>

        <Card title="After the recommendation" sub="Follow-up status recorded by counsellors">
          <ul className="space-y-2.5">
            {FUNNEL.map(([k, label, color]) => (
              <li key={k}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-ink">{label}</span><span className="tabular-nums text-gray-600">{funnel[k]}</span></div>
                <div className="h-2.5 bg-cream rounded-full overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${(funnel[k] / funnelMax) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Job or own business?" sub="What beneficiaries prefer">
          <Bars
            rows={[
              { k: 'Own small business', count: preference.self },
              { k: 'Job with salary', count: preference.wage },
              { k: 'Either', count: preference.either },
              { k: 'Not told', count: preference.unknown },
            ]}
            labelKey="k"
          />
        </Card>
      </div>

      <div className="mt-5">
        <Card title="Counsellor queue" sub="Flagged interviews waiting for a check">
          {queue.length === 0 && <p className="text-gray-500 text-sm">Nothing waiting.</p>}
          <ul className="divide-y divide-teal-light">
            {queue.map((s) => (
              <li key={s.id} className="py-3">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-ink">{s.state || 'State not given'}</span>
                  <span className="text-gray-500 text-sm">{s.profile?.age ? `${s.profile.age} yrs` : ''}</span>
                  {s.isDemo && <span className="text-xs px-2 py-0.5 rounded-full bg-marigold-light text-marigold-dark">demo</span>}
                  {s.contactPhone && <a href={`tel:${s.contactPhone}`} className="text-sm text-teal font-semibold">{s.contactPhone}</a>}
                </div>
                <p className="text-sm text-gray-600 mb-2">{(s.reviewReasons || []).join(' ')}</p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => act(s.id, { counsellorStatus: 'confirmed' })} className="px-4 py-1.5 rounded-full bg-teal text-white text-sm font-semibold">Confirm</button>
                  <button onClick={() => act(s.id, { counsellorStatus: 'changed' })} className="px-4 py-1.5 rounded-full bg-marigold text-ink text-sm font-semibold">Changed options</button>
                  <button onClick={() => act(s.id, { followUpStatus: 'enrolled', counsellorStatus: 'confirmed' })} className="px-4 py-1.5 rounded-full bg-white border-2 border-teal-light text-teal text-sm font-semibold">Mark enrolled</button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <p className="text-xs text-gray-500 mt-4 flex items-center gap-1.5"><GraduationCap size={14} /> Course and demand data are prototype samples. See the roadmap for real sources.</p>
    </div>
  );
}
