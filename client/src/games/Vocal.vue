<template>
  <div class="task">
    <div class="big-emoji"><Pic :w="word" /></div>
    <BigWord :word="word.w" :blank="pos" />
    <OptionGrid :options="options" :ok-speak="`${spoken(word.w)}. ¡Muy bien!`" @done="(r) => finish(r.firstTry)" />
  </div>
</template>

<script setup>
/* ¿Qué vocal falta? */
import Pic from '../components/Pic.vue';
import OptionGrid from '../components/OptionGrid.vue';
import BigWord from '../components/BigWord.vue';
import { useGame } from '../lib/game.js';
import { pickWord, strip } from '../lib/content.js';
import { VOWELS } from '../content/words.js';
import { shuffle, pickOne, spoken } from '../lib/utils.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { level, world, setInstruction, finish } = useGame(props, emit);
const p = props.params;
const vowel = p.letter && VOWELS.includes(p.letter) ? p.letter : null;

const hasVowel = (w) => [...strip(w.w)].some((c, i) => i > 0 && VOWELS.includes(c) && (!vowel || c === vowel));
const word = pickWord({ world, maxSyl: p.maxSyl || (level <= 2 ? 2 : 3), minSyl: 2, predicate: hasVowel }) || pickWord({ predicate: hasVowel });
const positions = [...strip(word.w)].map((c, i) => (i > 0 && VOWELS.includes(c) && (!vowel || c === vowel) ? i : -1)).filter((i) => i >= 0);
const pos = pickOne(positions);
const answer = strip(word.w)[pos];

let choices = (p.choices || []).filter((c) => VOWELS.includes(c));
if (!choices.length) choices = level <= 1 ? [answer, ...shuffle(VOWELS.filter((v) => v !== answer)).slice(0, 2)] : VOWELS.slice();
if (!choices.includes(answer)) choices = [answer, ...choices.slice(0, 4)];
const options = shuffle([...new Set(choices)]).map((v) => ({ label: v, kind: 'letter', correct: v === answer, hint: `${spoken(word.w)}. La vocal que falta es la ${spoken(v === answer ? v : answer)}.` }));

setInstruction('¿Qué vocal falta?', `¿Qué vocal falta en ${spoken(word.w)}?`);
</script>
