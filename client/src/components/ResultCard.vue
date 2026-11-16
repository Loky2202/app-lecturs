<template>
  <section class="screen" style="justify-content: center;">
    <Confetti />
    <div class="card result">
      <h1>{{ title }}</h1>
      <div class="stars-big"><span v-for="i in 3" :key="i" :class="{ off: i > result.stars }">⭐</span></div>
      <p class="lead">{{ msg }}</p>
      <div v-if="result.levelMsg" class="levelup">🎉 {{ result.levelMsg }}</div>
      <div v-for="t in result.newTrophies" :key="t.id" class="trophy-pop">{{ t.e }} Nuevo logro: {{ t.n }}</div>
      <div v-if="result.unlockedCard" class="unlock">
        <div class="ue">{{ result.unlockedCard.e }}</div>
        <div class="un">¡Nueva tarjeta: {{ result.unlockedCard.n }}!</div>
        <div class="ut">{{ result.unlockedCard.t }}</div>
      </div>
      <div v-else class="unlock">
        <div class="ue">{{ result.world.emoji }}</div>
        <div class="un">¡Álbum de {{ result.world.name }} completo!</div>
      </div>
      <div class="row">
        <slot></slot>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import Confetti from './Confetti.vue';
import { Sfx } from '../lib/sfx.js';
import { Voice } from '../lib/voice.js';

const props = defineProps({ result: { type: Object, required: true }, title: { type: String, default: '¡Misión cumplida!' } });
const msgs = { 3: '¡Perfecto! Todas a la primera.', 2: '¡Muy bien! Casi todas a la primera.', 1: '¡Terminaste! Eso es lo importante.' };
const msg = computed(() => msgs[props.result.stars]);
onMounted(() => {
  Sfx.play('win');
  const r = props.result;
  const say = `${props.title} ${msg.value} ${r.levelMsg || ''} ${r.newTrophies.map((t) => `Nuevo logro: ${t.n}.`).join(' ')} ${r.unlockedCard ? `Nueva tarjeta: ${r.unlockedCard.n}. ${r.unlockedCard.t}` : ''}`;
  setTimeout(() => Voice.speak(say), 300);
});
</script>
