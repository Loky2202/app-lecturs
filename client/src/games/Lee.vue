<template>
  <div class="task">
    <BigWord :word="word.w" :lower="!!p.lower" />
    <OptionGrid :options="options" :cols="3" :ok-speak="`${spoken(word.w)}. ¡Genial!`" @done="(r) => finish(r.firstTry)" />
  </div>
</template>

<script setup>
/* Lee la palabra y toca el dibujo. */
import OptionGrid from '../components/OptionGrid.vue';
import BigWord from '../components/BigWord.vue';
import { useGame } from '../lib/game.js';
import { pickWord, distractors } from '../lib/content.js';
import { shuffle, spoken } from '../lib/utils.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { level, world, setInstruction, finish } = useGame(props, emit);
const p = props.params;
const maxSyl = p.maxSyl || (level <= 2 ? 2 : level <= 4 ? 3 : 5);
const word = pickWord({ letter: p.letter, letters: p.letters, minSyl: p.minSyl, maxSyl, world });
const options = shuffle([word, ...distractors(word, 2, 'e', { world, maxSyl, avoidInitial: p.avoidInitial || level <= 1 })]).map((c) => ({ label: c.e, kind: 'emoji', correct: c.w === word.w, hint: `Dice ${spoken(word.w)}. Busca ${spoken(word.w)}.` }));

setInstruction('Lee la palabra y toca el dibujo.');
</script>
