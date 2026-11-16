<template><canvas ref="canvas" class="confetti"></canvas></template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { pickOne } from '../lib/utils.js';
const canvas = ref(null);
let raf = null;
onMounted(() => {
  const c = canvas.value;
  const ctx = c.getContext('2d');
  c.width = window.innerWidth; c.height = window.innerHeight;
  const colors = ['#ffb300', '#2962ff', '#43a047', '#e53935', '#8e24aa', '#fb8c00'];
  const parts = Array.from({ length: 120 }, () => ({
    x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.5, r: 5 + Math.random() * 6,
    vy: 2 + Math.random() * 3, vx: -1.5 + Math.random() * 3, col: pickOne(colors), rot: Math.random() * Math.PI,
  }));
  const start = performance.now();
  const frame = (now) => {
    ctx.clearRect(0, 0, c.width, c.height);
    parts.forEach((p) => {
      p.y += p.vy; p.x += p.vx; p.rot += 0.05;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6); ctx.restore();
    });
    if (now - start < 3200) raf = requestAnimationFrame(frame); else ctx.clearRect(0, 0, c.width, c.height);
  };
  raf = requestAnimationFrame(frame);
});
onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>
