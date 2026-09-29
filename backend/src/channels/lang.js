/**
 * Turning a caller's or sender's raw reply into 'hi' / 'en' for the language
 * step, which every phone/WhatsApp conversation starts with (the web app
 * gets this from the toggle in the UI instead).
 */

const isDevanagari = (s) => /[\u0900-\u097F]/.test(s || '');

const HI_WORDS = ['hindi', 'हिंदी', 'हिन्दी', '1'];
const EN_WORDS = ['english', 'angrezi', '2'];

/** Reply text or a DTMF digit -> 'hi' | 'en' | null (didn't understand). */
function parseLanguageChoice(text) {
  const t = (text || '').trim().toLowerCase();
  if (!t) return null;
  if (HI_WORDS.some((w) => t === w || t.includes(w))) return 'hi';
  if (EN_WORDS.some((w) => t === w || t.includes(w))) return 'en';
  if (isDevanagari(t)) return 'hi'; // they just replied in Hindi script - good enough signal
  return null;
}

// Kept as separate { en, hi } parts (not one mixed-script string) so the IVR
// controller can speak each part with the matching TTS voice/language tag.
const LANGUAGE_MENU = {
  ivr: {
    en: 'Welcome to Saksham. For English, press 2 or say English.',
    hi: 'नमस्ते, साक्षम में आपका स्वागत है। हिंदी के लिए 1 दबाएँ या हिंदी बोलिए।',
  },
  whatsapp: {
    en: 'Welcome to Saksham 🙏 For English, reply 2 or type "English".',
    hi: 'नमस्ते 🙏 साक्षम में आपका स्वागत है। हिंदी के लिए 1 भेजें या "Hindi" लिखें।',
  },
};

module.exports = { parseLanguageChoice, isDevanagari, LANGUAGE_MENU };
