<template>
  <section class="screen">
    <TopBar title="Juegos" to="/"><span class="badge">Nivel {{ app.level }}</span></TopBar>
    <p class="lead center">Elige tu mundo:</p>
    <div class="worlds">
      <button v-for="w in WORLDS" :key="w.id" class="world" :class="{ active: world === w.id }" :style="{ background: w.color }" @click="world = w.id">
        <span class="we">{{ w.emoji }}</span>{{ w.name }}
      </button>
    </div>
    <button class="btn big primary" @click="play('mix')">🎲 Misión sorpresa (mezcla de juegos)</button>
    <p class="lead center">O elige un juego:</p>
    <div class="menu">
      <button v-for="g in games" :key="g.id" class="menu-btn" :style="{ background: g.locked ? '#9aa5bf' : worldColor }" :disabled="g.locked" @click="play(g.id)">
        <span class="me">{{ g.locked ? '🔒' : g.e }}</span>{{ g.n }}<span class="md">{{ g.locked ? `Desde el nivel ${g.minLevel}` : g.d }}</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import TopBar from '../components/TopBar.vue';
import { useApp } from '../stores/app.js';
import { WORLDS, GAMES, worldById } from '../content/misc.js';

const app = useApp();
const router = useRouter();
const world = ref(app.profile?.favorite || 'dinos');
const worldColor = computed(() => worldById(world.value).color);
const games = computed(() => GAMES.map((g) => ({ ...g, locked: g.minLevel > app.level && !app.settings.freePath })));
const play = (id) => router.push({ name: 'play', params: { game: id }, query: { world: world.value } });
</script>
