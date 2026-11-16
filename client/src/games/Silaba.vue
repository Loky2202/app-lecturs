<template>
  <div class="task">
    <div class="big-emoji">👂</div>
    <button class="btn secondary listen-btn" @click="say">🔊 Escuchar otra vez</button>
    <OptionGrid :options="options" :cols="options.length" :ok-speak="`${spoken(target)}. ¡Muy bien!`" @done="(r) => finish(r.firstTry)" />
  </div>
</template>

<script setup>
/* Escucha la sílaba y tócala. */
import OptionGrid from '../components/OptionGrid.vue';
import { useGame } from '../lib/game.js';
import { syllablesOf, randomConsonant } from '../lib/content.js';
import { consonantsForLevel } from '../content/lessons.js';
import { Voice } from '../lib/voice.js';
import { shuffle, pickOne, spoken } from '../lib/utils.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { level, setInstruction, finish } = useGame(props, emit);
const p = props.params;
const letter = p.letter || randomConsonant(consonantsForLevel(level));
const syls = syllablesOf(letter);
const target = pickOne(syls);
const n = level <= 2 ? 3 : Math.min(5, syls.length);
const choices = shuffle([target, ...shuffle(syls.filter((s) => s !== target)).slice(0, n - 1)]);
const options = choices.map((s) => ({ label: s, kind: 'syllable', correct: s === target, hint: `La sílaba es ${spoken(target)}.` }));

const say = () => Voice.speak(spoken(target), { rate: 0.75 });
setInstruction('Escucha y toca la sílaba.', `Escucha y toca la sílaba: ${spoken(target)}.`);
</script>
