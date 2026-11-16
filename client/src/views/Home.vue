<template>
  <section class="screen">
    <header class="topbar">
      <button class="icon-btn" aria-label="Cambiar de niño" title="Cambiar de niño" @click="switchProfile">{{ app.profile.avatar }}</button>
      <div class="badges">
        <span class="badge">Nivel <b>{{ app.level }}</b></span>
        <span class="badge">⭐ <b>{{ app.progress.stars }}</b></span>
        <span class="badge">🔥 <b>{{ app.streak }}</b></span>
      </div>
    </header>

    <div class="card home-hero">
      <div class="mascot" @click="talk">{{ app.mascot.emoji }}</div>
      <div class="grow">
        <h1 style="font-size: 1.6rem;">¡Hola, {{ app.profile.name }}!</h1>
        <p class="muted small">{{ mascotText }}</p>
      </div>
      <div class="goal-ring" :style="ringStyle"><span>{{ app.today.activities }}/{{ app.settings.dailyGoal }}<br>hoy</span></div>
    </div>

    <button v-if="next" class="btn big primary" @click="go(`/leccion/${next.id}`)">▶ Siguiente lección: {{ next.e }} {{ next.n }}</button>
    <button v-else class="btn big ok" @click="go('/juegos')">🏆 ¡Camino completo! A jugar</button>

    <div class="menu">
      <button class="menu-btn" style="background:#2962ff" @click="go('/camino')"><span class="me">🗺️</span>Mi camino<span class="md">{{ app.lessonsDone }}/{{ app.totalLessons }} lecciones</span></button>
      <button class="menu-btn" style="background:#8e24aa" @click="go('/juegos')"><span class="me">🎮</span>Juegos<span class="md">Modo libre</span></button>
      <button class="menu-btn" style="background:#00897b" @click="go('/cuentos')"><span class="me">📚</span>Cuentos<span class="md">Lee y responde</span></button>
      <button class="menu-btn" style="background:#fb8c00" @click="go('/album')"><span class="me">📒</span>Mi álbum<span class="md">{{ cardsTotal }} tarjetas</span></button>
    </div>
    <div class="row">
      <router-link class="btn ghost" to="/logros">🏅 Logros</router-link>
      <router-link class="btn ghost" to="/padres">👨‍👩‍👧 Padres</router-link>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useApp, MASCOT_STEPS } from '../stores/app.js';
import { Voice } from '../lib/voice.js';
import { WORLDS } from '../content/misc.js';

const app = useApp();
const router = useRouter();
const next = computed(() => app.nextLesson());
const cardsTotal = computed(() => WORLDS.reduce((a, w) => a + (app.progress.cards[w.id] || 0), 0));
const ringStyle = computed(() => ({ background: `conic-gradient(#43a047 ${app.dailyGoalRatio * 360}deg, #e8edf7 0)` }));
const mascotText = computed(() => {
  const m = app.mascot;
  if (m.next === undefined) return `${m.emoji} Tu mascota ya creció del todo. ¡Eres un gran lector!`;
  return `Tu mascota crece con tus estrellas. Faltan ${m.next - app.progress.stars} para la siguiente forma.`;
});
function talk() {
  const m = app.mascot;
  Voice.speak(app.today.activities >= app.settings.dailyGoal ? `¡Ya cumpliste tu meta de hoy, ${app.profile.name}! Puedes seguir jugando si quieres.` : `Hola, ${app.profile.name}. Hoy llevas ${app.today.activities} de ${app.settings.dailyGoal} actividades. ¡Vamos!`);
  void MASCOT_STEPS; void m;
}
function go(path) { router.push(path); }
function switchProfile() { app.logout(); router.push('/perfiles'); }
</script>
