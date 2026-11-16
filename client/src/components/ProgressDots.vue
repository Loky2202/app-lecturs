<template>
  <div class="progress" aria-label="Progreso">
    <div v-for="(r, i) in slots" :key="i" class="dot" :class="r">{{ r === 'star' ? '⭐' : r === 'done' ? '✓' : '' }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({ total: { type: Number, required: true }, index: { type: Number, required: true }, results: { type: Array, default: () => [] } });
const slots = computed(() => Array.from({ length: props.total }, (_, i) => {
  const r = props.results[i];
  if (r) return r.firstTry ? 'star' : 'done';
  return i === props.index ? 'current' : '';
}));
</script>
