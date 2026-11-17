<template>
  <div class="task">
    <div class="big-emoji"><Pic :word="word" /></div>
    <BigWord :word="word.w" />
    <OptionGrid :options="options" :cols="3" :ok-speak="`${spoken(answer)}. ${spoken(word.w)}. ¡Genial!`" @done="(r) => finish(r.firstTry)" />
  </div>
</template>

<script setup>
import Pic from '../components/Pic.vue';
/* ¿Con qué sílaba empieza la palabra? */
import OptionGrid from '../components/OptionGrid.vue';
import BigWord from '../components/BigWord.vue';
import { useGame } from '../lib/game.js';
import { pickWord, syllablesOf, randomConsonant, strip } from '../lib/content.js';
import { consonantsForLevel } from '../content/lessons.js';
import { SYLLABLES } from '../content/words.js';
import { shuffle, spoken } from '../lib/utils.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { level, world, setInstruction, finish } = useGame(props, emit);
const p = props.params;
const letter = p.letter || randomConsonant(consonantsForLevel(level));
const syls = syllablesOf(letter);
const word = pickWord({ letter, world, minSyl: 2, maxSyl: 3, predicate: (w) => syls.includes(strip(w.s[0])) })
  || pickWord({ letter, minSyl: 2, maxSyl: 3 }) || pickWord({ minSyl: 2, maxSyl: 2 });
const answer = word.s[0];
let dis = shuffle(syls.filter((s) => s !== strip(answer))).slice(0, 2);
if (dis.length < 2) {
  const others = Object.values(SYLLABLES).flat().filter((s) => s !== strip(answer) && !dis.includes(s));
  dis = dis.concat(shuffle(others).slice(0, 2 - dis.length));
}
const options = shuffle([answer, ...dis]).map((s) => ({ label: s, kind: 'syllable', correct: s === answer, hint: `${spoken(word.w)} empieza con ${spoken(answer)}.` }));

setInstruction('¿Con qué sílaba empieza?', `¿Con qué sílaba empieza ${spoken(word.w)}?`);
</script>
