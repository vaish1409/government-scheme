import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Button from './Button';

/*
  Lets the person (or a counsellor) fix anything the assistant heard wrongly.
  The AI never decides alone: this screen is the "confirm" step.
*/
export default function ProfileEditor({ profile, meta, onSave, onCancel }) {
  const { t, lang } = useLanguage();
  const [p, setP] = useState(profile);
  const set = (k, v) => setP((old) => ({ ...old, [k]: v }));
  const toggle = (k, key) => {
    const cur = p[k] || [];
    set(k, cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key]);
  };

  const Choice = ({ value, current, onPick, children }) => (
    <button
      type="button"
      onClick={() => onPick(value)}
      aria-pressed={current === value}
      className={`px-4 py-2 rounded-full border-2 font-semibold text-sm ${current === value ? 'bg-teal border-teal text-white' : 'bg-white border-teal-light text-ink'}`}
    >
      {children}
    </button>
  );

  const TradePicker = ({ field, title }) => (
    <div>
      <p className="font-semibold text-ink mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {meta.trades.map((tr) => {
          const on = (p[field] || []).includes(tr.key);
          return (
            <button
              key={tr.key}
              type="button"
              onClick={() => toggle(field, tr.key)}
              aria-pressed={on}
              className={`px-3 py-1.5 rounded-full border-2 text-sm font-medium ${on ? 'bg-marigold border-marigold text-ink' : 'bg-white border-teal-light text-gray-700'}`}
            >
              {tr[lang]}
            </button>
          );
        })}
      </div>
    </div>
  );

  const field = 'w-full rounded-xl2 border-2 border-teal-light bg-white px-4 py-3 text-lg focus:border-teal outline-none';

  return (
    <div className="bg-white rounded-xl2 shadow-card p-5 space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-ink mb-1.5">{t('state')}</label>
          <select value={p.state || ''} onChange={(e) => set('state', e.target.value || null)} className={field}>
            <option value="">—</option>
            {meta.states.map((s) => <option key={s.name} value={s.name}>{lang === 'hi' ? s.hi : s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-semibold text-ink mb-1.5">{t('age')}</label>
          <input type="number" inputMode="numeric" value={p.age ?? ''} onChange={(e) => set('age', e.target.value ? Number(e.target.value) : null)} className={field} />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-ink mb-1.5">{t('education')}</label>
        <select value={p.education || ''} onChange={(e) => set('education', e.target.value || null)} className={field}>
          <option value="">—</option>
          {meta.education.map((e) => <option key={e.key} value={e.key}>{e[lang]}</option>)}
        </select>
      </div>

      <div>
        <p className="font-semibold text-ink mb-2">{t('gender')}</p>
        <div className="flex gap-2 flex-wrap">
          {[['female', t('female')], ['male', t('male')], ['other', t('other')]].map(([v, l]) => (
            <Choice key={v} value={v} current={p.gender} onPick={(x) => set('gender', x)}>{l}</Choice>
          ))}
        </div>
      </div>

      <TradePicker field="interests" title={t('wantToLearn')} />
      <TradePicker field="currentActivity" title={t('workNow')} />
      <TradePicker field="familyOccupation" title={t('familyWork')} />
      <TradePicker field="localWork" title={t('workNearYou')} />

      <div>
        <p className="font-semibold text-ink mb-2">{t('preference')}</p>
        <div className="flex gap-2 flex-wrap">
          {[['wage', t('prefJob')], ['self', t('prefOwn')], ['either', t('prefEither')]].map(([v, l]) => (
            <Choice key={v} value={v} current={p.employmentPreference} onPick={(x) => set('employmentPreference', x)}>{l}</Choice>
          ))}
        </div>
      </div>

      <div>
        <p className="font-semibold text-ink mb-2">{t('travel')}</p>
        <div className="flex gap-2 flex-wrap">
          {[['local', t('travelLocal')], ['district', t('travelDistrict')], ['anywhere', t('travelAnywhere')]].map(([v, l]) => (
            <Choice key={v} value={v} current={p.travel} onPick={(x) => set('travel', x)}>{l}</Choice>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 font-semibold text-ink">
        <input
          type="checkbox"
          checked={p.physicalConstraint === true}
          onChange={(e) => set('physicalConstraint', e.target.checked)}
          className="w-6 h-6 accent-teal"
        />
        {t('physicalDifficulty')}
      </label>

      <div>
        <label className="block font-semibold text-ink mb-1.5">{t('annualIncomeOptional')}</label>
        <input type="number" inputMode="numeric" value={p.annualIncome ?? ''} onChange={(e) => set('annualIncome', e.target.value === '' ? null : Number(e.target.value))} className={field} />
      </div>

      <div className="space-y-3">
        <Button onClick={() => onSave(p)}>{t('updateResults')}</Button>
        <Button variant="ghost" onClick={onCancel}>{t('cancel')}</Button>
      </div>
    </div>
  );
}
