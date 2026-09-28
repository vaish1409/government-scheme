import { useCallback, useEffect, useRef, useState } from 'react';

/*
  Thin wrapper over the browser's Web Speech API.

  - Listening (speech to text) uses SpeechRecognition. It works in Chrome and
    Edge (desktop and Android) and Safari, and needs an internet connection
    because the browser sends the audio to its own speech service. Firefox has
    no support, so every screen that listens also offers typing.
  - Speaking (text to speech) uses speechSynthesis, which works offline when
    the phone has a voice installed for that language.
  - Nothing is recorded or uploaded by this app. Only the recognised TEXT is
    sent to our server.
*/

const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export const SPEECH_LANG = { en: 'en-IN', hi: 'hi-IN' };

export function useVoice(lang) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interim, setInterim] = useState('');
  const recRef = useRef(null);

  const sttSupported = !!SR;
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stopSpeaking = useCallback(() => {
    if (ttsSupported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [ttsSupported]);

  const stopListening = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* already stopped */ }
  }, []);

  // Resolves { text, error } when the person stops talking. Never rejects.
  const listen = useCallback(
    () =>
      new Promise((resolve) => {
        if (!SR) return resolve({ text: '', error: 'unsupported' });
        stopSpeaking();

        const rec = new SR();
        rec.lang = SPEECH_LANG[lang] || 'en-IN';
        rec.interimResults = true;
        rec.continuous = false;
        rec.maxAlternatives = 1;

        let finalText = '';
        let lastInterim = '';
        let error = '';

        rec.onresult = (e) => {
          let interimText = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) finalText += `${r[0].transcript} `;
            else interimText += r[0].transcript;
          }
          lastInterim = interimText;
          setInterim(`${finalText}${interimText}`.trim());
        };
        rec.onerror = (e) => { error = e.error || 'error'; };
        rec.onend = () => {
          setListening(false);
          setInterim('');
          recRef.current = null;
          resolve({ text: (finalText || lastInterim).trim(), error });
        };

        recRef.current = rec;
        setInterim('');
        setListening(true);
        try {
          rec.start();
        } catch {
          setListening(false);
          resolve({ text: '', error: 'error' });
        }
      }),
    [lang, stopSpeaking]
  );

  // Resolves when the sentence has been spoken (or straight away if speech is unavailable).
  const say = useCallback(
    (text) =>
      new Promise((resolve) => {
        if (!ttsSupported || !text) return resolve();
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = SPEECH_LANG[lang] || 'en-IN';
        u.rate = 0.92;
        const voices = synth.getVoices();
        const match = voices.find((v) => v.lang === u.lang) || voices.find((v) => v.lang.startsWith(lang));
        if (match) u.voice = match;
        const done = () => { setSpeaking(false); resolve(); };
        u.onend = done;
        u.onerror = done;
        setSpeaking(true);
        synth.speak(u);
      }),
    [lang, ttsSupported]
  );

  // stop everything when the screen closes
  useEffect(
    () => () => {
      try { recRef.current?.abort(); } catch { /* noop */ }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    },
    []
  );

  return { sttSupported, ttsSupported, listening, speaking, interim, listen, stopListening, say, stopSpeaking };
}
