<template>
  <section class="screen">
    <TopBar title="Logros" to="/"><span class="badge">🏅 {{ count }}/{{ TROPHIES.length }}</span></TopBar>
    <div class="album-grid">
      <div v-for="t in TROPHIES" :key="t.id" class="acard" :class="{ locked: !app.progress.trophies[t.id] }" @click="Voice.speak(`${t.n}. ${t.t}`)">
        <div class="ae">{{ t.e }}</div>
        <div class="an">{{ t.n }}</div>
        <div class="at">{{ t.t }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import TopBar from '../components/TopBar.vue';
import { useApp } from '../stores/app.js';
import { TROPHIES } from '../content/misc.js';
import { Voice } from '../lib/voice.js';
const app = useApp();
const count = computed(() => Object.keys(app.progress.trophies).length);
</script>
