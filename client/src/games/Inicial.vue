<template>
  <div class="task">
    <div class="big-emoji"><Pic :word="word" /></div>
    <BigWord :word="word.w" :blank="0" :blank-len="answer.length" />
    <OptionGrid :options="options" :cols="3" :ok-speak="`${spoken(word.w)}. ¡Eso es!`" @done="(r) => finish(r.firstTry)" />
  </div>
</template>

<script setup>
import Pic from '../components/Pic.vue';
/* ¿Con qué letra empieza? */
import OptionGrid from '../components/OptionGrid.vue';
import BigWord from '../components/BigWord.vue';
import { useGame } from '../lib/game.js';
import { pickWord, strip } from '../lib/content.js';
import { ALL_LETTERS, LETTER_INFO } from '../content/words.js';
import { shuffle, pickOne, spoken } from '../lib/utils.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { level, world, setInstruction, finish, letters } = useGame(props, emit);
const p = props.params;
const DIGRAPHS = ['CH', 'LL', 'QU'];
const isDigraphLesson = p.letter && p.letter.length === 2;

const ok = (w) => (isDigraphLesson ? strip(w.w).startsWith(p.letter) : !DIGRAPHS.some((d) => strip(w.w).startsWith(d)) && !/^RR/.test(w.w));
const word = pickWord({ letter: p.letter, letters: p.letters, world, maxSyl: p.maxSyl || 3, predicate: ok }) || pickWord({ predicate: ok });
const answer = isDigraphLesson ? p.letter : strip(word.w)[0];

const similar = { B: ['D', 'P'], D: ['B', 'P'], P: ['B', 'Q'], M: ['N', 'W'], N: ['M', 'H'], C: ['G', 'O'], G: ['C', 'Q'], R: ['P', 'B'], T: ['F', 'L'], F: ['T', 'E'], V: ['B', 'U'], S: ['Z', 'C'], Z: ['S', 'C'], H: ['N', 'M'], L: ['T', 'I'], J: ['I', 'L'], E: ['F', 'A'], A: ['E', 'O'], O: ['C', 'U'], U: ['V', 'O'], I: ['L', 'J'], Ñ: ['N', 'M'], Y: ['V', 'I'] };
let pool = (p.choices && p.choices.length >= 3 ? p.choices : letters.length >= 3 ? letters : ALL_LETTERS).filter((l) => l !== answer);
if (isDigraphLesson) pool = DIGRAPHS.filter((d) => d !== answer).concat(pool);
let dis = [];
if (level >= 3 && !isDigraphLesson && similar[answer]) dis = similar[answer].filter((l) => pool.includes(l));
for (const l of shuffle(pool)) { if (dis.length >= 2) break; if (!dis.includes(l)) dis.push(l); }
while (dis.length < 2) { const l = pickOne(ALL_LETTERS); if (l !== answer && !dis.includes(l)) dis.push(l); }
const nameOf = (l) => LETTER_INFO[l]?.name || spoken(l);
const options = shuffle([answer, ...dis.slice(0, 2)]).map((l) => ({ label: l, kind: 'letter', correct: l === answer, hint: `${spoken(word.w)} empieza con la ${nameOf(answer)}.` }));

setInstruction('¿Con qué letra empieza?', `¿Con qué letra empieza ${spoken(word.w)}?`);
</script>
