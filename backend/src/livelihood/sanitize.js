/**
 * The profile arrives from the browser (or, later, an IVR / WhatsApp bridge).
 * Never trust its shape: keep only known fields with known values.
 */
const { EDU_RANK, TRADES, STATES, QUESTIONS } = require('./vocab');
const { emptyProfile } = require('./extract');

const STATE_NAMES = STATES.map((s) => s.name);
const QUESTION_IDS = QUESTIONS.map((q) => q.id);
const tradeList = (v) => (Array.isArray(v) ? [...new Set(v.filter((k) => TRADES[k]))] : null);
const oneOf = (v, list) => (list.includes(v) ? v : null);

function sanitizeProfile(input) {
  const src = input && typeof input === 'object' ? input : {};
  const p = emptyProfile();

  p.state = oneOf(src.state, STATE_NAMES);
  const age = Number(src.age);
  p.age = Number.isInteger(age) && age >= 5 && age <= 100 ? age : null;
  p.education = oneOf(src.education, Object.keys(EDU_RANK));

  p.familyOccupation = tradeList(src.familyOccupation);
  p.currentActivity = tradeList(src.currentActivity);
  p.interests = tradeList(src.interests);
  p.localWork = tradeList(src.localWork);

  p.travel = oneOf(src.travel, ['local', 'district', 'anywhere']);
  p.physicalConstraint = typeof src.physicalConstraint === 'boolean' ? src.physicalConstraint : null;
  p.employmentPreference = oneOf(src.employmentPreference, ['self', 'wage', 'either']);

  p.gender = oneOf(src.gender, ['male', 'female', 'other']);
  p.category = 'sc'; // this service is for PM-AJAY beneficiaries; the counsellor verifies the certificate
  const income = Number(src.annualIncome);
  p.annualIncome = src.annualIncome !== null && src.annualIncome !== '' && Number.isFinite(income) && income >= 0 ? income : null;

  p.skipped = Array.isArray(src.skipped) ? src.skipped.filter((q) => QUESTION_IDS.includes(q)) : [];
  p.notes = {};
  if (src.notes && typeof src.notes === 'object') {
    for (const q of QUESTION_IDS) {
      if (typeof src.notes[q] === 'string') p.notes[q] = src.notes[q].slice(0, 500);
    }
  }
  return p;
}

module.exports = { sanitizeProfile };
