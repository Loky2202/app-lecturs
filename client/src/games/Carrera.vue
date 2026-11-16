<template>
  <div class="task">
    <div class="track">
      <div class="lane"><span class="flag">🏁</span><span class="racer" :style="{ left: pct(me) }">{{ myCar }}</span></div>
      <div class="lane"><span class="flag">🏁</span><span class="racer" :style="{ left: pct(rival) }">🚙</span></div>
    </div>
    <template v-if="!over">
      <BigWord :word="word.w" />
      <OptionGrid :key="round" :options="options" :cols="3" :delay="350" quiet @done="answered" />
    </template>
    <div v-else class="hero-emoji">{{ won ? '🏆' : '💨' }}</div>
  </div>
</template>

<script setup>
/* Carrera de lectura: cada acierto avanza tu carro; el rival avanza solo.
   El rival se adapta al ritmo del niño: frena si va muy adelante y no puede
   ganar hasta que el niño haya leído al menos MIN_ANSWERS palabras. */
import { ref, computed, onBeforeUnmount } from 'vue';
import OptionGrid from '../components/OptionGrid.vue';
import BigWord from '../components/BigWord.vue';
import { useGame } from '../lib/game.js';
import { pickWords, distractors } from '../lib/content.js';
import { Sfx } from '../lib/sfx.js';
import { Voice } from '../lib/voice.js';
import { showFeedback } from '../lib/feedback.js';
import { shuffle, wait } from '../lib/utils.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { level, world, setInstruction, finish } = useGame(props, emit);
const STEPS = 8;
const MIN_ANSWERS = 5;
const maxSyl = props.params.maxSyl || (level <= 3 ? 2 : 3);
const words = pickWords(STEPS, { maxSyl, world });
const myCar = ({ dinos: '🦖', carros: '🏎️', juegos: '🤖', monstruos: '⚡' })[world] || '🏎️';
const me = ref(0); const rival = ref(0); const round = ref(0); const over = ref(false); const won = ref(false);
let correct = 0;
const word = computed(() => words[Math.min(round.value, words.length - 1)]);
const options = computed(() => shuffle([word.value, ...distractors(word.value, 2, 'e', { world, maxSyl })]).map((c) => ({ label: c.e, kind: 'emoji', correct: c.w === word.value.w })));
const pct = (n) => `calc(${(n / STEPS) * 100}% - ${(n / STEPS) * 60}px)`;

const baseMs = Math.max(2200, 3800 - level * 250);
let timer = null;
function tick() {
  if (over.value) return;
  const gap = rival.value - me.value;
  const blocked = rival.value + 1 >= STEPS && me.value < MIN_ANSWERS; // no gana antes de tiempo
  if (!blocked) {
    rival.value++;
    Sfx.play('tick');
    if (rival.value >= STEPS) return end(false);
  }
  // se adapta: frena si va muy adelante, acelera un poco si el niño va muy por delante
  const next = gap >= 2 ? baseMs * 1.5 : gap <= -3 ? baseMs * 0.85 : baseMs;
  timer = setTimeout(tick, next);
}
timer = setTimeout(tick, baseMs);

async function answered(r) {
  if (over.value) return;
  if (r.firstTry) correct++;
  me.value++;
  if (me.value >= STEPS) return end(true);
  round.value++;
}
async function end(w) {
  over.value = true; won.value = w;
  clearTimeout(timer);
  Sfx.play(w ? 'win' : 'bad');
  showFeedback(w ? '¡Ganaste la carrera!' : 'Casi. El rival ganó esta vez.', !w);
  Voice.speak(w ? '¡Ganaste la carrera! Eres muy rápido leyendo.' : 'Casi. El rival ganó esta vez. La próxima será tuya.');
  await wait(1600);
  finish(w, { score: correct });
}
onBeforeUnmount(() => clearTimeout(timer));
setInstruction('¡Lee rápido y toca el dibujo para avanzar!', 'Carrera de lectura. Lee la palabra y toca el dibujo para que tu carro avance. ¡Ya!');
</script>
