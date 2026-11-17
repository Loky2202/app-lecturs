<template>
  <div class="task">
    <div class="memory" :class="`pairs-${pairs}`" :style="{ '--mcolor': worldColor }">
      <button v-for="(c, i) in cards" :key="i" class="mcard" :class="[c.kind, c.state]" @click="flip(i)">
        <span class="back">❓</span><span class="face"><template v-if="c.kind === 'word'">{{ c.w.w }}</template><Pic v-else :w="c.w" /></span>
      </button>
    </div>
  </div>
</template>

<script setup>
/* Memoria: palabra ↔ dibujo. */
import { reactive } from 'vue';
import { useGame } from '../lib/game.js';
import { pickWords } from '../lib/content.js';
import { worldById } from '../content/misc.js';
import Pic from '../components/Pic.vue';
import { Voice } from '../lib/voice.js';
import { Sfx } from '../lib/sfx.js';
import { shuffle, spoken, wait } from '../lib/utils.js';
import { showFeedback, praise } from '../lib/feedback.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { level, world, setInstruction, finish } = useGame(props, emit);
const worldColor = worldById(world || 'dinos').color;
const p = props.params;
const pairs = p.pairs || (level >= 4 ? 4 : 3);
const seen = new Set();
const words = pickWords(pairs + 6, { letters: p.letters, minSyl: p.minSyl, maxSyl: p.maxSyl || 3, world }).filter((w) => { if (seen.has(w.e)) return false; seen.add(w.e); return true; }).slice(0, pairs);
const cards = reactive(shuffle(words.flatMap((w) => [{ w, kind: 'word', state: '' }, { w, kind: 'emoji', state: '' }])));
let up = [];
let matched = 0;
let misses = 0;
let busy = false;

async function flip(i) {
  const c = cards[i];
  if (busy || c.state === 'up' || c.state === 'matched') return;
  Sfx.play('tap');
  c.state = 'up';
  up.push(c);
  if (up.length < 2) return;
  busy = true;
  const [a, b] = up;
  if (a.w.w === b.w.w && a.kind !== b.kind) {
    a.state = b.state = 'matched';
    matched++;
    Sfx.play('ok');
    Voice.speak(spoken(a.w.w));
    up = []; busy = false;
    if (matched === pairs) {
      showFeedback(praise());
      await wait(1100);
      finish(misses <= pairs - 1, { perfect: misses === 0 });
    }
  } else {
    misses++;
    Sfx.play('bad');
    a.state = b.state = 'up bad';
    await wait(800);
    a.state = b.state = '';
    up = []; busy = false;
  }
}
setInstruction('Encuentra las parejas: palabra y dibujo.');
</script>
