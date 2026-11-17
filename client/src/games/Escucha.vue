<template>
  <div class="task">
    <button class="btn secondary listen-btn" @click="say">🔊 Escuchar otra vez</button>
    <OptionGrid :options="options" :cols="3" :ok-speak="`${spoken(word.w)}. ¡Súper!`" @done="(r) => finish(r.firstTry)" />
  </div>
</template>

<script setup>
/* Escucha la palabra y toca la escrita. */
import OptionGrid from '../components/OptionGrid.vue';
import { useGame } from '../lib/game.js';
import { pickWord, filterWords, strip } from '../lib/content.js';
import { Voice } from '../lib/voice.js';
import { shuffle, spoken, takeDistinct } from '../lib/utils.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { level, world, setInstruction, finish } = useGame(props, emit);
const p = props.params;
const maxSyl = p.maxSyl || (level <= 2 ? 2 : level <= 4 ? 3 : 5);
const word = pickWord({ letter: p.letter, letters: p.letters, minSyl: p.minSyl, maxSyl, world });
let pool = filterWords({ maxSyl: Math.max(maxSyl, 2) }).filter((w) => w.w !== word.w);
if (level >= 3) {
  const hard = pool.filter((w) => strip(w.w)[0] === strip(word.w)[0] || Math.abs(w.w.length - word.w.length) <= 1);
  if (hard.length >= 2) pool = hard;
}
const dis = takeDistinct(pool, 2, (w) => w.w, new Set([word.w]));
const options = shuffle([word, ...dis]).map((c) => ({ label: p.lower ? c.w.toLowerCase() : c.w, kind: 'word', correct: c.w === word.w, hint: `${spoken(word.w)}. Empieza con ${spoken(strip(word.w)[0])}.` }));

const say = () => Voice.speak(spoken(word.w));
setInstruction('Escucha y toca la palabra.', `Escucha y toca la palabra: ${spoken(word.w)}.`);
</script>
