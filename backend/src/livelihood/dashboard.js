/**
 * Turns saved sessions into the numbers an officer needs:
 * where demand is, what people want vs. what work exists locally, which skills
 * are missing, and what happens after a recommendation (placement funnel).
 */
const { TRADES, EDU_LABEL } = require('./vocab');
const { BY_ID } = require('./courses');
const demand = require('./demand');

const top = (counter, n) => Object.entries(counter).sort((a, b) => b[1] - a[1]).slice(0, n);
const inc = (obj, key, by = 1) => { obj[key] = (obj[key] || 0) + by; };

function summarise(rows, langIn = 'en') {
  const lang = langIn === 'hi' ? 'hi' : 'en';
  const states = {}, interests = {}, lowDemand = {}, courses = {}, gaps = {}, edu = {};
  const funnel = { none: 0, enrolled: 0, completed: 0, placed: 0, dropped: 0 };
  const pref = { self: 0, wage: 0, either: 0, unknown: 0 };
  const totals = { sessions: rows.length, demoSessions: 0, needsReview: 0, pendingCounsellor: 0, confirmed: 0, changed: 0 };

  for (const r of rows) {
    const p = r.profile || {};
    if (r.isDemo) totals.demoSessions += 1;
    if (r.needsReview) totals.needsReview += 1;
    if (r.counsellorStatus === 'pending') totals.pendingCounsellor += 1;
    if (r.counsellorStatus === 'confirmed') totals.confirmed += 1;
    if (r.counsellorStatus === 'changed') totals.changed += 1;

    if (r.state) inc(states, r.state);
    if (p.education) inc(edu, p.education);
    inc(pref, p.employmentPreference || 'unknown');
    inc(funnel, r.followUpStatus || 'none');

    for (const tr of p.interests || []) {
      inc(interests, tr);
      // "people want it, but the state has little of that work": a planning signal
      if (r.state && demand.level(r.state, tr) <= 1) inc(lowDemand, tr);
    }
    if ((r.recommendedCourseIds || [])[0]) inc(courses, r.recommendedCourseIds[0]);
    for (const g of r.skillGaps || []) inc(gaps, g);
  }

  const followed = funnel.enrolled + funnel.completed + funnel.placed + funnel.dropped;
  return {
    totals,
    byState: top(states, 10).map(([state, count]) => ({ state, count })),
    interests: top(interests, 8).map(([trade, count]) => ({
      trade, label: TRADES[trade] ? TRADES[trade][lang] : trade, count, lowLocalDemand: lowDemand[trade] || 0,
    })),
    topCourses: top(courses, 6).map(([id, count]) => ({ id, title: BY_ID[id] ? BY_ID[id].title[lang] : id, nsqf: BY_ID[id] ? BY_ID[id].nsqf : null, count })),
    skillGaps: top(gaps, 6).map(([skill, count]) => ({ skill, count })),
    education: top(edu, 8).map(([key, count]) => ({ key, label: EDU_LABEL[key] ? EDU_LABEL[key][lang] : key, count })),
    preference: pref,
    funnel: { ...funnel, followedUp: followed, placementRate: followed ? Math.round((funnel.placed / followed) * 100) : null },
  };
}

module.exports = { summarise };
