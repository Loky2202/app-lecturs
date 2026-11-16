<template>
  <div v-if="breakState.visible" class="overlay">
    <div class="card center" style="max-width: 460px; width: 100%; align-items: center;">
      <h1>¡Pausa activa!</h1>
      <div class="hero-emoji">{{ breakState.item.e }}</div>
      <p class="lead">{{ breakState.item.t }}</p>
      <div class="timer-ring"><span>{{ breakState.secs }}</span></div>
      <button class="btn big primary" @click="done">¡Listo! 💪</button>
    </div>
  </div>
</template>

<script setup>
import { watch, onBeforeUnmount } from 'vue';
import { breakState, endBreak } from '../lib/break.js';
import { Voice } from '../lib/voice.js';

let timer = null;
watch(() => breakState.visible, (v) => {
  clearInterval(timer);
  if (!v) return;
  Voice.speak(`¡Pausa activa! ${breakState.item.t}`);
  timer = setInterval(() => {
    breakState.secs = Math.max(0, breakState.secs - 1);
    if (breakState.secs === 0) { clearInterval(timer); Voice.speak('¡Listo! Volvemos a leer.'); }
  }, 1000);
});
function done() { clearInterval(timer); endBreak(); }
onBeforeUnmount(() => clearInterval(timer));
</script>
