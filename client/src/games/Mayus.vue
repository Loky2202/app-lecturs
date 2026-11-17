<template>
  <div class="task">
    <div class="big-letter">{{ shown }}</div>
    <OptionGrid :options="options" :cols="3" :ok-speak="`${name} grande, ${name} pequeña. ¡Muy bien!`" @done="(r) => finish(r.firstTry)" />
  </div>
</template>

<script setup>
/* Une la letra mayúscula con su minúscula (y al revés). */
import OptionGrid from '../components/OptionGrid.vue';
import { useGame } from '../lib/game.js';
import { CASE_LETTERS } from '../content/lessons.js';
import { LETTER_INFO } from '../content/words.js';
import { shuffle, pickOne } from '../lib/utils.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { known, setInstruction, finish } = useGame(props, emit);

const pool = CASE_LETTERS.filter((l) => !known || known.includes(l));
const letter = props.params.letter || pickOne(pool.length >= 3 ? pool : CASE_LETTERS);
const toLower = props.params.toLower ?? Math.random() < 0.6; // se muestra la grande y se busca la pequeña
const name = LETTER_INFO[letter]?.name || letter.toLowerCase();
const shown = toLower ? letter : letter.toLowerCase();

/* Minúsculas que se confunden entre sí. */
const similar = { B: ['D', 'P'], D: ['B', 'P'], P: ['B', 'D'], M: ['N', 'H'], N: ['M', 'H'], U: ['V', 'N'], V: ['U', 'Y'], I: ['L', 'J'], L: ['I', 'T'], J: ['I', 'G'], A: ['E', 'O'], E: ['A', 'C'], O: ['A', 'C'], C: ['O', 'E'], G: ['J', 'Y'], F: ['T', 'E'], T: ['F', 'L'], R: ['N', 'M'], S: ['Z', 'C'], Z: ['S', 'Y'], H: ['N', 'B'], Y: ['V', 'J'], Ñ: ['N', 'M'] };
let dis = (similar[letter] || []).filter((l) => l !== letter && CASE_LETTERS.includes(l));
for (const l of shuffle(CASE_LETTERS)) { if (dis.length >= 2) break; if (l !== letter && !dis.includes(l)) dis.push(l); }
const options = shuffle([letter, ...dis.slice(0, 2)]).map((l) => ({
  label: toLower ? l.toLowerCase() : l, kind: 'letter', correct: l === letter,
  hint: `La ${name} ${toLower ? 'pequeña' : 'grande'} es esta.`,
}));

setInstruction(toLower ? '¿Cuál es la letra pequeña?' : '¿Cuál es la letra grande?', `Esta es la ${name} ${toLower ? 'grande' : 'pequeña'}. ¿Cuál es la ${name} ${toLower ? 'pequeña' : 'grande'}?`);
</script>
