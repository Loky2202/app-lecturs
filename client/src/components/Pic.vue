<template>
  <img v-if="word?.img" :src="word.img" :alt="word.w" class="pic" draggable="false">
  <template v-else>{{ word?.e }}</template>
</template>

<script setup>
/* Dibujo de una palabra: la foto subida por los padres o, si no hay, su emoji. */
defineProps({ word: { type: Object, default: null } });
</script>
