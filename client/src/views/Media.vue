<template>
  <section class="screen">
    <TopBar title="Imágenes y voces" to="/padres" />

    <div class="tabs">
      <button v-for="t in TABS" :key="t.id" class="tab" :class="{ active: tab === t.id }" @click="setTab(t.id)">{{ t.n }}</button>
    </div>

    <!-- Editor del elemento elegido -->
    <div v-if="sel" class="card media-editor">
      <div class="media-head">
        <span class="media-pic"><Pic v-if="tab === 'words'" :w="sel" /><template v-else>{{ sel.w }}</template></span>
        <div class="grow">
          <h3 style="margin:0">{{ sel.w }}</h3>
          <p class="small muted">{{ help }}</p>
        </div>
        <button class="icon-btn" aria-label="Cerrar" @click="sel = null">✖</button>
      </div>

      <template v-if="tab === 'words'">
        <h4>Dibujo</h4>
        <div class="row media-row">
          <label class="btn secondary">📷 {{ hasImage ? 'Cambiar imagen' : 'Cargar imagen' }}
            <input type="file" accept="image/*" hidden @change="pickImage">
          </label>
          <button v-if="hasImage" class="btn danger" @click="remove('image', sel.w)">Quitar imagen</button>
        </div>
        <label class="setting"><span>Icono (se usa si no hay imagen)</span>
          <input v-model="iconDraft" type="text" maxlength="16" :placeholder="sel.e" aria-label="Icono" @change="saveIconDraft">
        </label>
        <button v-if="media.icon[sel.w]" class="btn ghost" @click="remove('icon', sel.w)">Volver al icono original {{ sel.e }}</button>
      </template>

      <h4>Voz</h4>
      <div class="row media-row">
        <button v-if="canRecord" class="btn" :class="recording ? 'danger' : 'primary'" @click="toggleRecord">{{ recording ? `⏹ Detener (${seconds}s)` : '🎙️ Grabar' }}</button>
        <label class="btn secondary">📁 Subir audio
          <input type="file" accept="audio/*" hidden @change="pickAudio">
        </label>
        <button class="btn ghost" @click="listen">▶ Escuchar</button>
        <button v-if="hasAudio" class="btn danger" @click="remove('audio', audioKey)">Quitar grabación</button>
      </div>
      <p class="small muted">{{ hasAudio ? 'Se usa tu grabación.' : 'Sin grabación: se usa la voz del dispositivo.' }}</p>
      <p v-if="!canRecord" class="small muted">Este navegador solo deja grabar con el micrófono en una conexión segura (https o localhost). Puedes grabar con la app de grabadora del dispositivo y usar «Subir audio».</p>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="busy" class="small muted">Guardando…</p>
    </div>

    <template v-if="tab === 'words'">
      <input v-model="search" type="text" placeholder="Buscar palabra…" aria-label="Buscar palabra">
      <label class="setting"><span>Solo las que ya cambié</span><input v-model="onlyMine" type="checkbox"></label>
    </template>

    <div class="media-grid">
      <button v-for="it in visible" :key="it.w" class="media-item" :class="{ active: sel && sel.w === it.w }" @click="choose(it)">
        <span class="mi-pic"><Pic v-if="tab === 'words'" :w="it" /><template v-else>{{ it.w }}</template></span>
        <span v-if="tab === 'words'" class="mi-name">{{ it.w }}</span>
        <span class="mi-tags">{{ tags(it) }}</span>
      </button>
    </div>
    <p v-if="!visible.length" class="muted center">No hay resultados.</p>
  </section>
</template>

<script setup>
/* Zona de padres: imagen e icono de cada palabra, y grabaciones de palabras, letras y sílabas. */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import TopBar from '../components/TopBar.vue';
import Pic from '../components/Pic.vue';
import { api } from '../api.js';
import { useApp } from '../stores/app.js';
import { allWords, strip } from '../lib/content.js';
import { media, loadMedia, saveMedia, saveIcon, removeMedia, audioUrl } from '../lib/media.js';
import { Voice } from '../lib/voice.js';
import { RHYMES } from '../content/rhymes.js';
import { LETTER_INFO, SYLLABLES } from '../content/words.js';

const TABS = [{ id: 'words', n: '🖼️ Palabras', p: 'w' }, { id: 'letters', n: '🔤 Letras', p: 'l' }, { id: 'syllables', n: '🧩 Sílabas', p: 's' }];
const MAX_SECONDS = 8;
const MAX_AUDIO = 2 * 1024 * 1024;
const router = useRouter();
const app = useApp();
const tab = ref('words');
const sel = ref(null);
const search = ref('');
const onlyMine = ref(false);
const iconDraft = ref('');
const error = ref('');
const busy = ref(false);
const recording = ref(false);
const seconds = ref(0);
const canRecord = !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
let recorder = null;
let ticker = null;

const prefix = computed(() => TABS.find((t) => t.id === tab.value).p);
const audioKey = computed(() => (sel.value ? `${prefix.value}:${sel.value.w}` : ''));
const hasImage = computed(() => !!(sel.value && media.image[sel.value.w]));
const hasAudio = computed(() => !!media.audio[audioKey.value]);
const help = computed(() => ({
  words: 'Así se ve y se oye esta palabra en las lecciones y los juegos.',
  letters: 'Graba cómo se llama y cómo suena la letra. Se oye al enseñarla y al trazarla.',
  syllables: 'Graba la sílaba. Se oye en las lecciones y en «Escucha la sílaba».',
})[tab.value]);

const words = computed(() => {
  const seen = new Set();
  const out = [];
  for (const w of allWords().concat(RHYMES.flat())) { if (!seen.has(w.w)) { seen.add(w.w); out.push({ w: w.w, e: w.e }); } }
  return out.sort((a, b) => a.w.localeCompare(b.w, 'es'));
});
const items = computed(() => {
  if (tab.value === 'letters') return Object.keys(LETTER_INFO).map((l) => ({ w: l }));
  if (tab.value === 'syllables') return [...new Set(Object.values(SYLLABLES).flat())].map((s) => ({ w: s }));
  return words.value;
});
const changed = (it) => !!(media.audio[`${prefix.value}:${it.w}`] || media.image[it.w] || media.icon[it.w]);
const visible = computed(() => {
  if (tab.value !== 'words') return items.value;
  const s = strip(search.value.trim().toUpperCase());
  return items.value.filter((it) => (!s || strip(it.w).includes(s)) && (!onlyMine.value || changed(it)));
});
const tags = (it) => `${tab.value === 'words' && (media.image[it.w] || media.icon[it.w]) ? '🖼️' : ''}${media.audio[`${prefix.value}:${it.w}`] ? '🎙️' : ''}`;

function setTab(id) { stopRecording(); tab.value = id; sel.value = null; error.value = ''; }
function choose(it) {
  stopRecording();
  sel.value = it; error.value = ''; iconDraft.value = media.icon[it.w] || '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
async function run(fn) {
  error.value = ''; busy.value = true;
  try { await fn(); } catch (e) { error.value = e.message || 'No se pudo guardar.'; }
  busy.value = false;
}
const remove = (kind, key) => run(async () => { await removeMedia(kind, key); if (kind === 'icon') iconDraft.value = ''; });
const saveIconDraft = () => run(async () => {
  const v = iconDraft.value.trim();
  if (v) await saveIcon(sel.value.w, v); else if (media.icon[sel.value.w]) await removeMedia('icon', sel.value.w);
});

/* Reduce la imagen a 512 px como máximo antes de subirla. */
async function shrink(file) {
  const img = await new Promise((ok, fail) => {
    const el = new Image();
    el.onload = () => ok(el);
    el.onerror = () => fail(new Error('No se pudo leer la imagen.'));
    el.src = URL.createObjectURL(file);
  });
  const scale = Math.min(1, 512 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(img.naturalWidth * scale));
  c.height = Math.max(1, Math.round(img.naturalHeight * scale));
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(img.src);
  return new Promise((ok) => c.toBlob(ok, 'image/webp', 0.85));
}
function pickImage(ev) {
  const file = ev.target.files[0];
  ev.target.value = '';
  if (file) run(async () => saveMedia('image', sel.value.w, await shrink(file)));
}
function pickAudio(ev) {
  const file = ev.target.files[0];
  ev.target.value = '';
  if (!file) return;
  if (file.size > MAX_AUDIO) { error.value = 'El audio es demasiado largo. Graba solo la palabra.'; return; }
  const key = audioKey.value;
  run(() => saveMedia('audio', key, file.type.startsWith('audio/') ? file : new Blob([file], { type: 'audio/mp4' })));
}

async function toggleRecord() {
  if (recording.value) return stopRecording();
  error.value = '';
  const key = audioKey.value;
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { error.value = 'No hay permiso para usar el micrófono.'; return; }
  const chunks = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  recorder.onstop = () => {
    stream.getTracks().forEach((t) => t.stop());
    clearInterval(ticker);
    recording.value = false;
    const type = (recorder.mimeType || 'audio/webm').split(';')[0].replace('video/', 'audio/');
    recorder = null;
    if (chunks.length) run(() => saveMedia('audio', key, new Blob(chunks, { type })));
  };
  recorder.start();
  recording.value = true;
  seconds.value = 0;
  ticker = setInterval(() => { if (++seconds.value >= MAX_SECONDS) stopRecording(); }, 1000);
}
function stopRecording() { if (recorder && recorder.state !== 'inactive') recorder.stop(); }

function listen() {
  Voice.configure({ enabled: true });
  const fallback = tab.value === 'letters' ? `La letra ${LETTER_INFO[sel.value.w].name}.` : sel.value.w.toLowerCase();
  Voice.speak(fallback, audioUrl(audioKey.value) ? { rec: audioKey.value } : {});
}

onMounted(async () => {
  try { await api.parentCheck(); } catch { router.replace('/padres'); return; }
  loadMedia();
});
onBeforeUnmount(() => { stopRecording(); Voice.stop(); if (app.progress) app.applySettings(); });
</script>
