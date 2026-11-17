<template>
  <div class="task">
    <div class="big-letter" style="font-size: 2.6rem;">{{ letter }} <small style="font-size: 2rem;">{{ letter.toLowerCase() }}</small></div>
    <div ref="wrap" class="trace-wrap">
      <canvas ref="guide"></canvas>
      <canvas ref="draw" @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up" @pointerleave="up"></canvas>
    </div>
    <div class="row">
      <button class="btn ghost" @click="clear">🧽 Borrar</button>
      <button class="btn secondary" @click="sayIt">🔊 Escuchar</button>
      <button class="btn primary big" @click="check">¡Listo! ✅</button>
    </div>
  </div>
</template>

<script setup>
/* Traza la letra con el dedo sobre la guía. */
import { ref, onMounted } from 'vue';
import { useGame } from '../lib/game.js';
import { Voice } from '../lib/voice.js';
import { showFeedback } from '../lib/feedback.js';
import { pickOne, wait, spoken } from '../lib/utils.js';
import { LETTER_INFO } from '../content/words.js';

const props = defineProps({ params: { type: Object, default: () => ({}) } });
const emit = defineEmits(['instruction', 'done']);
const { setInstruction, finish, good, letters } = useGame(props, emit);
const letter = props.params.letter || pickOne(letters);
const info = LETTER_INFO[letter] || { name: spoken(letter) };

const wrap = ref(null); const guide = ref(null); const draw = ref(null);
const SIZE = 320;
let ctx = null; let drawing = false; let attempts = 0; let strokes = 0;

onMounted(() => {
  [guide.value, draw.value].forEach((c) => { c.width = SIZE; c.height = SIZE; });
  const g = guide.value.getContext('2d');
  g.fillStyle = '#d7deea';
  g.font = `bold ${letter.length > 1 ? 150 : 240}px ${getComputedStyle(document.body).fontFamily}`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(letter, SIZE / 2, SIZE / 2 + 10);
  // flecha de inicio
  g.fillStyle = '#2962ff'; g.font = '28px sans-serif'; g.fillText('👉', 34, 50);
  ctx = draw.value.getContext('2d');
  ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#2962ff';
});

const pt = (e) => { const r = draw.value.getBoundingClientRect(); return { x: (e.clientX - r.left) * SIZE / r.width, y: (e.clientY - r.top) * SIZE / r.height }; };
function down(e) { drawing = true; strokes++; draw.value.setPointerCapture?.(e.pointerId); const p = pt(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 0.1, p.y + 0.1); ctx.stroke(); }
function move(e) { if (!drawing) return; const p = pt(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }
function up() { drawing = false; }
function clear() { ctx.clearRect(0, 0, SIZE, SIZE); strokes = 0; }
function sayIt() { Voice.speak(`La letra ${info.name}. ${info.tip || ''}`, { rec: `l:${letter}` }); }

function coverage() {
  const g = guide.value.getContext('2d').getImageData(0, 0, SIZE, SIZE).data;
  const d = ctx.getImageData(0, 0, SIZE, SIZE).data;
  let total = 0; let hit = 0; let outside = 0; let drawn = 0;
  for (let i = 3; i < g.length; i += 16) { // muestreo
    const onLetter = g[i] > 0 && g[i - 3] === 0xd7; // píxeles grises de la guía
    const isDrawn = d[i] > 0;
    if (onLetter) { total++; if (isDrawn) hit++; }
    if (isDrawn) { drawn++; if (!onLetter) outside++; }
  }
  return { ratio: total ? hit / total : 0, outside: drawn ? outside / drawn : 0, drawn };
}

async function check() {
  attempts++;
  const c = coverage();
  const ok = c.drawn > 0 && (c.ratio >= 0.45 || (attempts >= 2 && c.ratio >= 0.25) || attempts >= 3);
  if (ok) {
    good(`¡Muy bien! Trazaste la ${info.name}.`);
    await wait(1100);
    finish(attempts === 1 && c.ratio >= 0.45, { great: attempts === 1 && c.ratio >= 0.8 });
  } else {
    showFeedback(c.drawn === 0 ? 'Dibuja sobre la letra.' : 'Cubre toda la letra.', true);
    Voice.speak(c.drawn === 0 ? 'Pasa el dedo por encima de la letra.' : 'Casi. Pasa el dedo por toda la letra gris.');
  }
}
setInstruction(`Traza la letra ${letter}`, `Traza la letra ${info.name} con el dedo, siguiendo la letra gris.`);
</script>
