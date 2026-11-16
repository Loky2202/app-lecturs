<template>
  <div id="root">
    <router-view v-slot="{ Component }">
      <component :is="Component" :key="$route.fullPath" />
    </router-view>
    <transition name="pop">
      <div v-if="toast.visible" class="feedback" :class="{ bad: toast.bad }">{{ toast.text }}</div>
    </transition>
    <BreakOverlay />
  </div>
</template>

<script setup>
import { toast } from './lib/feedback.js';
import BreakOverlay from './components/BreakOverlay.vue';
</script>
