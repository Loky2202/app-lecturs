<template>
  <StoryReader v-if="phase === 'read'" :story="story" @finished="finished" @exit="router.push('/cuentos')" />
  <ResultCard v-else :result="result" title="¡Cuento terminado!">
    <button class="btn big primary" @click="router.push('/cuentos')">Más cuentos 📚</button>
    <button class="btn big secondary" @click="router.push('/camino')">Mi camino 🗺️</button>
    <button class="btn ghost" @click="router.push('/')">Inicio 🏠</button>
  </ResultCard>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import StoryReader from '../components/StoryReader.vue';
import ResultCard from '../components/ResultCard.vue';
import { useApp } from '../stores/app.js';
import { STORIES } from '../content/stories.js';
import { runBreak } from '../lib/break.js';

const props = defineProps({ id: { type: String, required: true } });
const app = useApp();
const router = useRouter();
const story = STORIES.find((s) => s.id === props.id);
if (!story) router.replace('/cuentos');
const phase = ref('read');
const result = ref(null);
function finished({ results, durationMs }) {
  result.value = app.finishActivity({ kind: 'story', id: story.id, results, world: story.world, durationMs });
  phase.value = 'result';
}
onMounted(async () => { if (app.breakPending) { await runBreak(); app.breakPending = false; } });
</script>
