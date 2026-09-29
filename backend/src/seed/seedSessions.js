/**
 * Demo sessions so the officer dashboard has something to show.
 * Every row is flagged isDemo=true and goes through the SAME recommender as a
 * real interview, so the charts are internally consistent. Delete them with:
 *   DELETE FROM "LivelihoodSessions" WHERE "isDemo" = true;
 */
const { recommend } = require('../livelihood/recommend');
const { STATES, TRADES, EDU_RANK } = require('../livelihood/vocab');

// small seeded RNG so every run creates the same demo data
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const pickMany = (r, arr, max) => {
  const n = Math.floor(r() * (max + 1));
  return [...new Set(Array.from({ length: n }, () => pick(r, arr)))];
};

// weights: some states appear more, like a real pilot in a few districts
const STATE_POOL = [
  ...Array(6).fill('Bihar'), ...Array(6).fill('Uttar Pradesh'), ...Array(3).fill('Rajasthan'),
  ...Array(3).fill('Madhya Pradesh'), ...Array(3).fill('Odisha'), ...Array(2).fill('West Bengal'),
  ...Array(2).fill('Jharkhand'), 'Maharashtra', 'Tamil Nadu', 'Karnataka',
];
const EDU_POOL = ['none', 'primary', 'class8', 'class8', 'class10', 'class10', 'class10', 'class12', 'iti', 'graduate'];
const TRADE_KEYS = Object.keys(TRADES);
// Weighted so most demo sessions look like they came from the web app, with
// a realistic minority from the phone/WhatsApp bridge, once that exists.
const CHANNEL_POOL = [...Array(6).fill('web'), ...Array(2).fill('ivr'), ...Array(2).fill('whatsapp')];

function buildSessions(count = 150) {
  const r = rng(26097);
  const rows = [];
  for (let i = 0; i < count; i++) {
    const profile = {
      state: pick(r, STATE_POOL),
      age: 17 + Math.floor(r() * 30),
      education: pick(r, EDU_POOL),
      familyOccupation: pickMany(r, TRADE_KEYS, 2),
      currentActivity: r() < 0.35 ? [] : pickMany(r, ['farming', 'labour', 'dairy', 'retail', 'tailoring', 'construction'], 2),
      interests: pickMany(r, TRADE_KEYS, 2),
      localWork: pickMany(r, ['farming', 'construction', 'labour', 'dairy', 'retail'], 2),
      travel: pick(r, ['local', 'local', 'district', 'anywhere']),
      physicalConstraint: r() < 0.08,
      employmentPreference: pick(r, ['self', 'self', 'wage', 'wage', 'either']),
      gender: pick(r, ['female', 'male', 'male']),
      category: 'sc',
      annualIncome: null,
      skipped: [],
      notes: {},
    };
    if (!(profile.education in EDU_RANK)) profile.education = 'class8';
    const result = recommend(profile, 'en');
    const top = result.recommendations[0];
    const followUp = pick(r, ['none', 'none', 'none', 'enrolled', 'enrolled', 'completed', 'placed', 'placed', 'dropped']);
    rows.push({
      channel: pick(r, CHANNEL_POOL),
      lang: r() < 0.6 ? 'hi' : 'en',
      state: profile.state,
      profile,
      recommendedCourseIds: result.recommendations.map((x) => x.course.id),
      primaryTrade: top ? top.course.trades[0] : null,
      skillGaps: top ? top.gap.addsEn : [],
      needsReview: result.needsCounsellor,
      reviewReasons: result.counsellorReasons,
      consent: true,
      counsellorStatus: pick(r, ['pending', 'pending', 'confirmed', 'confirmed', 'changed']),
      followUpStatus: followUp,
      isDemo: true,
    });
  }
  return rows;
}

module.exports = { buildSessions };
