<template>
  <section class="screen">
    <TopBar title="Zona de padres" :to="app.profile ? '/' : '/perfiles'">
      <button v-if="unlocked" class="icon-btn" title="Cerrar sesión de padres" @click="lock">🔒</button>
    </TopBar>

    <!-- PIN -->
    <div v-if="!unlocked" class="card">
      <p class="lead">Escribe el PIN de padres</p>
      <input v-model="pin" type="password" inputmode="numeric" placeholder="PIN (por defecto 1234)" aria-label="PIN" @keydown.enter="login">
      <button class="btn primary" @click="login">Entrar</button>
      <p v-if="error" class="error">{{ error }}</p>
      <p class="small muted">El PIN inicial es 1234. Cámbialo en los ajustes.</p>
    </div>

    <template v-else>
      <!-- Selector de niño -->
      <div class="tabs">
        <button v-for="p in app.profiles" :key="p.id" class="tab" :class="{ active: sel === p.id }" @click="select(p.id)">{{ p.avatar }} {{ p.name }}</button>
      </div>
      <p v-if="!app.profiles.length" class="card center">Todavía no hay perfiles. Crea uno desde la pantalla de inicio.</p>

      <template v-if="child && prog">
        <div class="card">
          <h3>{{ child.avatar }} {{ child.name }}</h3>
          <div class="stats-grid">
            <div class="stat"><b>{{ prog.level }}{{ prog.manualLevel ? '' : ' (auto)' }}</b><span>Nivel</span></div>
            <div class="stat"><b>{{ prog.stars }}</b><span>Estrellas</span></div>
            <div class="stat"><b>{{ lessonsDone }}/{{ totalLessons }}</b><span>Lecciones</span></div>
            <div class="stat"><b>{{ accuracy }}</b><span>Aciertos a la 1ª</span></div>
          </div>

          <h4>Últimos 14 días (tareas por día; naranja = minutos)</h4>
          <div v-if="stats" class="bars">
            <div v-for="d in stats.days" :key="d.day" class="bar-col" :title="`${d.day}: ${d.tasks} tareas, ${d.minutes} min, ${d.lessons} lecciones, ${d.missions} misiones`">
              <i :style="{ height: pct(d.tasks, maxTasks) }"></i>
              <i class="alt" :style="{ height: pct(d.minutes, maxMin) }"></i>
              <span>{{ d.day.slice(-2) }}</span>
            </div>
          </div>
          <p v-else class="muted small">Cargando estadísticas…</p>

          <h4>Por actividad</h4>
          <table class="stats-table">
            <tr><th>Actividad</th><th>Tareas</th><th>A la 1ª</th></tr>
            <tr v-for="g in byGame" :key="g.game">
              <td>{{ gameName(g.game) }}<div class="bar"><i :style="{ width: Math.round((g.ok / g.n) * 100) + '%' }"></i></div></td>
              <td>{{ g.n }}</td><td>{{ Math.round((g.ok / g.n) * 100) }}%</td>
            </tr>
            <tr v-if="!byGame.length"><td colspan="3" class="muted">Todavía no hay tareas registradas.</td></tr>
          </table>

          <h4>Camino de lecciones</h4>
          <div v-for="u in UNITS" :key="u.id" class="setting">
            <span>{{ u.e }} {{ u.n }}</span>
            <b>{{ u.lessons.filter((l) => prog.lessons[l.id]?.done).length }}/{{ u.lessons.length }}</b>
          </div>
        </div>

        <div class="card">
          <h3>Ajustes de {{ child.name }}</h3>
          <label class="setting"><span>Nivel del modo libre</span>
            <select :value="prog.manualLevel ? String(prog.level) : 'auto'" @change="setLevel($event.target.value)">
              <option value="auto">Automático</option>
              <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
            </select>
          </label>
          <label class="setting"><span>Tareas por misión</span>
            <select :value="prog.settings.missionLength" @change="set('missionLength', Number($event.target.value))">
              <option :value="3">3 (muy corta)</option><option :value="5">5 (recomendada)</option><option :value="8">8 (larga)</option>
            </select>
          </label>
          <label class="setting"><span>Meta diaria (actividades)</span>
            <select :value="prog.settings.dailyGoal" @change="set('dailyGoal', Number($event.target.value))">
              <option v-for="n in [1, 2, 3, 4, 5, 6]" :key="n" :value="n">{{ n }}</option>
            </select>
          </label>
          <label class="setting"><span>Leer en voz alta</span><input type="checkbox" :checked="prog.settings.voice" @change="set('voice', $event.target.checked)"></label>
          <label class="setting"><span>Leer la instrucción al empezar cada tarea</span><input type="checkbox" :checked="prog.settings.autoRead" @change="set('autoRead', $event.target.checked)"></label>
          <label class="setting"><span>Velocidad de la voz ({{ prog.settings.rate }})</span><input type="range" min="0.6" max="1.1" step="0.05" :value="prog.settings.rate" @change="set('rate', Number($event.target.value))"></label>
          <label class="setting"><span>Sonidos</span><input type="checkbox" :checked="prog.settings.sfx" @change="set('sfx', $event.target.checked)"></label>
          <label class="setting"><span>Pausa activa cada 2 actividades</span><input type="checkbox" :checked="prog.settings.breaks" @change="set('breaks', $event.target.checked)"></label>
          <label class="setting"><span>Desbloquear todas las lecciones y juegos</span><input type="checkbox" :checked="prog.settings.freePath" @change="set('freePath', $event.target.checked)"></label>
          <label class="setting"><span>Nombre</span><input type="text" :value="child.name" maxlength="20" @change="rename($event.target.value)"></label>
          <p v-if="voiceWarn" class="error">{{ voiceWarn }}</p>
          <div class="row">
            <a class="btn ghost" :href="api.exportUrl(child.id)" @click.prevent="exportData">📥 Exportar datos</a>
            <button class="btn danger" @click="removeProfile">🗑️ Borrar perfil</button>
          </div>
        </div>
      </template>

      <div class="card">
        <h3>Palabras personalizadas</h3>
        <p class="small muted">Añade palabras que le gusten (nombres de sus juguetes, su mascota…). Se usan en todos los juegos. Sílabas separadas por guion. Pon un emoji o sube una foto (si hay foto, se muestra la foto).</p>
        <div class="word-form">
          <input v-model="nw.word" type="text" placeholder="PALABRA" aria-label="Palabra">
          <input v-model="nw.syllables" type="text" placeholder="PA-LA-BRA" aria-label="Sílabas">
          <input :value="nw.emoji" type="text" placeholder="😀" aria-label="Emoji" @input="nw.emoji = $event.target.value" @change="nw.emoji = $event.target.value">
          <button class="btn primary" :disabled="addingWord" @click="addWord">Añadir</button>
        </div>
        <div class="word-img" style="margin-top: 8px;">
          <img v-if="nw.image" :src="nw.image" alt="Vista previa" class="thumb">
          <label class="btn ghost" style="cursor: pointer;">
            📷 {{ nw.image ? 'Cambiar imagen' : 'Subir imagen' }}
            <input ref="imageInput" type="file" accept="image/*" hidden @change="pickImage">
          </label>
          <button v-if="nw.image" class="btn ghost" @click="clearImage">Quitar</button>
        </div>
        <p v-if="wordError" class="error">{{ wordError }}</p>
        <div class="row" style="justify-content: flex-start;">
          <span v-for="w in app.customWords" :key="w.id" class="badge"><Pic :word="w" /> {{ w.w }} <button class="icon-btn" style="width:28px;height:28px;font-size:.8rem" @click="delWord(w.id)">✖</button></span>
        </div>
      </div>

      <div class="card">
        <h3>Seguridad</h3>
        <label class="setting"><span>Nuevo PIN (4 a 8 dígitos)</span><input v-model="newPin" type="text" inputmode="numeric" maxlength="8"></label>
        <button class="btn ghost" @click="changePin">Cambiar PIN</button>
        <p v-if="pinMsg" :class="pinOk ? 'okmsg' : 'error'">{{ pinMsg }}</p>
      </div>

      <div class="card tips">
        <h3>Consejos para la atención</h3>
        <ul>
          <li><b>Sesiones cortas:</b> 10 a 15 minutos al día valen más que una hora el fin de semana. La meta diaria de 3 actividades son unos 12 minutos.</li>
          <li><b>Una tarea a la vez:</b> la app muestra solo una actividad por pantalla. Evita tener la tele o juguetes a la vista.</li>
          <li><b>Siempre el mismo momento:</b> por ejemplo, después de merendar. La rutina reduce la resistencia.</li>
          <li><b>Celebra el esfuerzo, no solo el acierto:</b> "Te quedaste hasta el final, ¡bien hecho!".</li>
          <li><b>Léanlo juntos:</b> pídele que lea la palabra en voz alta con el dedo debajo antes de tocar la respuesta.</li>
          <li><b>Pausas de movimiento:</b> la app las propone cada 2 actividades. Saltar o correr un minuto ayuda a volver a concentrarse.</li>
          <li><b>Si se frustra:</b> baja el nivel o acorta las misiones. Mejor ganar fácil hoy que abandonar.</li>
          <li><b>Si le cuesta mucho leer a los 6 años</b> o confunde letras de forma persistente, consulta con la maestra o un especialista en lenguaje. Esta app apoya, pero no sustituye una evaluación.</li>
        </ul>
      </div>
    </template>
  </section>
</template>

<script setup>
import Pic from '../components/Pic.vue';
import { shrinkImage } from '../lib/image.js';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TopBar from '../components/TopBar.vue';
import { useApp, defaultProgress } from '../stores/app.js';
import { api } from '../api.js';
import { UNITS, ALL_LESSONS } from '../content/lessons.js';
import { GAMES } from '../content/misc.js';
import { Voice } from '../lib/voice.js';

const app = useApp();
const router = useRouter();
const unlocked = ref(false);
const pin = ref('');
const error = ref('');
const sel = ref(null);
const prog = ref(null);
const stats = ref(null);
const nw = ref({ word: '', syllables: '', emoji: '', image: '' });
const imageInput = ref(null);
const addingWord = ref(false);
const wordError = ref('');
const newPin = ref('');
const pinMsg = ref('');
const pinOk = ref(false);

const child = computed(() => app.profiles.find((p) => p.id === sel.value));
const totalLessons = ALL_LESSONS.length;
const lessonsDone = computed(() => (prog.value ? Object.values(prog.value.lessons).filter((l) => l.done).length : 0));
const accuracy = computed(() => {
  if (!prog.value) return '–';
  const t = Object.values(prog.value.stats).reduce((a, s) => ({ n: a.n + s.n, ok: a.ok + s.ok }), { n: 0, ok: 0 });
  return t.n ? `${Math.round((t.ok / t.n) * 100)}%` : '–';
});
const byGame = computed(() => (stats.value ? stats.value.byGame.slice().sort((a, b) => b.n - a.n) : []));
const maxTasks = computed(() => Math.max(1, ...(stats.value?.days.map((d) => d.tasks) || [1])));
const maxMin = computed(() => Math.max(1, ...(stats.value?.days.map((d) => d.minutes) || [1])));
const pct = (v, max) => `${Math.max(2, Math.round((v / max) * 100))}%`;
const gameName = (id) => (id === 'cuento' ? 'Cuentos' : GAMES.find((g) => g.id === id)?.n || id);
const voiceWarn = computed(() => (Voice.available ? (Voice.hasSpanishVoice() ? '' : 'Este dispositivo no tiene una voz en español instalada: la lectura en voz alta puede sonar mal o no funcionar.') : 'Este navegador no puede leer en voz alta.'));

async function login() {
  error.value = '';
  try {
    const r = await api.parentLogin(pin.value);
    api.setParentToken(r.token);
    unlocked.value = true;
    pin.value = '';
    await app.loadProfiles();
    if (app.profiles.length) select(app.profile?.id || app.profiles[0].id);
  } catch (e) { error.value = e.message; }
}
function lock() { api.setParentToken(''); unlocked.value = false; }
async function select(id) {
  sel.value = id;
  stats.value = null;
  if (app.profile?.id === id) prog.value = app.progress;
  else {
    const r = await api.progress(id);
    const base = defaultProgress();
    const d = r.data || {};
    prog.value = { ...base, ...d, settings: { ...base.settings, ...(d.settings || {}) } };
  }
  try { stats.value = await api.stats(id, 14); } catch { stats.value = { days: [], byGame: [] }; }
}
async function persist() {
  if (app.profile?.id === sel.value) { app.applySettings(); await app.saveNow(); }
  else await api.saveProgress(sel.value, JSON.parse(JSON.stringify(prog.value)));
}
function set(key, value) { prog.value.settings[key] = value; persist(); }
function setLevel(v) {
  if (v === 'auto') prog.value.manualLevel = false; else { prog.value.manualLevel = true; prog.value.level = Number(v); }
  prog.value.levelHistory = [];
  persist();
}
async function rename(name) {
  if (!name.trim()) return;
  const p = await api.updateProfile(sel.value, { name: name.trim() });
  const local = app.profiles.find((x) => x.id === sel.value);
  if (local) local.name = p.name;
  if (app.profile?.id === sel.value) app.profile.name = p.name;
}
async function exportData() {
  const res = await fetch(api.exportUrl(sel.value), { headers: { 'x-parent-token': sessionStorage.getItem('parentToken') || '' } });
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mision-lectura-${child.value.name}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
async function removeProfile() {
  if (!window.confirm(`¿Borrar el perfil de ${child.value.name} y todo su progreso? No se puede deshacer.`)) return;
  await api.deleteProfile(sel.value);
  if (app.profile?.id === sel.value) app.logout();
  await app.loadProfiles();
  sel.value = null; prog.value = null;
  if (app.profiles.length) select(app.profiles[0].id); else router.push('/perfiles');
}
async function addWord() {
  wordError.value = '';
  addingWord.value = true;
  try {
    const { word, syllables, emoji, image } = nw.value;
    await api.addWord({ word, syllables, emoji, image: image || undefined, world: child.value?.favorite || 'general' });
    nw.value = { word: '', syllables: '', emoji: '', image: '' };
    if (imageInput.value) imageInput.value.value = '';
    await app.reloadCustomWords();
  } catch (e) { wordError.value = e.message; } finally { addingWord.value = false; }
}
async function pickImage(ev) {
  const file = ev.target.files?.[0];
  if (!file) return;
  wordError.value = '';
  try { nw.value.image = await shrinkImage(file); } catch { wordError.value = 'No se pudo leer la imagen.'; }
}
function clearImage() { nw.value.image = ''; if (imageInput.value) imageInput.value.value = ''; }
async function delWord(id) { await api.deleteWord(id); await app.reloadCustomWords(); }
async function changePin() {
  pinMsg.value = '';
  try { await api.setPin(newPin.value); pinOk.value = true; pinMsg.value = 'PIN cambiado.'; newPin.value = ''; } catch (e) { pinOk.value = false; pinMsg.value = e.message; }
}
onMounted(async () => {
  if (api.hasParentToken()) {
    try { await api.parentCheck(); unlocked.value = true; await app.loadProfiles(); if (app.profiles.length) select(app.profile?.id || app.profiles[0].id); } catch { api.setParentToken(''); }
  }
});
</script>
