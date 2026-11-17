/* Selección de palabras y letras para los juegos. */
import { WORDS, startsWith, VOWELS, SYLLABLES } from '../content/words.js';
import { shuffle, pickOne, takeDistinct } from './utils.js';

let customWords = [];
export const setCustomWords = (list) => { customWords = Array.isArray(list) ? list : []; };
export const allWords = () => WORDS.concat(customWords);

const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/* Filtra palabras según parámetros de un juego. */
export function filterWords(p = {}) {
  let list = allWords();
  if (p.letter) list = list.filter((w) => startsWith(w, p.letter));
  if (p.letters) list = list.filter((w) => p.letters.some((l) => startsWith(w, l)));
  if (p.minSyl) list = list.filter((w) => w.s.length >= p.minSyl);
  if (p.maxSyl) list = list.filter((w) => w.s.length <= p.maxSyl);
  if (p.noAccents) list = list.filter((w) => /^[A-ZÑ]+$/.test(w.w));
  if (p.containsVowel) list = list.filter((w) => [...strip(w.w)].some((c, i) => i > 0 && c === p.containsVowel));
  if (p.predicate) list = list.filter(p.predicate);
  return list;
}

/* Devuelve palabras para un juego, prefiriendo el mundo elegido y evitando repetidas.
   Si el filtro deja muy pocas, relaja mundo y luego el resto. */
export function pickWords(n, p = {}, used = new Set()) {
  const base = filterWords(p);
  const inWorld = p.world ? base.filter((w) => w.world === p.world) : base;
  const order = [inWorld, base, filterWords({ ...p, letter: undefined, letters: undefined }), allWords()];
  const out = [];
  const seen = new Set();
  for (const pool of order) {
    for (const w of shuffle(pool)) {
      if (seen.has(w.w) || used.has(w.w)) continue;
      seen.add(w.w);
      out.push(w);
      if (out.length === n) return out;
    }
    if (out.length === n) break;
  }
  // último recurso: permitir repetidas
  if (out.length < n) for (const w of shuffle(allWords())) { if (!seen.has(w.w)) { seen.add(w.w); out.push(w); if (out.length === n) break; } }
  return out;
}

export function pickWord(p, used) {
  const w = pickWords(1, p, used)[0];
  if (w) used?.add(w.w);
  return w;
}

/* Identifica el dibujo de una palabra: su foto (si la tiene) o su emoji. */
export const picKey = (w) => (w.img ? `img:${w.img}` : w.e);

/* Distractores con dibujo o texto distintos al objetivo. */
export function distractors(target, n, key, p = {}) {
  const k = key === 'e' ? picKey : (w) => w[key];
  const seen = new Set([k(target)]);
  const base = filterWords({ maxSyl: p.maxSyl });
  const sameWorld = p.world ? base.filter((w) => w.world === p.world) : [];
  let out = takeDistinct(sameWorld, n, k, seen);
  if (out.length < n) out = out.concat(takeDistinct(base, n - out.length, k, seen));
  if (out.length < n) out = out.concat(takeDistinct(allWords(), n - out.length, k, seen));
  return out;
}

export const syllablesOf = (letter) => SYLLABLES[letter] || [];
export const randomConsonant = (list) => pickOne(list.filter((c) => SYLLABLES[c]));
export const isVowel = (ch) => VOWELS.includes(strip(ch));
export { strip };
