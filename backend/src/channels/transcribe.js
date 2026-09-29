/**
 * WhatsApp voice notes arrive as an audio file URL (Twilio's MediaUrl0), not
 * as text — unlike a phone call, Twilio does NOT transcribe these for us.
 * Getting text out of them needs a speech-to-text provider.
 *
 * This is intentionally pluggable and OFF by default:
 *   - Without OPENAI_API_KEY set, transcribeVoiceNote() returns null and the
 *     WhatsApp bridge asks the person to type their answer instead. Nothing
 *     breaks; voice notes just aren't understood yet.
 *   - With OPENAI_API_KEY set, it downloads the note (with Twilio's own
 *     account credentials, which the media URL requires) and sends it to
 *     OpenAI's Whisper endpoint for transcription in the person's language.
 *
 * Swap this file's internals for Google Speech-to-Text, Bhashini, or another
 * provider if that fits the deployment better — nothing else in the app
 * depends on which provider is used, only on this function's signature.
 */

const WHISPER_LANG = { en: 'en', hi: 'hi' };

/**
 * @param {string} mediaUrl Twilio's MediaUrl0 for the inbound voice note.
 * @param {string} lang 'en' | 'hi' — a hint, not a guarantee, of the spoken language.
 * @returns {Promise<string|null>} the transcript, or null if STT isn't configured or fails.
 */
async function transcribeVoiceNote(mediaUrl, lang) {
  const apiKey = process.env.OPENAI_API_KEY;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!apiKey || !sid || !token || !mediaUrl) return null;

  try {
    // Twilio media URLs require the account's own credentials to fetch.
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const audioRes = await fetch(mediaUrl, { headers: { Authorization: `Basic ${auth}` } });
    if (!audioRes.ok) return null;
    const audioBlob = await audioRes.blob();

    const form = new FormData();
    form.append('file', audioBlob, 'voice-note.ogg');
    form.append('model', 'whisper-1');
    if (WHISPER_LANG[lang]) form.append('language', WHISPER_LANG[lang]);

    const sttRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!sttRes.ok) return null;
    const data = await sttRes.json();
    return typeof data.text === 'string' && data.text.trim() ? data.text.trim() : null;
  } catch (err) {
    console.error('transcribeVoiceNote failed:', err.message);
    return null;
  }
}

const sttConfigured = () => Boolean(process.env.OPENAI_API_KEY);

module.exports = { transcribeVoiceNote, sttConfigured };
