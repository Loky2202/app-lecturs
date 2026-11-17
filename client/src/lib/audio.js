/* Sonidos de letras grabados (opcional).
   Si existe /sounds/<letra>.mp3 se reproduce ese audio (sonido puro: "mmm", "p", "t").
   Si no existe, se usa la voz del sistema, que suele decir el nombre de la letra ("pe", "te"). */
import { Voice } from './voice.js';
import { LETTER_INFO } from '../content/words.js';

const cache = new Map(); // letra -> true (existe) | false (no existe)
const fileFor = (letter) => `/sounds/${letter.toLowerCase().replace('ñ', 'enie')}.mp3`;

async function exists(letter) {
  if (cache.has(letter)) return cache.get(letter);
  let ok = false;
  try {
    const res = await fetch(fileFor(letter), { method: 'HEAD' });
    ok = res.ok && (res.headers.get('content-type') || '').startsWith('audio');
  } catch { ok = false; }
  cache.set(letter, ok);
  return ok;
}

export const LetterAudio = {
  /* Reproduce el sonido de la letra. Devuelve true si usó una grabación. */
  async playSound(letter) {
    const info = LETTER_INFO[letter] || {};
    if (await exists(letter)) {
      Voice.stop();
      try { await new Audio(fileFor(letter)).play(); return true; } catch { /* seguir con la voz */ }
    }
    if (info.sound) Voice.speak(info.sound, { rate: 0.7 });
    return false;
  },
  hasRecording: (letter) => cache.get(letter) === true,
};
