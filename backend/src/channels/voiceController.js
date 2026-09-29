const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

const { processTurn } = require('../livelihood/extract');
const { sanitizeProfile } = require('../livelihood/sanitize');
const { recommend } = require('../livelihood/recommend');
const { LivelihoodSession } = require('../models');
const { findOrCreateSession, saveSession, destroySession } = require('./store');
const { parseLanguageChoice, LANGUAGE_MENU } = require('./lang');
const { buildIvrSummary, T } = require('./summary');

const SPEECH_LANG = { en: 'en-IN', hi: 'hi-IN' };
const say = (twiml, lang, text) => twiml.say({ language: SPEECH_LANG[lang] || 'en-IN' }, text);

// A phone line is noisy, so we always give a typed-style Gather (speech) a
// second try before moving on, mirroring the web app's own retry-then-skip.
function gatherAnswer(twiml, lang) {
  return twiml.gather({
    input: 'speech',
    language: SPEECH_LANG[lang] || 'en-IN',
    speechTimeout: 'auto',
    action: '/api/channels/voice/gather',
    method: 'POST',
  });
}

function askQuestion(twiml, lang, message, prompt) {
  say(twiml, lang, message);
  const g = gatherAnswer(twiml, lang);
  say(g, lang, prompt);
  // If Gather gets nothing at all (silence, hangup-before-speaking), Twilio
  // just requests the action URL with an empty SpeechResult, which the
  // /gather handler below treats exactly like "didn't understand".
}

// POST /api/channels/voice/incoming — start of every call
async function incoming(req, res, next) {
  try {
    const callSid = req.body.CallSid;
    const from = req.body.From;
    await findOrCreateSession('ivr', callSid, from);

    const twiml = new VoiceResponse();
    const g = twiml.gather({
      input: 'dtmf speech',
      numDigits: 1,
      language: 'en-IN',
      action: '/api/channels/voice/language',
      method: 'POST',
    });
    say(g, 'hi', LANGUAGE_MENU.ivr.hi);
    say(g, 'en', LANGUAGE_MENU.ivr.en);
    // no input at all: repeat once, then say goodbye rather than loop forever
    say(twiml, 'hi', LANGUAGE_MENU.ivr.hi);
    say(twiml, 'en', LANGUAGE_MENU.ivr.en);
    twiml.hangup();
    res.type('text/xml').send(twiml.toString());
  } catch (err) {
    next(err);
  }
}

// POST /api/channels/voice/language — first Gather's action
async function language(req, res, next) {
  try {
    const callSid = req.body.CallSid;
    const { session } = await findOrCreateSession('ivr', callSid, req.body.From);
    const lang = parseLanguageChoice(req.body.Digits || req.body.SpeechResult);
    const twiml = new VoiceResponse();

    if (!lang) {
      // one retry, defaulting to Hindi if they still don't get through -
      // most PM-AJAY beneficiaries in the pilot states are more comfortable in Hindi
      say(twiml, 'hi', LANGUAGE_MENU.ivr.hi);
      say(twiml, 'en', LANGUAGE_MENU.ivr.en);
      const g = twiml.gather({ input: 'dtmf speech', numDigits: 1, action: '/api/channels/voice/language', method: 'POST' });
      say(g, 'hi', 'हिंदी के लिए 1, अंग्रेज़ी के लिए 2 दबाएँ।');
      return res.type('text/xml').send(twiml.toString());
    }

    const result = processTurn({ lang, questionId: null, transcript: '', profile: sanitizeProfile({}), attempts: 0 });
    await saveSession(session, { lang, status: 'active', questionId: result.next.id, profile: result.profile, attempts: result.nextAttempts });
    askQuestion(twiml, lang, result.message, result.next.prompt);
    res.type('text/xml').send(twiml.toString());
  } catch (err) {
    next(err);
  }
}

// POST /api/channels/voice/gather — every interview answer lands here
async function gather(req, res, next) {
  try {
    const callSid = req.body.CallSid;
    const { session, created } = await findOrCreateSession('ivr', callSid, req.body.From);
    const twiml = new VoiceResponse();

    // Defensive: if Twilio ever calls /gather for a call we have no record of
    // (e.g. a restart mid-deploy), just restart this call's interview cleanly.
    if (created || session.status !== 'active' || !session.questionId) {
      const lang = session.lang || 'hi';
      const result = processTurn({ lang, questionId: null, transcript: '', profile: sanitizeProfile({}), attempts: 0 });
      await saveSession(session, { lang, status: 'active', questionId: result.next.id, profile: result.profile, attempts: 0 });
      askQuestion(twiml, lang, result.message, result.next.prompt);
      return res.type('text/xml').send(twiml.toString());
    }

    const lang = session.lang;
    const transcript = req.body.SpeechResult || '';
    const result = processTurn({ lang, questionId: session.questionId, transcript, profile: session.profile, attempts: session.attempts });

    if (result.done) {
      const rec = recommend(result.profile, lang);
      await saveSession(session, { status: 'awaiting_consent', questionId: null, profile: result.profile, attempts: 0 });
      say(twiml, lang, `${result.message} ${buildIvrSummary(rec, lang)}`);
      const g = twiml.gather({ input: 'dtmf', numDigits: 1, action: '/api/channels/voice/consent', method: 'POST' });
      say(g, lang, T.askConsentIvr[lang]);
      say(twiml, lang, T.skipped[lang]); // reached only if they enter nothing at all
      twiml.hangup();
    } else {
      await saveSession(session, { questionId: result.next.id, profile: result.profile, attempts: result.nextAttempts });
      askQuestion(twiml, lang, result.message, result.next.prompt);
    }
    res.type('text/xml').send(twiml.toString());
  } catch (err) {
    next(err);
  }
}

// POST /api/channels/voice/consent — final step of the call
async function consent(req, res, next) {
  try {
    const callSid = req.body.CallSid;
    const { session, created } = await findOrCreateSession('ivr', callSid, req.body.From);
    const twiml = new VoiceResponse();
    const lang = session.lang || 'hi';

    if (!created && session.status === 'awaiting_consent' && req.body.Digits === '1') {
      const rec = recommend(session.profile, lang);
      const top = rec.recommendations[0];
      await LivelihoodSession.create({
        channel: 'ivr',
        lang,
        state: session.profile.state,
        profile: session.profile,
        recommendedCourseIds: rec.recommendations.map((r) => r.course.id),
        primaryTrade: top ? top.course.trades[0] : null,
        skillGaps: top ? top.gap.addsEn : [],
        needsReview: rec.needsCounsellor,
        reviewReasons: rec.counsellorReasons,
        contactPhone: session.contactPhone,
        consent: true,
      });
      say(twiml, lang, T.gotIt[lang]);
    } else {
      say(twiml, lang, T.skipped[lang]);
    }
    twiml.hangup();
    if (!created) await destroySession(session);
    res.type('text/xml').send(twiml.toString());
  } catch (err) {
    next(err);
  }
}

module.exports = { incoming, language, gather, consent };
