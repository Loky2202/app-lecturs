<template>
  <div class="task">
    <div class="sentence">{{ s.t }}</div>
    <div class="question">{{ s.q }}</div>
    <OptionGrid :options="options" :cols="3" ok-speak="¡Muy bien! Leíste la frase." @done="(r) => finish(r.firstTry)" />
  </div>
</template>

<script setup>
/* Lee la frase y responde. */
import OptionGrid from '../components/OptionGrid.vue';
import { useGame } from '../lib/game.js';
import { SENTENCES } from '../content/sentences.js';
import { Voice } from '../lib/voice.js';
import { pickOne } from '../lib/utils.js';

const recent = new Set();
const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { level, world, setInstruction, finish } = useGame(props, emit);
const lvl = props.params.lvl || Math.max(4, level);
const avail = SENTENCES.filter((x) => x.lvl <= lvl && !recent.has(x.t));
let pool = avail.filter((x) => x.world === world);
if (!pool.length) pool = avail;
if (!pool.length) { recent.clear(); pool = SENTENCES.filter((x) => x.lvl <= lvl); }
const s = pickOne(pool);
recent.add(s.t);
if (recent.size > 12) recent.delete(recent.values().next().value);
const options = s.o.map((o, i) => ({ label: o, kind: 'emoji', correct: i === s.ans, hint: `${s.t} ${s.q}` }));

const say = setInstruction('Lee la frase y responde.');
// el altavoz lee la frase completa (apoyo), no solo la instrucción
emit('instruction', { text: 'Lee la frase y responde.', say: () => Voice.speak(`${s.t} ${s.q}`) });
void say;
</script>
