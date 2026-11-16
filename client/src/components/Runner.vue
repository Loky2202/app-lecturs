<template>
  <section class="screen">
    <header class="topbar">
      <button class="icon-btn" aria-label="Salir" @click="exit">✖</button>
      <ProgressDots :total="tasks.length" :index="index" :results="results" />
      <button class="icon-btn" aria-label="Escuchar de nuevo" @click="speak">🔊</button>
    </header>
    <div class="task-wrap">
      <h2 class="instruction">{{ instruction }}</h2>
      <component :is="current" v-if="current" :key="index" :params="tasks[index]" @instruction="onInstruction" @done="onDone" />
    </div>
  </section>
</template>

<script setup>
/* Ejecuta una secuencia de tareas (juegos) y devuelve los resultados. */
import { ref, computed } from 'vue';
import ProgressDots from './ProgressDots.vue';
import { GAME_COMPONENTS } from '../games/index.js';
import { useApp } from '../stores/app.js';
import { Voice } from '../lib/voice.js';

const props = defineProps({ tasks: { type: Array, required: true }, lessonId: { type: String, default: null }, world: { type: String, default: null } });
const emit = defineEmits(['finished', 'exit']);
const app = useApp();
const index = ref(0);
const results = ref([]);
const instruction = ref('');
let say = null;

const current = computed(() => GAME_COMPONENTS[props.tasks[index.value]?.game] || null);

function onInstruction({ text, say: s }) { instruction.value = text; say = s; }
function speak() { if (say) say(); }
function onDone(r) {
  const task = props.tasks[index.value];
  const res = { game: task.game, firstTry: r.firstTry, durationMs: r.durationMs, score: r.score };
  results.value.push(res);
  app.recordTask({ game: task.game, firstTry: r.firstTry, lessonId: props.lessonId, world: props.world || task.world, durationMs: r.durationMs });
  Voice.stop();
  if (index.value + 1 >= props.tasks.length) {
    emit('finished', results.value.slice());
  } else {
    index.value++;
  }
}
function exit() {
  if (window.confirm('¿Salir? Se perderá el progreso de esta actividad.')) { Voice.stop(); emit('exit'); }
}
</script>
