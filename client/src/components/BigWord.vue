<template>
  <div class="big-word">
    <template v-for="(p, i) in pieces" :key="i">
      <span v-if="p.blank" class="blank">{{ '_'.repeat(p.len) }}</span>
      <span v-else :class="{ hl: p.hl }">{{ p.ch }}</span>
    </template>
  </div>
</template>

<script setup>
/* Palabra grande con un hueco opcional (blank = índice, blankLen = letras ocultas). */
import { computed } from 'vue';
const props = defineProps({ word: { type: String, required: true }, blank: { type: Number, default: -1 }, blankLen: { type: Number, default: 1 }, highlight: { type: Array, default: () => [] }, lower: { type: Boolean, default: false } });
const pieces = computed(() => {
  const out = [];
  const chars = [...(props.lower ? props.word.toLowerCase() : props.word)];
  const blankLen = Math.max(1, props.blankLen);
  for (let i = 0; i < chars.length; i++) {
    if (props.blank >= 0 && i === props.blank) { out.push({ blank: true, len: blankLen }); i += blankLen - 1; continue; }
    out.push({ ch: chars[i], hl: props.highlight.includes(i) });
  }
  return out;
});
</script>
