/* ==========================================================
   Currículo: unidades y lecciones.
   Cada lección tiene pantallas de enseñanza (teach) y
   práctica (practice: lista de juegos con parámetros).
   ========================================================== */
import { VOWELS, SYLLABLES } from './words.js';
import { STORIES } from './stories.js';

const U1_LETTERS = VOWELS;
const U2_LETTERS = ['M', 'P', 'S', 'L', 'T', 'N', 'D'];
const U3_LETTERS = ['B', 'C', 'F', 'G', 'J', 'R', 'V', 'Z', 'Ñ', 'H', 'CH', 'LL', 'QU', 'Y'];
const TRABADAS = ['BR', 'PL', 'TR', 'FL', 'GR', 'DR'];

const LETTER_EMOJI = {
  A: '✈️', E: '🐘', I: '🏝️', O: '🐻', U: '🍇', M: '🐵', P: '🦆', S: '☀️', L: '🌙', T: '🐢', N: '☁️', D: '🎲',
  B: '⛵', C: '🏠', F: '🔥', G: '🐱', J: '🦒', R: '🤖', V: '🐄', Z: '🦊', Ñ: '🍍', H: '🥚', CH: '🍫', LL: '🔑', QU: '🧀', Y: '🪀',
  BR: '💪', PL: '🌱', TR: '🚆', FL: '🌸', GR: '🦗', DR: '🐉',
};

const vowelLesson = (v, taught) => ({
  id: `v-${v.toLowerCase()}`, n: `La vocal ${v}`, e: LETTER_EMOJI[v], kind: 'letter', letter: v, level: 1,
  teach: [{ type: 'letter', letter: v }, { type: 'words', letter: v }],
  practice: [
    { game: 'traza', letter: v },
    { game: 'caza', targets: [v], pool: VOWELS, kind: 'letra' },
    { game: 'inicial', letter: v, choices: taught.length >= 3 ? taught : VOWELS },
    { game: 'vocal', letter: v, choices: taught.length >= 3 ? taught : VOWELS },
    { game: 'lee', letter: v, maxSyl: 3 },
    { game: 'caza', targets: [v], pool: VOWELS, kind: 'letra' },
  ],
});

const consonantLesson = (c, taught, level) => ({
  id: `c-${c.toLowerCase()}`, n: `La letra ${c}`, e: LETTER_EMOJI[c], kind: 'letter', letter: c, level,
  teach: [{ type: 'letter', letter: c }, { type: 'syllables', letter: c }, { type: 'words', letter: c }],
  practice: [
    { game: 'traza', letter: c },
    { game: 'silaba', letter: c },
    { game: 'silabaInicial', letter: c },
    { game: 'caza', targets: SYLLABLES[c].slice(0, 2), pool: SYLLABLES[c].concat(SYLLABLES[taught[taught.length - 1] || 'M'] || []), kind: 'sílaba' },
    { game: 'inicial', letter: c, choices: taught.concat(c) },
    { game: 'lee', letter: c, maxSyl: 3 },
    { game: 'arma', letter: c, maxSyl: level >= 3 ? 3 : 2 },
  ],
});

const reviewLesson = (id, n, letters, level, extra = []) => ({
  id, n, e: '🏆', kind: 'review', level, letters,
  teach: [{ type: 'text', e: '🏆', title: n, body: `Vamos a repasar: ${letters.join(', ')}. ¡Tú puedes!` }],
  practice: [
    { game: 'caza', targets: [letters[letters.length - 1]], pool: letters, kind: 'letra' },
    { game: 'inicial', letters, choices: letters },
    { game: 'lee', letters, maxSyl: 3 },
    { game: 'memoria', letters, pairs: 3 },
    ...extra,
    { game: 'inicial', letters, choices: letters },
  ],
});

/* ---- Unidad 1: vocales ---- */
const u1 = [];
U1_LETTERS.forEach((v, i) => u1.push(vowelLesson(v, U1_LETTERS.slice(0, i))));
u1.push(reviewLesson('u1-repaso', 'Repaso de vocales', VOWELS, 1, [{ game: 'vocal', choices: VOWELS }, { game: 'vocal', choices: VOWELS }]));

/* ---- Unidad 2: primeras consonantes ---- */
const u2 = [];
U2_LETTERS.forEach((c, i) => u2.push(consonantLesson(c, VOWELS.concat(U2_LETTERS.slice(0, i)), 2)));
u2.push(reviewLesson('u2-repaso', 'Repaso: M, P, S, L, T, N, D', U2_LETTERS, 2, [{ game: 'escucha', letters: U2_LETTERS, maxSyl: 2 }, { game: 'arma', letters: U2_LETTERS, maxSyl: 2 }]));

/* ---- Unidad 3: más letras ---- */
const u3 = [];
U3_LETTERS.forEach((c, i) => u3.push(consonantLesson(c, U2_LETTERS.concat(U3_LETTERS.slice(0, i)), 3)));
u3.push(reviewLesson('u3-repaso', 'Repaso de todas las letras', U2_LETTERS.concat(U3_LETTERS), 3, [{ game: 'escucha', maxSyl: 3 }, { game: 'dictado', maxSyl: 2 }]));

/* ---- Unidad 4: palabras ---- */
const u4 = [
  {
    id: 'p-2sil', n: 'Palabras de 2 sílabas', e: '📖', kind: 'words', level: 3,
    teach: [{ type: 'text', e: '📖', title: 'Palabras de dos sílabas', body: 'Las palabras se forman con sílabas. GA-TO tiene dos: GA y TO. Lee cada sílaba y luego júntalas.' }, { type: 'words', minSyl: 2, maxSyl: 2, count: 6 }],
    practice: [{ game: 'lee', maxSyl: 2 }, { game: 'escucha', maxSyl: 2 }, { game: 'arma', minSyl: 2, maxSyl: 2 }, { game: 'dictado', maxSyl: 2 }, { game: 'memoria', maxSyl: 2, pairs: 3 }, { game: 'arma', minSyl: 2, maxSyl: 2 }],
  },
  {
    id: 'p-3sil', n: 'Palabras de 3 sílabas', e: '📗', kind: 'words', level: 3,
    teach: [{ type: 'text', e: '📗', title: 'Palabras de tres sílabas', body: 'TOR-TU-GA tiene tres sílabas. Lee despacio, sílaba por sílaba, y después toda junta.' }, { type: 'words', minSyl: 3, maxSyl: 3, count: 6 }],
    practice: [{ game: 'lee', minSyl: 3, maxSyl: 3 }, { game: 'arma', minSyl: 3, maxSyl: 3 }, { game: 'escucha', minSyl: 3, maxSyl: 3 }, { game: 'dictado', minSyl: 3, maxSyl: 3 }, { game: 'memoria', minSyl: 3, maxSyl: 3, pairs: 3 }, { game: 'arma', minSyl: 3, maxSyl: 3 }],
  },
  {
    id: 'p-trabadas', n: 'Sílabas trabadas', e: '🚆', kind: 'syllables', level: 4,
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
  reviewLesson('u4-repaso', 'Repaso de palabras', U2_LETTERS.concat(U3_LETTERS), 4, [{ game: 'dictado', maxSyl: 3 }, { game: 'escucha', maxSyl: 4 }, { game: 'rima' }]),
];

/* ---- Unidad 5: frases ---- */
const u5 = [
  {
    id: 'f-1', n: 'Mis primeras frases', e: '💬', kind: 'sentences', level: 4,
    teach: [{ type: 'text', e: '💬', title: 'Leer una frase', body: 'Una frase son varias palabras juntas. Empieza con mayúscula y termina con un punto. Lee despacio: El sol es amarillo.' }],
    practice: [{ game: 'frase', lvl: 4 }, { game: 'frase', lvl: 4 }, { game: 'frase', lvl: 4 }, { game: 'escucha', maxSyl: 3 }, { game: 'frase', lvl: 4 }],
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

/* ---- Unidad 6: cuentos ---- */
const u6 = STORIES.map((s) => ({ id: s.id, n: s.title, e: s.emoji, kind: 'story', storyId: s.id, level: 5, teach: [], practice: [] }));

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
