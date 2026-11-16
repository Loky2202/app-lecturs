<template>
  <Runner v-if="phase === 'play'" :key="runKey" :tasks="tasks" :world="world" @finished="finished" @exit="router.push('/juegos')" />
  <ResultCard v-else-if="phase === 'result'" :result="result">
    <button class="btn big primary" @click="again">Otra vez 🔁</button>
    <button class="btn big secondary" @click="router.push('/juegos')">Juegos 🎮</button>
    <button class="btn ghost" @click="router.push('/')">Inicio 🏠</button>
  </ResultCard>
</template>

<script setup>
/* Modo libre: una misión de N tareas de un juego (o mezcla). */
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Runner from '../components/Runner.vue';
import ResultCard from '../components/ResultCard.vue';
import { useApp } from '../stores/app.js';
import { GAMES } from '../content/misc.js';
import { shuffle } from '../lib/utils.js';
import { runBreak } from '../lib/break.js';

const props = defineProps({ game: { type: String, required: true } });
const app = useApp();
const router = useRouter();
const route = useRoute();
const world = route.query.world || app.profile?.favorite || 'dinos';
const phase = ref('loading');
const result = ref(null);
const tasks = ref([]);
const runKey = ref(0);
let started = Date.now();

function buildTasks() {
  const n = Number(app.settings.missionLength) || 5;
  const level = app.level;
  const out = [];
  if (props.game === 'mix') {
    const allowed = GAMES.filter((g) => g.minLevel <= level || app.settings.freePath).map((g) => g.id).filter((g) => g !== 'carrera' && g !== 'traza');
    let bag = shuffle(allowed);
    while (out.length < n) {
      if (!bag.length) bag = shuffle(allowed);
      let t = bag.shift();
      if (out.length && t === out[out.length - 1].game && bag.length) { bag.push(t); t = bag.shift(); }
      out.push({ game: t, level, world });
    }
  } else {
    const count = ['carrera', 'caza', 'memoria', 'traza'].includes(props.game) ? Math.min(n, 3) : n;
    for (let i = 0; i < count; i++) out.push({ game: props.game, level, world });
  }
  return out;
}
async function start() {
  if (app.breakPending) { await runBreak(); app.breakPending = false; }
  tasks.value = buildTasks();
  started = Date.now();
  runKey.value++;
  phase.value = 'play';
}
function finished(results) {
  result.value = app.finishActivity({ kind: 'mission', id: props.game, results, world, durationMs: Date.now() - started });
  phase.value = 'result';
}
function again() { phase.value = 'loading'; start(); }
onMounted(start);
</script>
