<template>
  <section class="screen">
    <TopBar title="Mi camino" to="/"><span class="badge">{{ app.lessonsDone }}/{{ app.totalLessons }}</span></TopBar>
    <div v-for="u in UNITS" :key="u.id" class="card unit" :style="{ '--unit': u.color }">
      <div class="unit-head">
        <span class="ue">{{ u.e }}</span>
        <div class="grow">
          <h3 style="margin:0">{{ u.n }}</h3>
          <div class="unit-bar"><i :style="{ width: unitPct(u) + '%' }"></i></div>
        </div>
        <span class="badge">{{ unitDone(u) }}/{{ u.lessons.length }}</span>
      </div>
      <div class="lessons">
        <button v-for="l in u.lessons" :key="l.id" class="lesson-btn" :class="cls(l)" :disabled="!app.isLessonUnlocked(l.id)" @click="open(l)">
          <span class="le">{{ app.isLessonUnlocked(l.id) ? l.e : '🔒' }}</span>
          <span>{{ l.n }}</span>
          <span class="ls">{{ stars(l) }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';
import TopBar from '../components/TopBar.vue';
import { useApp } from '../stores/app.js';
import { UNITS } from '../content/lessons.js';

const app = useApp();
const router = useRouter();
const next = app.nextLesson();
const unitDone = (u) => u.lessons.filter((l) => app.lessonState(l.id).done).length;
const unitPct = (u) => Math.round((unitDone(u) / u.lessons.length) * 100);
const stars = (l) => { const s = app.lessonState(l.id); return s.done ? '⭐'.repeat(s.stars) : ''; };
const cls = (l) => ({ done: app.lessonState(l.id).done, next: next && next.id === l.id, locked: !app.isLessonUnlocked(l.id) });
const open = (l) => router.push(l.kind === 'story' ? `/cuento/${l.storyId}` : `/leccion/${l.id}`);
</script>
