<template>
  <section class="screen">
    <TopBar title="Cuentos" to="/" />
    <p class="lead center">Elige un cuento para leer.</p>
    <div class="story-list">
      <button v-for="s in STORIES" :key="s.id" class="story-card" @click="router.push(`/cuento/${s.id}`)">
        <span class="se">{{ s.emoji }}</span>{{ s.title }}
        <span class="small muted">{{ s.pages.length }} páginas · nivel {{ s.lvl }}</span>
        <span class="small">{{ done(s) }}</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';
import TopBar from '../components/TopBar.vue';
import { useApp } from '../stores/app.js';
import { STORIES } from '../content/stories.js';
const app = useApp();
const router = useRouter();
const done = (s) => { const st = app.progress.stories[s.id]; return st?.done ? '⭐'.repeat(st.stars) : 'Sin leer'; };
</script>
