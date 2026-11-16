<template>
  <!-- Enseñanza -->
  <section v-if="phase === 'teach'" class="screen">
    <header class="topbar">
      <button class="icon-btn" aria-label="Salir" @click="router.push('/camino')">✖</button>
      <h2>{{ lesson.e }} {{ lesson.n }}</h2>
      <span class="badge">{{ step + 1 }}/{{ lesson.teach.length }}</span>
    </header>
    <Teach :key="step" :screen="lesson.teach[step]" />
    <div class="row" style="margin-top: auto;">
      <button v-if="step > 0" class="btn ghost" @click="step--">⬅ Atrás</button>
      <button class="btn primary big" @click="nextStep">{{ step + 1 < lesson.teach.length ? 'Siguiente ➡' : '¡A practicar! 🚀' }}</button>
    </div>
  </section>

  <!-- Práctica -->
  <Runner v-else-if="phase === 'practice'" :tasks="tasks" :lesson-id="lesson.id" :world="world" @finished="finished" @exit="router.push('/camino')" />

  <!-- Resultado -->
  <ResultCard v-else :result="result" title="¡Lección terminada!">
    <button v-if="nextLesson" class="btn big primary" @click="router.push(nextLesson.kind === 'story' ? `/cuento/${nextLesson.storyId}` : `/leccion/${nextLesson.id}`)">Siguiente lección ➡</button>
    <button class="btn big secondary" @click="router.push('/camino')">Mi camino 🗺️</button>
    <button class="btn ghost" @click="router.push('/')">Inicio 🏠</button>
  </ResultCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Teach from '../components/Teach.vue';
import Runner from '../components/Runner.vue';
import ResultCard from '../components/ResultCard.vue';
import { useApp } from '../stores/app.js';
import { lessonById } from '../content/lessons.js';
import { runBreak } from '../lib/break.js';

const props = defineProps({ id: { type: String, required: true } });
const app = useApp();
const router = useRouter();
const lesson = lessonById(props.id);
const phase = ref('teach');
const step = ref(0);
const result = ref(null);
const started = Date.now();
const world = app.profile?.favorite || null;

if (!lesson || lesson.kind === 'story') router.replace(lesson ? `/cuento/${lesson.storyId}` : '/camino');
const tasks = computed(() => (lesson.practice || []).map((t) => ({ ...t, level: lesson.level, world })));
const nextLesson = computed(() => app.nextLesson());

async function nextStep() {
  if (step.value + 1 < lesson.teach.length) { step.value++; return; }
  phase.value = 'practice';
}
function finished(results) {
  result.value = app.finishActivity({ kind: 'lesson', id: lesson.id, results, world, durationMs: Date.now() - started });
  phase.value = 'result';
}
onMounted(async () => {
  if (lesson && !lesson.teach.length) phase.value = 'practice';
  if (app.breakPending) { await runBreak(); app.breakPending = false; }
});
</script>
