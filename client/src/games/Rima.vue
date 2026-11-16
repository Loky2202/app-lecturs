<template>
  <div class="task">
    <div class="big-emoji">{{ target.e }}</div>
    <BigWord :word="target.w" />
    <OptionGrid :options="options" :cols="3" :ok-speak="`${spoken(target.w)} y ${spoken(correct.w)}. ¡Riman!`" @done="(r) => finish(r.firstTry)" />
  </div>
</template>

<script setup>
/* ¿Cuál rima? */
import OptionGrid from '../components/OptionGrid.vue';
import BigWord from '../components/BigWord.vue';
import { useGame } from '../lib/game.js';
import { RHYMES } from '../content/rhymes.js';
import { shuffle, pickOne, spoken } from '../lib/utils.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { setInstruction, finish } = useGame(props, emit);

const group = pickOne(RHYMES.filter((g) => g.length >= 2));
const [target, correct] = shuffle(group).slice(0, 2);
const ending = (w) => w.slice(-2);
const others = RHYMES.filter((g) => g !== group).flat().filter((o) => ending(o.w) !== ending(target.w));
const dis = shuffle(others).slice(0, 2);
const choices = shuffle([correct, ...dis]);
const options = choices.map((c) => ({ label: c.w, sub: c.e, kind: 'word', correct: c.w === correct.w, hint: `${spoken(target.w)} rima con ${spoken(correct.w)}.` }));

setInstruction(`¿Cuál rima con ${target.w}?`, `¿Cuál rima con ${spoken(target.w)}? ${choices.map((c) => spoken(c.w)).join(', ')}.`);
</script>
