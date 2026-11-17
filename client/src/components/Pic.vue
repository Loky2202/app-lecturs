<template>
  <img v-if="src" class="pic-img" :src="src" :alt="w.w" draggable="false"><template v-else>{{ icon }}</template>
</template>

<script setup>
/* Dibujo de una palabra: la imagen cargada por los padres o, si no hay, su icono. */
import { computed } from 'vue';
import { imageUrl, iconFor } from '../lib/media.js';
const props = defineProps({ w: { type: Object, required: true } }); // { w: 'GATO', e: '🐱' }
const src = computed(() => imageUrl(props.w.w));
const icon = computed(() => iconFor(props.w.w, props.w.e));
</script>
