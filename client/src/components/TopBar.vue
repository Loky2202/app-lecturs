<template>
  <header class="topbar">
    <button class="icon-btn" :aria-label="backLabel" @click="goBack">{{ backIcon }}</button>
    <h2>{{ title }}</h2>
    <slot><span style="width:54px"></span></slot>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
const props = defineProps({ title: { type: String, default: '' }, to: { type: [String, Object], default: '/' }, backIcon: { type: String, default: '⬅' }, backLabel: { type: String, default: 'Volver' }, confirm: { type: String, default: '' } });
const emit = defineEmits(['back']);
const router = useRouter();
function goBack() {
  if (props.confirm && !window.confirm(props.confirm)) return;
  emit('back');
  router.push(props.to);
}
</script>
