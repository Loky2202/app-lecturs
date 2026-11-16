<template>
  <section class="screen">
    <TopBar title="Mi álbum" to="/"><span class="badge">⭐ {{ app.progress.stars }}</span></TopBar>
    <div class="tabs">
      <button v-for="w in WORLDS" :key="w.id" class="tab" :class="{ active: tab === w.id }" @click="tab = w.id">{{ w.emoji }} {{ w.name }}</button>
    </div>
    <div class="album-grid">
      <div v-for="(c, i) in world.cards" :key="i" class="acard" :class="{ locked: i >= owned }" @click="i < owned && Voice.speak(`${c.n}. ${c.t}`)">
        <div class="ae">{{ i < owned ? c.e : '❓' }}</div>
        <div class="an">{{ i < owned ? c.n : `Tarjeta ${i + 1}` }}</div>
        <div v-if="i < owned" class="at">{{ c.t }}</div>
      </div>
    </div>
    <p class="small muted center">Cada lección, misión o cuento terminado te da una tarjeta de tu mundo.</p>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import TopBar from '../components/TopBar.vue';
import { useApp } from '../stores/app.js';
import { WORLDS, worldById } from '../content/misc.js';
import { Voice } from '../lib/voice.js';
const app = useApp();
const tab = ref(app.profile?.favorite || 'dinos');
const world = computed(() => worldById(tab.value));
const owned = computed(() => app.progress.cards[tab.value] || 0);
</script>
