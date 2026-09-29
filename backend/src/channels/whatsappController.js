const twilio = require('twilio');
const MessagingResponse = twilio.twiml.MessagingResponse;

const { processTurn } = require('../livelihood/extract');
const { sanitizeProfile } = require('../livelihood/sanitize');
const { recommend } = require('../livelihood/recommend');
const { LivelihoodSession } = require('../models');
const { findOrCreateSession, saveSession, destroySession } = require('./store');
const { parseLanguageChoice, LANGUAGE_MENU } = require('./lang');
const { transcribeVoiceNote, sttConfigured } = require('./transcribe');
const { buildWhatsappSummary, T } = require('./summary');

const RESTART_WORDS = ['restart', 'reset', 'start over', 'शुरू', 'नया', 'dobara'];
const YES_WORDS = ['yes', 'y', 'haan', 'हाँ', 'हां', 'ha'];
const NO_WORDS = ['no', 'n', 'nahi', 'नहीं'];

const reply = (res, text) => {
  const twiml = new MessagingResponse();
  twiml.message(text);
  res.type('text/xml').send(twiml.toString());
};

const wantsRestart = (body) => RESTART_WORDS.includes((body || '').trim().toLowerCase());
const asYesNo = (body) => {
  const b = (body || '').trim().toLowerCase();
  if (YES_WORDS.includes(b)) return true;
  if (NO_WORDS.includes(b)) return false;
  return null;
};

// POST /api/channels/whatsapp/incoming
async function incoming(req, res, next) {
  try {
    const from = req.body.From; // e.g. "whatsapp:+91XXXXXXXXXX"
    const body = req.body.Body || '';
    const numMedia = parseInt(req.body.NumMedia || '0', 10);
    const isAudio = numMedia > 0 && (req.body.MediaContentType0 || '').startsWith('audio');

    let { session, created } = await findOrCreateSession('whatsapp', from, from);

    if (!created && wantsRestart(body)) {
      await destroySession(session);
      ({ session, created } = await findOrCreateSession('whatsapp', from, from));
      // `created` is now true, so this falls straight into the "brand new
      // conversation" branch below and sends the language menu.
    }

    // ---- brand new conversation: send the language menu and stop ----
    if (created) {
      return reply(res, `${LANGUAGE_MENU.whatsapp.hi}\n\n${LANGUAGE_MENU.whatsapp.en}`);
    }

    // ---- reply to the language menu ----
    if (session.status === 'lang_pending') {
      const lang = parseLanguageChoice(body);
      if (!lang) {
        return reply(res, `${LANGUAGE_MENU.whatsapp.hi}\n\n${LANGUAGE_MENU.whatsapp.en}`);
      }
      const result = processTurn({ lang, questionId: null, transcript: '', profile: sanitizeProfile({}), attempts: 0 });
      await saveSession(session, { lang, status: 'active', questionId: result.next.id, profile: result.profile, attempts: result.nextAttempts });
      return reply(res, `${result.message}\n\n${result.next.prompt}`);
    }

    // ---- awaiting the save/consent reply ----
    if (session.status === 'awaiting_consent') {
      const yes = asYesNo(body);
      if (yes === true) {
        const rec = recommend(session.profile, session.lang);
        const top = rec.recommendations[0];
        await LivelihoodSession.create({
          channel: 'whatsapp',
          lang: session.lang,
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
        await destroySession(session);
        return reply(res, T.gotIt[session.lang]);
      }
      if (yes === false) {
        await destroySession(session);
        return reply(res, T.skipped[session.lang]);
      }
      // didn't understand yes/no: ask again, without losing the finished profile
      return reply(res, T.askConsentWhatsapp[session.lang]);
    }

    // ---- normal interview turn (status === 'active') ----
    let transcript = body;
    if (!transcript && isAudio) {
      const text = await transcribeVoiceNote(req.body.MediaUrl0, session.lang);
      if (text) {
        transcript = text;
      } else {
        // Don't burn the question's one retry on an input type we can't read yet.
        const notice = sttConfigured()
          ? { en: "Sorry, we couldn't understand that voice note. Please try again or type your answer.", hi: 'माफ़ कीजिए, यह वॉइस नोट समझ नहीं आया। कृपया फिर कोशिश करें या टाइप करें।' }
          : { en: 'Voice notes are not supported here yet — please type your answer instead.', hi: 'अभी यहाँ वॉइस नोट काम नहीं करता — कृपया अपना जवाब टाइप करें।' };
        return reply(res, notice[session.lang] || notice.en);
      }
    }

    const result = processTurn({ lang: session.lang, questionId: session.questionId, transcript, profile: session.profile, attempts: session.attempts });

    if (result.done) {
      const rec = recommend(result.profile, session.lang);
      await saveSession(session, { status: 'awaiting_consent', questionId: null, profile: result.profile, attempts: 0 });
      const summary = buildWhatsappSummary(rec, session.lang);
      return reply(res, `${result.message}\n\n${summary}\n\n${T.askConsentWhatsapp[session.lang]}`);
    }

    await saveSession(session, { questionId: result.next.id, profile: result.profile, attempts: result.nextAttempts });
    return reply(res, `${result.message}\n\n${result.next.prompt}`);
  } catch (err) {
    next(err);
  }
}

module.exports = { incoming };
