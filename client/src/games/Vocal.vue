<template>
  <div class="task">
    <div class="big-emoji">{{ word.e }}</div>
    <BigWord :word="word.w" :blank="pos" :blank-len="missing.length || 1" />
    <OptionGrid :options="options" :ok-speak="`${spoken(word.w)}. ¡Muy bien!`" @done="(r) => finish(r.firstTry)" />
  </div>
</template>

<script setup>
/* ¿Qué letra falta? Por defecto una vocal; con p.missing, cualquier letra o dígrafo (Ñ, QU, RR). */
import OptionGrid from '../components/OptionGrid.vue';
import BigWord from '../components/BigWord.vue';
import { useGame } from '../lib/game.js';
import { pickWord, strip } from '../lib/content.js';
import { VOWELS, LETTER_INFO } from '../content/words.js';
import { shuffle, pickOne, spoken } from '../lib/utils.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { level, world, setInstruction, finish } = useGame(props, emit);
const p = props.params;
const missing = p.missing || '';
const vowel = !missing && p.letter && VOWELS.includes(p.letter) ? p.letter : null;

/* Posiciones donde falta algo: una vocal (no inicial) o la letra pedida. */
const positionsOf = (w) => {
  const s = strip(w.w);
  const out = [];
  if (missing) { let i = s.indexOf(missing); while (i >= 0) { out.push(i); i = s.indexOf(missing, i + 1); } return out; }
  [...s].forEach((c, i) => { if (i > 0 && VOWELS.includes(c) && (!vowel || c === vowel)) out.push(i); });
  return out;
};
const has = (w) => positionsOf(w).length > 0;
const word = pickWord({ world, letter: missing || undefined, maxSyl: p.maxSyl || (level <= 2 ? 2 : 3), minSyl: 2, predicate: has }) || pickWord({ predicate: has, known: null });
const pos = pickOne(positionsOf(word));
const answer = missing || strip(word.w)[pos];

/* Opciones: vocales, o la letra pedida con otras parecidas. */
const similar = { Ñ: ['N', 'M'], QU: ['CU', 'GU'], RR: ['R', 'L'] };
let choices;
if (missing) choices = [answer, ...(similar[missing] || shuffle(VOWELS).slice(0, 2))];
else {
  choices = (p.choices || []).filter((c) => VOWELS.includes(c));
  if (!choices.length) choices = level <= 1 ? [answer, ...shuffle(VOWELS.filter((v) => v !== answer)).slice(0, 2)] : VOWELS.slice();
  if (!choices.includes(answer)) choices = [answer, ...choices.slice(0, 4)];
}
const nameOf = (l) => LETTER_INFO[l]?.name || spoken(l);
const options = shuffle([...new Set(choices)]).map((v) => ({ label: v, kind: 'letter', correct: v === answer, hint: `${spoken(word.w)}. La letra que falta es la ${nameOf(answer)}.` }));

setInstruction(missing ? '¿Qué letra falta?' : '¿Qué vocal falta?', `¿Qué ${missing ? 'letra' : 'vocal'} falta en ${spoken(word.w)}?`);
</script>
