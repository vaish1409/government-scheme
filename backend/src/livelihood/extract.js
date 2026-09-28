/**
 * Interview engine for the voice livelihood assistant.
 *
 * Deterministic and dependency-free on purpose:
 *  - it runs the same way for the web app, a WhatsApp voice-note bot or an IVR
 *    call, because it only ever sees a transcript string;
 *  - every extracted value can be explained (which keyword matched);
 *  - nothing here needs a network call or an API key.
 *
 * The engine is STATELESS. The caller sends the current profile back with each
 * turn and gets the updated profile plus the next question.
 *
 * An LLM can replace or supplement `extractField` later without touching the
 * rest of the flow: it only has to return the same { values } shape.
 */
const { EDU_LABEL, TRADES, STATES, QUESTIONS, FIELD_PROMPTS, KW } = require('./vocab');
const { PH } = require('./phrases');

const LANGS = ['en', 'hi'];
const pickLang = (l) => (LANGS.includes(l) ? l : 'en');

// ---------- text helpers ----------
const DEV_DIGITS = '०१२३४५६७८९';

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[०-९]/g, (d) => String(DEV_DIGITS.indexOf(d)))
    .replace(/['’`]/g, '') // can't -> cant
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const isDevanagari = (s) => /[\u0900-\u097F]/.test(s);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Cache one matcher per keyword.
const matcherCache = new Map();
function matcher(rawKw) {
  if (matcherCache.has(rawKw)) return matcherCache.get(rawKw);
  const kw = normalize(rawKw);
  let m;
  if (isDevanagari(kw)) {
    m = {
      test: (text) => text.includes(kw),
      strip: (text) => text.split(kw).join(' '),
    };
  } else {
    // prefix of a word: "weav" matches "weaver"; multi-word phrases match at word start
    const re = new RegExp(`(^| )${escapeRe(kw)}\\S*`, 'g');
    m = {
      test: (text) => new RegExp(`(^| )${escapeRe(kw)}`).test(text),
      strip: (text) => text.replace(re, ' '),
    };
  }
  matcherCache.set(rawKw, m);
  return m;
}

const both = (o) => [...(o.en || []), ...(o.hi || [])];
const hasAny = (text, list) => list.some((k) => matcher(k).test(text));
const stripAny = (text, list) => list.reduce((t, k) => matcher(k).strip(t), text);

// ---------- field parsers ----------
const EN_UNITS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 };
const EN_TEENS = { ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const EN_TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70 };

function parseAge(text) {
  const nums = (text.match(/\d{1,4}/g) || []).map(Number);
  for (const n of nums) {
    if (n >= 10 && n <= 99) return n;
    if (n >= 1940 && n <= new Date().getFullYear() - 10) return new Date().getFullYear() - n; // birth year
  }
  const tokens = text.split(' ');
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (EN_TEENS[t]) return EN_TEENS[t];
    if (EN_TENS[t]) return EN_TENS[t] + (EN_UNITS[tokens[i + 1]] || 0);
  }
  return null;
}

function parseState(text) {
  for (const s of STATES) {
    if (hasAny(text, s.kw)) return s.name;
  }
  return null;
}

function classToEdu(n) {
  if (n >= 12) return 'class12';
  if (n >= 10) return 'class10'; // 10th pass, or studied in 11th
  if (n >= 8) return 'class8'; // 8th pass, or studied in 9th
  return 'primary';
}

function parseEducation(text) {
  const E = KW.edu;
  if (hasAny(text, both(E.none))) return 'none';
  if (hasAny(text, both(E.iti))) return 'iti';
  if (hasAny(text, both(E.diploma))) return 'diploma';
  if (hasAny(text, both(E.graduate))) return 'graduate';
  for (const [word, n] of KW.eduWords) {
    if (matcher(word).test(text)) return classToEdu(n);
  }
  const m = text.match(/(?:^| )(\d{1,2})(?: ?(?:th|st|nd|rd|वीं|वी|वां|class|pass|कक्षा))?/);
  if (m) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 12) return classToEdu(n);
  }
  if (hasAny(text, both(E.primary))) return 'primary';
  return null;
}

function parseTrades(text) {
  return Object.keys(TRADES).filter((k) => hasAny(text, both(TRADES[k].kw)));
}

// Returns an array of trade keys, [] for an explicit "nothing", or null if unrecognised.
function parseTradeList(text) {
  const trades = parseTrades(text);
  if (trades.length) return trades;
  if (hasAny(text, both(KW.none))) return [];
  return null;
}

function parseMobility(text) {
  let travel = null;
  if (hasAny(text, both(KW.local))) travel = 'local';
  else if (hasAny(text, both(KW.district))) travel = 'district';
  else if (hasAny(text, both(KW.anywhere))) travel = 'anywhere';

  let physical = null;
  if (hasAny(text, both(KW.physicalNeg))) physical = false;
  else if (hasAny(text, both(KW.physical))) physical = true;

  return { travel, physical };
}

function parsePreference(text) {
  const self = hasAny(text, both(KW.self));
  // remove the "self employ" phrases so the bare word "employ" is not read as wage
  const rest = stripAny(text, both(KW.self));
  const wage = hasAny(rest, both(KW.wage));
  const either = hasAny(text, both(KW.either));
  if (either || (self && wage)) return 'either';
  if (self) return 'self';
  if (wage) return 'wage';
  return null;
}

/**
 * Pull the values for one question out of a transcript.
 * Returns only the fields that were recognised.
 */
function extractField(questionId, rawTranscript) {
  const text = normalize(rawTranscript);
  const out = {};
  if (!text) return out;

  switch (questionId) {
    case 'where': {
      const state = parseState(text);
      const age = parseAge(text);
      if (state) out.state = state;
      if (age) out.age = age;
      break;
    }
    case 'education': {
      const e = parseEducation(text);
      if (e) out.education = e;
      break;
    }
    case 'family': {
      const v = parseTradeList(text);
      if (v) out.familyOccupation = v;
      break;
    }
    case 'current': {
      const v = parseTradeList(text);
      if (v) out.currentActivity = v;
      break;
    }
    case 'interests': {
      const v = parseTradeList(text);
      if (v) out.interests = v;
      break;
    }
    case 'local': {
      const v = parseTradeList(text);
      if (v) out.localWork = v;
      break;
    }
    case 'mobility': {
      const { travel, physical } = parseMobility(text);
      if (travel) out.travel = travel;
      if (physical !== null) out.physicalConstraint = physical;
      break;
    }
    case 'preference': {
      const p = parsePreference(text);
      if (p) out.employmentPreference = p;
      break;
    }
    default:
      break;
  }
  return out;
}

// ---------- profile ----------
function emptyProfile() {
  return {
    state: null,
    age: null,
    education: null,
    familyOccupation: null, // array of trade keys, [] = none, null = unknown
    currentActivity: null,
    interests: null,
    localWork: null,
    travel: null, // 'local' | 'district' | 'anywhere'
    physicalConstraint: null, // true | false
    employmentPreference: null, // 'self' | 'wage' | 'either'
    // filled on the review screen, not asked by voice
    gender: null,
    category: 'sc',
    annualIncome: null,
    // bookkeeping
    skipped: [], // question ids the person skipped
    notes: {}, // raw transcript per question, for the counsellor
  };
}

// Does the profile already hold a value for this vocab field name?
function isKnown(p, field) {
  if (field === 'mobility') return p.travel != null || p.physicalConstraint != null;
  const v = p[field];
  return Array.isArray(v) ? true : v !== null && v !== undefined;
}

// ---------- wording ----------
function stateLabel(name, lang) {
  if (lang !== 'hi') return name;
  const s = STATES.find((x) => x.name === name);
  return (s && s.kw.find(isDevanagari)) || name;
}

function tradesLabel(keys, lang) {
  return keys.map((k) => TRADES[k][lang]).join(PH.and[lang] === ' और ' ? ', ' : ', ');
}

const fill = (tpl, v) => tpl.replace('{v}', v);
const ack = (i, lang) => PH.ack[i % PH.ack.length][lang];

// One short sentence per field that was understood on this turn.
function confirmSentences(values, lang) {
  const C = PH.confirm;
  const out = [];
  if (values.state) out.push(fill(C.state[lang], stateLabel(values.state, lang)));
  if (values.age) out.push(fill(C.age[lang], values.age));
  if (values.education) out.push(fill(C.education[lang], EDU_LABEL[values.education][lang]));
  const listField = (field, fallbackKey) => {
    if (!(field in values)) return;
    const v = values[field];
    out.push(v.length ? fill(C[field][lang], tradesLabel(v, lang)) : C[fallbackKey][lang]);
  };
  listField('familyOccupation', 'familyOccupationNone');
  listField('currentActivity', 'currentActivityNone');
  listField('interests', 'interestsNone');
  listField('localWork', 'localWorkNone');
  if (values.travel) out.push(C[`travel_${values.travel}`][lang]);
  if (values.physicalConstraint === true) out.push(C.physical_true[lang]);
  if (values.employmentPreference) out.push(C[`pref_${values.employmentPreference}`][lang]);
  return out;
}

// ---------- the turn ----------
const publicQuestion = (q, lang, extra = {}) => ({
  id: q.id,
  fields: q.fields,
  prompt: q.prompt[lang],
  ...extra,
});

/**
 * One step of the conversation.
 *
 * in : { lang, questionId, transcript, profile, attempts }
 *      questionId null/undefined = start of the interview
 * out: { profile, understood, message, next, nextAttempts, done, progress }
 */
function processTurn({ lang, questionId, transcript, profile, attempts } = {}) {
  lang = pickLang(lang);
  const base = emptyProfile();
  const p = { ...base, ...(profile || {}), notes: { ...((profile && profile.notes) || {}) }, skipped: [...((profile && profile.skipped) || [])] };
  const total = QUESTIONS.length;

  // start
  if (!questionId) {
    return {
      profile: p,
      understood: [],
      message: PH.greeting[lang],
      next: publicQuestion(QUESTIONS[0], lang),
      nextAttempts: 0,
      done: false,
      progress: { index: 0, total },
    };
  }

  const idx = QUESTIONS.findIndex((q) => q.id === questionId);
  if (idx === -1) {
    const err = new Error(`Unknown questionId "${questionId}"`);
    err.status = 400;
    throw err;
  }
  const q = QUESTIONS[idx];

  // 1. extract and merge (never overwrite a known value with nothing)
  const values = extractField(q.id, transcript);
  Object.assign(p, values);
  if (String(transcript || '').trim()) {
    p.notes[q.id] = [p.notes[q.id], String(transcript).trim()].filter(Boolean).join(' | ').slice(0, 500);
  }

  const understood = confirmSentences(values, lang);
  const missing = q.fields.filter((f) => !isKnown(p, f));
  const saidSkip = hasAny(normalize(transcript), both(KW.skip));
  const gotSomething = Object.keys(values).length > 0;
  const triedAlready = Number(attempts) >= 1;

  // 2. decide: ask again, or move on
  const stayHere = missing.length > 0 && !saidSkip && !(triedAlready);
  if (stayHere) {
    const partial = gotSomething && q.id === 'where' && FIELD_PROMPTS[missing[0]];
    const prompt = partial ? FIELD_PROMPTS[missing[0]][lang] : q.prompt[lang];
    const lead = partial ? [ack(idx, lang), ...understood].join(' ') : PH.reprompt[lang];
    return {
      profile: p,
      understood,
      message: lead,
      next: { id: q.id, fields: missing, prompt },
      nextAttempts: 1,
      done: false,
      progress: { index: idx, total },
    };
  }

  const moved = missing.length > 0; // gave up on something
  if (moved && !gotSomething) p.skipped.push(q.id);

  const nextQ = QUESTIONS[idx + 1];
  const lead = [ack(idx, lang), ...understood];
  if (moved && !gotSomething) lead.push(PH.skipped[lang]);

  if (!nextQ) {
    return {
      profile: p,
      understood,
      message: [...lead, PH.done[lang]].join(' '),
      next: null,
      nextAttempts: 0,
      done: true,
      progress: { index: total, total },
    };
  }
  return {
    profile: p,
    understood,
    message: lead.join(' '),
    next: publicQuestion(nextQ, lang),
    nextAttempts: 0,
    done: false,
    progress: { index: idx + 1, total },
  };
}

/** Options for the review/edit screen and the meta endpoint. */
function getMeta() {
  return {
    trades: Object.entries(TRADES).map(([key, t]) => ({ key, en: t.en, hi: t.hi })),
    education: Object.entries(EDU_LABEL).map(([key, l]) => ({ key, en: l.en, hi: l.hi })),
    states: STATES.map((s) => ({ name: s.name, hi: s.kw.find(isDevanagari) || s.name })),
    questions: QUESTIONS.map((q) => ({ id: q.id, fields: q.fields, prompt: q.prompt })),
  };
}

module.exports = {
  normalize,
  extractField,
  emptyProfile,
  isKnown,
  processTurn,
  getMeta,
  stateLabel,
  tradesLabel,
};
