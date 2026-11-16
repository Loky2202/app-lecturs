<template>
  <section class="screen">
    <header class="topbar">
      <button class="icon-btn" aria-label="Salir" @click="$emit('exit')">✖</button>
      <h2>{{ story.title }}</h2>
      <button class="icon-btn" aria-label="Escuchar" @click="readPage">🔊</button>
    </header>

    <!-- Páginas -->
    <template v-if="page < story.pages.length">
      <div class="story-page">
        <div class="se">{{ story.pages[page].e }}</div>
        <p class="st">
          <span v-for="(w, i) in words" :key="i" class="wd" @click="sayWord(w)">{{ w }} </span>
        </p>
      </div>
      <div class="pager">
        <button class="btn ghost" :disabled="page === 0" @click="go(-1)">⬅ Atrás</button>
        <span class="muted">{{ page + 1 }} / {{ story.pages.length }}</span>
        <button class="btn primary" @click="go(1)">{{ page === story.pages.length - 1 ? 'Preguntas ➡' : 'Siguiente ➡' }}</button>
      </div>
      <p class="small muted center">Toca una palabra para oírla.</p>
    </template>

    <!-- Preguntas -->
    <template v-else>
      <ProgressDots :total="story.questions.length" :index="qi" :results="results" />
      <h2 class="instruction">{{ story.questions[qi].q }}</h2>
      <div class="task">
        <OptionGrid :key="qi" :options="options" :cols="3" ok-speak="¡Muy bien! Entendiste el cuento." @done="answered" />
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import OptionGrid from './OptionGrid.vue';
import ProgressDots from './ProgressDots.vue';
import { Voice } from '../lib/voice.js';
import { useApp } from '../stores/app.js';

const props = defineProps({ story: { type: Object, required: true } });
const emit = defineEmits(['finished', 'exit']);
const app = useApp();
const page = ref(0);
const qi = ref(0);
const results = ref([]);
const start = Date.now();

const words = computed(() => props.story.pages[page.value].t.split(' '));
const options = computed(() => {
  const q = props.story.questions[qi.value];
  return q.o.map((o, i) => ({ label: o, kind: 'emoji', correct: i === q.ans, hint: `${props.story.pages.map((p) => p.t).join(' ')} ${q.q}` }));
});

function readPage() {
  if (page.value < props.story.pages.length) Voice.speak(props.story.pages[page.value].t, { rate: 0.8 });
  else Voice.speak(props.story.questions[qi.value].q);
}
function sayWord(w) { Voice.speak(w.replace(/[.,!¡¿?:]/g, '').toLowerCase()); }
function go(d) { page.value = Math.max(0, page.value + d); }
function answered(r) {
  results.value.push({ game: 'cuento', firstTry: r.firstTry });
  app.recordTask({ game: 'cuento', firstTry: r.firstTry, lessonId: props.story.id, world: props.story.world, durationMs: 0 });
  if (qi.value + 1 >= props.story.questions.length) emit('finished', { results: results.value.slice(), durationMs: Date.now() - start });
  else qi.value++;
}
watch([page, qi], () => { if (app.settings.autoRead && page.value >= props.story.pages.length) setTimeout(readPage, 150); });
onMounted(() => { if (app.settings.autoRead) setTimeout(() => Voice.speak(`${props.story.title}. Lee cada página. Si quieres, toca el altavoz para oírla.`), 200); });
</script>
