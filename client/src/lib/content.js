/* Selección de palabras y letras para los juegos. */
import { WORDS, VOWELS, SYLLABLES } from '../content/words.js';
import { shuffle, pickOne, takeDistinct } from './utils.js';

let customWords = [];
export const setCustomWords = (list) => { customWords = Array.isArray(list) ? list : []; };
export const allWords = () => WORDS.concat(customWords);

/* Quita tildes pero conserva la Ñ (en NFD la eñe es N + virgulilla). */
const strip = (s) => s.replace(/Ñ/g, '\u0001').replace(/ñ/g, '\u0002').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0001/g, 'Ñ').replace(/\u0002/g, 'ñ');
const DIGRAPHS = ['CH', 'LL', 'QU', 'RR'];
/* Letras que se practican buscándolas dentro de la palabra (casi no hay palabras que empiecen con ellas). */
export const INSIDE_LETTERS = ['Ñ', 'QU', 'RR'];

/* Divide la palabra en unidades de lectura: dígrafos (CH, LL, QU, RR), C suave (CE/CI), GUE/GUI y letras sueltas. */
export function units(word) {
  const s = strip(word);
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const two = s.slice(i, i + 2);
    if (DIGRAPHS.includes(two)) { out.push(two); i++; continue; }
    if (s[i] === 'C' && 'EI'.includes(s[i + 1] || '')) { out.push('C*'); continue; }
    if (s[i] === 'G' && 'EI'.includes(s[i + 1] || '')) { out.push('G*'); continue; }
    if (two === 'GU' && 'EI'.includes(s[i + 2] || '')) { out.push('GU'); i++; continue; }
    out.push(s[i]);
  }
  return out;
}

/* ¿Se puede descifrar la palabra solo con las letras ya enseñadas? */
export function decodable(word, known) {
  if (!known) return true;
  const k = new Set(known);
  if (k.has('C') && k.has('Z')) k.add('C*'); // ce, ci suenan como la zeta/ese
  if (k.has('G') && k.has('J')) k.add('G*'); // ge, gi suenan como la jota
  if (k.has('G') && k.has('QU')) k.add('GU'); // gue, gui: la u no suena, como en que, qui
  return units(word.w).every((u) => k.has(u));
}

/* Letras ya enseñadas por defecto (las fija useGame según la tarea). */
let currentKnown = null;
export const setKnownLetters = (list) => { currentKnown = Array.isArray(list) && list.length ? list : null; };

/* ¿La palabra sirve para practicar esta letra?
   - Vocales y consonantes normales: empieza con la letra y la sílaba inicial es directa
     (consonante + vocal), sin dígrafos ni grupos como TR, PL. Para C y G solo ca/co/cu, ga/go/gu.
   - Ñ, QU, RR: la letra está dentro de la palabra.
   - Trabadas (BR, PL...): empieza con el grupo. */
export function matchesLetter(w, letter, { anyOnset = false } = {}) {
  const s = strip(w.w);
  if (INSIDE_LETTERS.includes(letter)) return s.includes(letter);
  if (!s.startsWith(letter)) return false;
  if (anyOnset || letter.length > 1 || VOWELS.includes(letter)) return true;
  if (DIGRAPHS.some((d) => s.startsWith(d))) return false;
  if (!VOWELS.includes(s[1] || '')) return false;
  if ((letter === 'C' || letter === 'G') && 'EI'.includes(s[1])) return false;
  return true;
}
export const startsWith = (w, letter) => matchesLetter(w, letter);

/* Filtra palabras según parámetros de un juego. */
export function filterWords(p = {}) {
  let list = allWords();
  if (p.letter) list = list.filter((w) => matchesLetter(w, p.letter, p));
  if (p.letters) list = list.filter((w) => p.letters.some((l) => matchesLetter(w, l, p)));
  if (p.minSyl) list = list.filter((w) => w.s.length >= p.minSyl);
  if (p.maxSyl) list = list.filter((w) => w.s.length <= p.maxSyl);
  if (p.noAccents) list = list.filter((w) => /^[A-ZÑ]+$/.test(w.w));
  if (p.containsVowel) list = list.filter((w) => [...strip(w.w)].some((c, i) => i > 0 && c === p.containsVowel));
  const known = p.known === undefined ? currentKnown : p.known;
  if (known) list = list.filter((w) => decodable(w, known));
  if (p.predicate) list = list.filter(p.predicate);
  return list;
}

/* Devuelve palabras para un juego, prefiriendo el mundo elegido y evitando repetidas.
   Si el filtro deja muy pocas, relaja mundo, luego la letra y por último la decodificabilidad. */
export function pickWords(n, p = {}, used = new Set()) {
  const base = filterWords(p);
  const inWorld = p.world ? base.filter((w) => w.world === p.world) : base;
  const order = [inWorld, base, filterWords({ ...p, letter: undefined, letters: undefined }), filterWords({ ...p, known: null }), allWords()];
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

/* Distractores con emoji o texto distintos al objetivo.
   avoidInitial: evita palabras que empiecen con la misma letra que el objetivo
   (así la primera letra es una pista válida para quien aún no descifra todo). */
export function distractors(target, n, key, p = {}) {
  const seen = new Set([target[key]]);
  const first = strip(target.w)[0];
  const ok = (w) => !p.avoidInitial || strip(w.w)[0] !== first;
  const base = filterWords({ maxSyl: p.maxSyl }).filter(ok);
  const sameWorld = p.world ? base.filter((w) => w.world === p.world) : [];
  let out = takeDistinct(sameWorld, n, (w) => w[key], seen);
  if (out.length < n) out = out.concat(takeDistinct(base, n - out.length, (w) => w[key], seen));
  if (out.length < n) out = out.concat(takeDistinct(allWords().filter(ok), n - out.length, (w) => w[key], seen));
  if (out.length < n) out = out.concat(takeDistinct(allWords(), n - out.length, (w) => w[key], seen));
  return out;
}

export const syllablesOf = (letter) => SYLLABLES[letter] || [];
export const randomConsonant = (list) => pickOne(list.filter((c) => SYLLABLES[c]));
export const isVowel = (ch) => VOWELS.includes(strip(ch));
export { strip };
