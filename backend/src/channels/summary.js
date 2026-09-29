/**
 * The web app shows recommend() results as rich cards. A phone call has to
 * SAY them, and a WhatsApp message reads best as short plain-text lines, so
 * these two builders turn the same result into speech- and text-friendly
 * summaries without duplicating any of the recommendation logic itself.
 */

const T = {
  intro: { en: 'Based on what you told us, here is what we suggest.', hi: 'आपने जो बताया उसके आधार पर, यह हमारा सुझाव है।' },
  courseWord: { en: 'Option', hi: 'विकल्प' },
  nsqf: { en: 'NSQF level', hi: 'एनएसक्यूएफ स्तर' },
  noMatch: {
    en: 'We could not find a strong match yet. A counsellor will help you directly.',
    hi: 'हमें अभी कोई अच्छा विकल्प नहीं मिला। एक काउंसलर आपकी सीधे मदद करेंगे।',
  },
  askConsentIvr: {
    en: 'To let a counsellor call you back on this number and help you further, press 1. To skip, press 2.',
    hi: 'इस नंबर पर काउंसलर का कॉल पाने के लिए 1 दबाएँ। छोड़ने के लिए 2 दबाएँ।',
  },
  askConsentWhatsapp: {
    en: 'Reply YES if a counsellor may contact you on this WhatsApp number for help. Reply NO to skip.',
    hi: 'अगर काउंसलर इस व्हाट्सएप नंबर पर आपसे संपर्क कर सकते हैं तो YES भेजें। छोड़ने के लिए NO भेजें।',
  },
  gotIt: { en: 'Thank you. A counsellor will reach out on this number soon.', hi: 'धन्यवाद। जल्द ही काउंसलर इस नंबर पर संपर्क करेंगे।' },
  skipped: { en: 'Okay, we have not saved your details.', hi: 'ठीक है, हमने आपकी जानकारी सेव नहीं की।' },
  restart: { en: 'Starting over. ', hi: 'फिर से शुरू करते हैं। ' },
};

/** Very short: one line per option, for a phone call (max ~2 options). */
function buildIvrSummary(result, lang) {
  const l = lang === 'hi' ? 'hi' : 'en';
  if (!result.recommendations.length) return T.noMatch[l];
  const lines = [T.intro[l]];
  result.recommendations.slice(0, 2).forEach((r, i) => {
    const reason = r.reasons[0] ? ` ${r.reasons[0]}` : '';
    lines.push(`${T.courseWord[l]} ${i + 1}: ${r.course.title}.${reason}`);
  });
  return lines.join(' ');
}

/** A bit richer: up to 3 options with NSQF level and top 2 reasons, for WhatsApp text. */
function buildWhatsappSummary(result, lang) {
  const l = lang === 'hi' ? 'hi' : 'en';
  if (!result.recommendations.length) return T.noMatch[l];
  const lines = [T.intro[l], ''];
  result.recommendations.slice(0, 3).forEach((r, i) => {
    lines.push(`${i + 1}. *${r.course.title}* (${T.nsqf[l]} ${r.course.nsqf})`);
    r.reasons.slice(0, 2).forEach((reason) => lines.push(`   - ${reason}`));
  });
  if (result.opportunities?.note) lines.push('', result.opportunities.note);
  return lines.join('\n');
}

module.exports = { buildIvrSummary, buildWhatsappSummary, T };
