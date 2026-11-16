/* ==========================================================
   Currículo: unidades y lecciones.
   Cada lección tiene pantallas de enseñanza (teach) y
   práctica (practice: lista de juegos con parámetros).
   known: letras ya enseñadas; los juegos solo usan palabras
   que se pueden descifrar con ellas (null = sin límite).
   ========================================================== */
import { VOWELS, SYLLABLES } from './words.js';
import { STORIES } from './stories.js';
import { INSIDE_LETTERS } from '../lib/content.js';

const U1_LETTERS = VOWELS;
const U2_LETTERS = ['M', 'P', 'S', 'L', 'T', 'D', 'N'];
const U3_LETTERS = ['B', 'C', 'F', 'G', 'J', 'R', 'V', 'Z', 'Ñ', 'H', 'CH', 'LL', 'QU', 'Y'];
const TRABADAS = ['BR', 'PL', 'TR', 'FL', 'GR', 'DR'];
const ALL_TAUGHT = VOWELS.concat(U2_LETTERS, U3_LETTERS, ['RR']);

const LETTER_EMOJI = {
  A: '✈️', E: '🐘', I: '🏝️', O: '🐻', U: '🍇', M: '🐵', P: '🦆', S: '☀️', L: '🌙', T: '🐢', N: '☁️', D: '🎲',
  B: '⛵', C: '🏠', F: '🔥', G: '🐱', J: '🦒', R: '🤖', V: '🐄', Z: '🦊', Ñ: '🍍', H: '🥚', CH: '🍫', LL: '🔑', QU: '🧀', Y: '🪀',
  BR: '💪', PL: '🌱', TR: '🚆', FL: '🌸', GR: '🦗', DR: '🐉',
};

/* Añade las letras conocidas a cada pantalla y tarea. */
const withKnown = (list, known) => list.map((x) => ({ ...x, known }));

/* Gira el orden de los juegos (menos el primero) para que las lecciones no se sientan iguales. */
const rotate = (list, n) => {
  if (list.length < 3) return list;
  const [first, ...rest] = list;
  const k = n % rest.length;
  return [first, ...rest.slice(k), ...rest.slice(0, k)];
};

const vowelLesson = (v, taught) => ({
  id: `v-${v.toLowerCase()}`, n: `La vocal ${v}`, e: LETTER_EMOJI[v], kind: 'letter', letter: v, level: 1, known: null,
  teach: withKnown([{ type: 'letter', letter: v }, { type: 'words', letter: v }], null),
  practice: withKnown([
    { game: 'traza', letter: v },
    { game: 'caza', targets: [v], pool: VOWELS, kind: 'letra' },
    { game: 'inicial', letter: v, choices: taught.length >= 3 ? taught : VOWELS },
    { game: 'vocal', letter: v, choices: taught.length >= 2 ? taught.concat(v) : VOWELS },
    { game: 'lee', letter: v, maxSyl: 3, avoidInitial: true },
    { game: 'caza', targets: [v], pool: VOWELS, kind: 'letra' },
  ], null),
});

const consonantLesson = (c, taught, level, index) => {
  const known = taught.concat(c === 'R' ? [c, 'RR'] : c);
  const inside = INSIDE_LETTERS.includes(c);
  const prev = taught[taught.length - 1];
  const teach = [{ type: 'letter', letter: c }, { type: 'syllables', letter: c }, { type: 'words', letter: c }];
  if (c === 'R') {
    teach.push({ type: 'text', e: '🐶', title: 'R suave y RR fuerte', body: 'Una sola R en medio suena suave: CARA, LORO. Dos erres juntas suenan fuerte: PERRO, CARRO. Al empezar la palabra también suena fuerte: RANA.' });
    teach.push({ type: 'syllables', letter: 'RR' });
  }
  if (c === 'G') teach.push({ type: 'text', e: '🧸', title: 'La G con la U', body: 'Con A, O y U la G suena sola: GATO, GOL, GUSANO. Con E e I lleva una U que no suena: JUGUETE, GUITARRA.' });
  const practice = inside
    ? [
      { game: 'traza', letter: c },
      { game: 'silaba', letter: c },
      { game: 'caza', targets: SYLLABLES[c].slice(0, 2), pool: SYLLABLES[c].concat(SYLLABLES[prev] || []), kind: 'sílaba' },
      { game: 'vocal', missing: c, letter: c },
      { game: 'lee', letter: c, maxSyl: 3 },
      { game: 'escucha', letter: c, maxSyl: 3 },
      { game: 'arma', letter: c, maxSyl: 3 },
    ]
    : [
      { game: 'traza', letter: c },
      { game: 'silaba', letter: c },
      { game: 'silabaInicial', letter: c },
      { game: 'caza', targets: SYLLABLES[c].slice(0, 2), pool: SYLLABLES[c].concat(SYLLABLES[prev] || []), kind: 'sílaba' },
      { game: 'inicial', letter: c, choices: taught.concat(c) },
      { game: 'lee', letter: c, maxSyl: 3 },
      { game: 'arma', letter: c, maxSyl: level >= 3 ? 3 : 2 },
    ];
  if (c === 'R') practice.push({ game: 'caza', targets: ['RRO', 'RRA'], pool: SYLLABLES.R.concat(SYLLABLES.RR), kind: 'sílaba' });
  return {
    id: `c-${c.toLowerCase()}`, n: `La letra ${c}`, e: LETTER_EMOJI[c], kind: 'letter', letter: c, level, known,
    teach: withKnown(teach, known),
    practice: withKnown(rotate(practice, index), known),
  };
};

const reviewLesson = (id, n, letters, level, extra = [], known = null) => ({
  id, n, e: '🏆', kind: 'review', level, letters, known,
  teach: withKnown([{ type: 'text', e: '🏆', title: n, body: `Vamos a repasar: ${letters.join(', ')}. ¡Tú puedes!` }], known),
  practice: withKnown([
    { game: 'caza', targets: [letters[letters.length - 1]], pool: letters, kind: 'letra' },
    { game: 'inicial', letters, choices: letters },
    { game: 'lee', letters, maxSyl: 3 },
    { game: 'memoria', letters, pairs: 3 },
    ...extra,
    { game: 'inicial', letters, choices: letters },
  ], known),
});

const storyLesson = (s) => ({ id: s.id, n: s.title, e: s.emoji, kind: 'story', storyId: s.id, level: s.lvl >= 3 ? 5 : 2, teach: [], practice: [] });

/* ---- Unidad 1: vocales ---- */
const u1 = [];
U1_LETTERS.forEach((v, i) => u1.push(vowelLesson(v, U1_LETTERS.slice(0, i))));
u1.push(reviewLesson('u1-repaso', 'Repaso de vocales', VOWELS, 1, [{ game: 'vocal', choices: VOWELS }, { game: 'vocal', choices: VOWELS }]));

/* ---- Unidad 2: primeras consonantes (+ dos cuentos en mayúsculas) ---- */
const u2 = [];
U2_LETTERS.forEach((c, i) => u2.push(consonantLesson(c, VOWELS.concat(U2_LETTERS.slice(0, i)), 2, i)));
const KNOWN_U2 = VOWELS.concat(U2_LETTERS);
u2.push(reviewLesson('u2-repaso', 'Repaso: M, P, S, L, T, D, N', U2_LETTERS, 2, [{ game: 'escucha', letters: U2_LETTERS, maxSyl: 2 }, { game: 'arma', letters: U2_LETTERS, maxSyl: 2 }], KNOWN_U2));
STORIES.filter((s) => s.after === 'u2').forEach((s) => u2.push(storyLesson(s)));

/* ---- Unidad 3: más letras, con repasos cada pocas letras ---- */
const u3 = [];
U3_LETTERS.forEach((c, i) => {
  const taught = VOWELS.concat(U2_LETTERS, U3_LETTERS.slice(0, i), i > U3_LETTERS.indexOf('R') ? ['RR'] : []);
  u3.push(consonantLesson(c, taught, 3, i + U2_LETTERS.length));
  if (c === 'G') u3.push(reviewLesson('u3-repaso-1', 'Repaso: B, C, F, G', ['B', 'C', 'F', 'G'], 3, [{ game: 'escucha', maxSyl: 2 }, { game: 'silaba' }], taught.concat(c)));
  if (c === 'Ñ') u3.push(reviewLesson('u3-repaso-2', 'Repaso: J, R, V, Z, Ñ', ['J', 'R', 'V', 'Z', 'Ñ'], 3, [{ game: 'escucha', maxSyl: 3 }, { game: 'dictado', maxSyl: 2 }], taught.concat(c, 'RR')));
});
const KNOWN_ALL = VOWELS.concat(U2_LETTERS, U3_LETTERS, ['RR']);
u3.push(reviewLesson('u3-repaso', 'Repaso de todas las letras', U2_LETTERS.concat(U3_LETTERS), 3, [{ game: 'escucha', maxSyl: 3 }, { game: 'dictado', maxSyl: 2 }], KNOWN_ALL));

/* ---- Unidad 4: palabras ---- */
const u4 = [
  {
    id: 'p-2sil', n: 'Palabras de 2 sílabas', e: '📖', kind: 'words', level: 3, known: KNOWN_ALL,
    teach: withKnown([{ type: 'text', e: '📖', title: 'Palabras de dos sílabas', body: 'Las palabras se forman con sílabas. GA-TO tiene dos: GA y TO. Lee cada sílaba y luego júntalas.' }, { type: 'words', minSyl: 2, maxSyl: 2, count: 6 }], KNOWN_ALL),
    practice: withKnown([{ game: 'lee', maxSyl: 2 }, { game: 'escucha', maxSyl: 2 }, { game: 'arma', minSyl: 2, maxSyl: 2 }, { game: 'dictado', maxSyl: 2 }, { game: 'memoria', maxSyl: 2, pairs: 3 }, { game: 'arma', minSyl: 2, maxSyl: 2 }], KNOWN_ALL),
  },
  {
    id: 'p-3sil', n: 'Palabras de 3 sílabas', e: '📗', kind: 'words', level: 3, known: KNOWN_ALL,
    teach: withKnown([{ type: 'text', e: '📗', title: 'Palabras de tres sílabas', body: 'TOR-TU-GA tiene tres sílabas. Lee despacio, sílaba por sílaba, y después toda junta.' }, { type: 'words', minSyl: 3, maxSyl: 3, count: 6 }], KNOWN_ALL),
    practice: withKnown([{ game: 'lee', minSyl: 3, maxSyl: 3 }, { game: 'arma', minSyl: 3, maxSyl: 3 }, { game: 'escucha', minSyl: 3, maxSyl: 3 }, { game: 'dictado', minSyl: 3, maxSyl: 3 }, { game: 'memoria', minSyl: 3, maxSyl: 3, pairs: 3 }, { game: 'arma', minSyl: 3, maxSyl: 3 }], KNOWN_ALL),
  },
  {
    id: 'p-minus', n: 'Las letras pequeñas', e: '🔡', kind: 'letters', level: 3, known: KNOWN_ALL,
    teach: withKnown([
      { type: 'text', e: '🔡', title: 'Mayúsculas y minúsculas', body: 'Cada letra tiene dos formas: grande (A) y pequeña (a). Suenan igual. Los cuentos y los libros usan casi siempre las pequeñas.' },
      { type: 'case', letters: VOWELS.concat(U2_LETTERS) },
      { type: 'case', letters: U3_LETTERS.filter((l) => l.length === 1) },
      { type: 'words', minSyl: 2, maxSyl: 2, count: 6, lower: true },
    ], KNOWN_ALL),
    practice: withKnown([{ game: 'mayus' }, { game: 'mayus' }, { game: 'lee', maxSyl: 2, lower: true }, { game: 'mayus' }, { game: 'escucha', maxSyl: 2, lower: true }, { game: 'lee', maxSyl: 3, lower: true }, { game: 'memoria', maxSyl: 2, pairs: 3, lower: true }], KNOWN_ALL),
  },
  {
    id: 'p-trabadas', n: 'Sílabas trabadas', e: '🚆', kind: 'syllables', level: 4, known: null,
    teach: [{ type: 'text', e: '🚆', title: 'Dos consonantes juntas', body: 'A veces dos consonantes van juntas antes de la vocal: TR en TREN, PL en PLATO, BR en BRAZO.' }, ...TRABADAS.map((t) => ({ type: 'syllables', letter: t }))],
    practice: [{ game: 'silaba', letter: 'TR' }, { game: 'silabaInicial', letter: 'PL' }, { game: 'silaba', letter: 'BR' }, { game: 'silabaInicial', letter: 'TR' }, { game: 'lee', letters: TRABADAS }, { game: 'arma', letters: TRABADAS }, { game: 'caza', targets: ['TRA', 'TRE'], pool: SYLLABLES.TR.concat(SYLLABLES.PL), kind: 'sílaba' }],
  },
  {
    id: 'p-rimas', n: 'Las rimas', e: '🎵', kind: 'words', level: 3,
    teach: [{ type: 'text', e: '🎵', title: '¿Qué es rimar?', body: 'Dos palabras riman cuando terminan igual: GATO y PATO. RANA y BANANA. Escucha el final de cada palabra.' }],
    practice: [{ game: 'rima' }, { game: 'rima' }, { game: 'rima' }, { game: 'rima' }, { game: 'rima' }],
  },
  {
    id: 'p-largas', n: 'Palabras largas', e: '🦕', kind: 'words', level: 4,
    teach: [{ type: 'text', e: '🦕', title: 'Palabras muy largas', body: 'DI-NO-SAU-RIO tiene cuatro sílabas. No tengas miedo: léela por partes.' }, { type: 'words', minSyl: 4, maxSyl: 5, count: 6 }],
    practice: [{ game: 'lee', minSyl: 4 }, { game: 'arma', minSyl: 4 }, { game: 'escucha', minSyl: 4 }, { game: 'arma', minSyl: 4 }, { game: 'carrera', maxSyl: 3 }],
  },
  reviewLesson('u4-repaso', 'Repaso de palabras', U2_LETTERS.concat(U3_LETTERS), 4, [{ game: 'dictado', maxSyl: 3 }, { game: 'escucha', maxSyl: 4, lower: true }, { game: 'mayus' }, { game: 'rima' }]),
];

/* ---- Unidad 5: frases ---- */
const u5 = [
  {
    id: 'f-1', n: 'Mis primeras frases', e: '💬', kind: 'sentences', level: 4,
    teach: [{ type: 'text', e: '💬', title: 'Leer una frase', body: 'Una frase son varias palabras juntas. Empieza con mayúscula y termina con un punto. Lee despacio: El sol es amarillo.' }],
    practice: [{ game: 'mayus' }, { game: 'frase', lvl: 4 }, { game: 'frase', lvl: 4 }, { game: 'lee', maxSyl: 3, lower: true }, { game: 'frase', lvl: 4 }, { game: 'frase', lvl: 4 }],
  },
  {
    id: 'f-2', n: 'Frases más largas', e: '📜', kind: 'sentences', level: 5,
    teach: [{ type: 'text', e: '📜', title: 'Frases largas', body: 'Ahora las frases tienen más palabras. Si te pierdes, pon el dedo debajo de cada palabra.' }],
    practice: [{ game: 'frase', lvl: 5 }, { game: 'frase', lvl: 5 }, { game: 'frase', lvl: 5 }, { game: 'carrera', maxSyl: 3 }, { game: 'frase', lvl: 5 }],
  },
  {
    id: 'f-3', n: 'Lector veloz', e: '🏁', kind: 'sentences', level: 5,
    teach: [{ type: 'text', e: '🏁', title: 'Leer rápido', body: 'Cuanto más lees, más rápido vas. Hoy hay carreras. ¡A toda velocidad!' }],
    practice: [{ game: 'carrera', maxSyl: 2 }, { game: 'frase', lvl: 5 }, { game: 'carrera', maxSyl: 3 }, { game: 'frase', lvl: 5 }],
  },
];

/* ---- Unidad 6: cuentos (en minúsculas) ---- */
const u6 = STORIES.filter((s) => !s.after).map(storyLesson);

export const UNITS = [
  { id: 'u1', n: 'Las vocales', e: '🅰️', color: '#43a047', lessons: u1 },
  { id: 'u2', n: 'Primeras letras', e: '🧩', color: '#2962ff', lessons: u2 },
  { id: 'u3', n: 'Más letras', e: '🔤', color: '#8e24aa', lessons: u3 },
  { id: 'u4', n: 'Palabras', e: '📖', color: '#fb8c00', lessons: u4 },
  { id: 'u5', n: 'Frases', e: '💬', color: '#e53935', lessons: u5 },
  { id: 'u6', n: 'Cuentos', e: '📚', color: '#00897b', lessons: u6 },
];

export const ALL_LESSONS = UNITS.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u.id })));
export const lessonById = (id) => ALL_LESSONS.find((l) => l.id === id);
export const unitOfLesson = (id) => UNITS.find((u) => u.lessons.some((l) => l.id === id));

/* Letras que ya "conoce" según el nivel (para el modo libre). */
export const lettersForLevel = (level) => (level <= 1 ? VOWELS : level === 2 ? VOWELS.concat(U2_LETTERS) : VOWELS.concat(U2_LETTERS, U3_LETTERS));
export const consonantsForLevel = (level) => (level <= 2 ? U2_LETTERS : level <= 3 ? U2_LETTERS.concat(U3_LETTERS) : U2_LETTERS.concat(U3_LETTERS, TRABADAS));
/* Palabras descifrables en el modo libre: en los niveles 2 y 3 solo con las letras de ese nivel. */
export const knownForLevel = (level) => (level === 2 ? KNOWN_U2 : level === 3 ? ALL_TAUGHT : null);
/* Pares mayúscula/minúscula que se practican. */
export const CASE_LETTERS = VOWELS.concat(U2_LETTERS, U3_LETTERS.filter((l) => l.length === 1));
