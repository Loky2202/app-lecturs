/* ==========================================================
   Estado global: perfil activo, progreso, ajustes, eventos.
   El progreso se guarda en el servidor (SQLite) por perfil.
   ========================================================== */
import { defineStore } from 'pinia';
import { api } from '../api.js';
import { Voice } from '../lib/voice.js';
import { Sfx } from '../lib/sfx.js';
import { setCustomWords } from '../lib/content.js';
import { loadMedia } from '../lib/media.js';
import { todayKey, dayKeyOffset } from '../lib/utils.js';
import { UNITS, ALL_LESSONS, unitOfLesson } from '../content/lessons.js';
import { WORLDS, TROPHIES, worldById } from '../content/misc.js';
import { STORIES } from '../content/stories.js';

const MAX_LEVEL = 5;
export const MASCOT_STEPS = [0, 15, 40, 80, 150];

export const defaultProgress = () => ({
  stars: 0, missions: 0, level: 1, manualLevel: false, levelHistory: [],
  lessons: {}, stories: {}, cards: { dinos: 0, carros: 0, juegos: 0, monstruos: 0 },
  trophies: {}, stats: {}, days: {},
  settings: { voice: true, autoRead: true, sfx: true, breaks: true, missionLength: 5, rate: 0.85, dailyGoal: 3, freePath: false, darkMode: false },
});

let saveTimer = null;
let eventTimer = null;

export const useApp = defineStore('app', {
  state: () => ({
    profiles: [],
    profile: null,
    progress: null,
    customWords: [],
    loadedProfiles: false,
    serverOk: true,
    sessionCount: 0,
    breakPending: false,
    pendingEvents: [],
    lastResult: null,
  }),

  getters: {
    settings: (s) => s.progress?.settings || defaultProgress().settings,
    /* nivel efectivo para el modo libre */
    level(s) {
      if (!s.progress) return 1;
      if (s.progress.manualLevel) return s.progress.level;
      return Math.min(MAX_LEVEL, Math.max(s.progress.level, this.pathLevel));
    },
    pathLevel() {
      let lvl = 1;
      for (let i = 0; i < UNITS.length - 1; i++) if (this.unitDone(UNITS[i].id)) lvl = i + 2;
      return Math.min(MAX_LEVEL, lvl);
    },
    streak(s) {
      if (!s.progress) return 0;
      let n = 0;
      for (let i = 0; i < 400; i++) {
        if (s.progress.days[dayKeyOffset(-i)]) n++;
        else if (i === 0) continue;
        else break;
      }
      return n;
    },
    today(s) { return s.progress?.days[todayKey()] || { tasks: 0, activities: 0, seconds: 0 }; },
    dailyGoalRatio() { return Math.min(1, this.today.activities / (this.settings.dailyGoal || 3)); },
    mascot(s) {
      const world = worldById(s.profile?.favorite || 'dinos');
      const stars = s.progress?.stars || 0;
      let stage = 0;
      MASCOT_STEPS.forEach((t, i) => { if (stars >= t) stage = i; });
      const next = MASCOT_STEPS[stage + 1];
      return { emoji: world.mascot[stage], stage, next, world };
    },
    lessonsDone: (s) => (s.progress ? Object.values(s.progress.lessons).filter((l) => l.done).length : 0),
    totalLessons: () => ALL_LESSONS.length,
  },

  actions: {
    /* ---------- carga ---------- */
    async loadProfiles() {
      try {
        this.profiles = await api.profiles();
        this.serverOk = true;
      } catch {
        this.serverOk = false;
        this.profiles = [];
      }
      this.loadedProfiles = true;
      const last = Number(localStorage.getItem('lastProfile'));
      if (last && this.profiles.some((p) => p.id === last) && !this.profile) await this.selectProfile(last);
    },
    async selectProfile(id) {
      const p = this.profiles.find((x) => x.id === id);
      if (!p) return false;
      const res = await api.progress(id);
      const base = defaultProgress();
      const data = res.data || {};
      this.progress = { ...base, ...data, settings: { ...base.settings, ...(data.settings || {}) }, cards: { ...base.cards, ...(data.cards || {}) } };
      this.profile = p;
      localStorage.setItem('lastProfile', String(id));
      this.applySettings();
      try { this.customWords = await api.customWords(); } catch { this.customWords = []; }
      setCustomWords(this.customWords);
      loadMedia();
      return true;
    },
    async createProfile(data) {
      const p = await api.createProfile(data);
      this.profiles.push(p);
      await this.selectProfile(p.id);
      return p;
    },
    logout() {
      this.flushEvents();
      this.profile = null;
      this.progress = null;
      localStorage.removeItem('lastProfile');
    },
    applySettings() {
      Voice.configure({ enabled: this.settings.voice, rate: this.settings.rate });
      Sfx.configure({ enabled: this.settings.sfx });
      document.documentElement.setAttribute('data-theme', this.settings.darkMode ? 'dark' : 'light');
    },
    setSetting(key, value) {
      this.progress.settings[key] = value;
      this.applySettings();
      this.save();
    },
    setLevel(value) {
      if (value === 'auto') this.progress.manualLevel = false;
      else { this.progress.manualLevel = true; this.progress.level = Number(value); }
      this.progress.levelHistory = [];
      this.save();
    },
    async reloadCustomWords() {
      try { this.customWords = await api.customWords(); } catch { /* ignorar */ }
      setCustomWords(this.customWords);
    },

    /* ---------- guardado ---------- */
    save() {
      if (!this.profile) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => this.saveNow(), 800);
    },
    async saveNow() {
      if (!this.profile || !this.progress) return;
      clearTimeout(saveTimer);
      try {
        await api.saveProgress(this.profile.id, JSON.parse(JSON.stringify(this.progress)));
        const summary = this.profiles.find((p) => p.id === this.profile.id);
        if (summary) { summary.stars = this.progress.stars; summary.level = this.level; summary.lessonsDone = this.lessonsDone; }
        this.serverOk = true;
      } catch { this.serverOk = false; }
    },
    logEvent(ev) {
      this.pendingEvents.push({ ts: Date.now(), ...ev });
      clearTimeout(eventTimer);
      eventTimer = setTimeout(() => this.flushEvents(), 3000);
    },
    async flushEvents() {
      if (!this.profile || !this.pendingEvents.length) return;
      const batch = this.pendingEvents.splice(0, this.pendingEvents.length);
      try { await api.sendEvents(this.profile.id, batch); } catch { this.pendingEvents.unshift(...batch); }
    },

    /* ---------- progreso del camino ---------- */
    lessonState(id) { return this.progress?.lessons[id] || { done: false, stars: 0, attempts: 0 }; },
    unitDone(unitId) {
      const u = UNITS.find((x) => x.id === unitId);
      return !!u && u.lessons.every((l) => this.lessonState(l.id).done);
    },
    isLessonUnlocked(id) {
      if (!this.progress) return false;
      if (this.settings.freePath) return true;
      const unit = unitOfLesson(id);
      const ui = UNITS.indexOf(unit);
      const li = unit.lessons.findIndex((l) => l.id === id);
      if (li > 0) return this.lessonState(unit.lessons[li - 1].id).done;
      if (ui === 0) return true;
      return this.unitDone(UNITS[ui - 1].id);
    },
    nextLesson() {
      return ALL_LESSONS.find((l) => !this.lessonState(l.id).done && this.isLessonUnlocked(l.id)) || null;
    },

    /* ---------- registro de tareas y actividades ---------- */
    recordTask({ game, firstTry, lessonId, world, durationMs }) {
      if (!this.progress) return;
      const st = this.progress.stats[game] || { n: 0, ok: 0 };
      st.n++; if (firstTry) st.ok++;
      this.progress.stats[game] = st;
      const d = this.progress.days[todayKey()] || { tasks: 0, activities: 0, seconds: 0 };
      d.tasks++; d.seconds += Math.round((durationMs || 0) / 1000);
      this.progress.days[todayKey()] = d;
      this.logEvent({ kind: 'task', game, first_try: !!firstTry, correct: true, lesson_id: lessonId || null, world: world || null, duration_ms: durationMs || null });
      this.save();
    },

    /* Cierra una lección, misión o cuento. Devuelve el resumen para la pantalla de resultado. */
    finishActivity({ kind, id, results, world, durationMs }) {
      const p = this.progress;
      const total = results.length || 1;
      const first = results.filter((r) => r.firstTry).length;
      const ratio = first / total;
      const stars = ratio >= 0.99 ? 3 : ratio >= 0.6 ? 2 : 1;
      p.stars += stars;
      const d = p.days[todayKey()] || { tasks: 0, activities: 0, seconds: 0 };
      d.activities++; d.seconds += Math.round((durationMs || 0) / 1000);
      p.days[todayKey()] = d;
      this.sessionCount++;
      this.breakPending = !!(this.settings.breaks && this.sessionCount % 2 === 0);

      let unlockedCard = null;
      let levelMsg = '';
      const before = new Set(Object.keys(p.trophies));

      if (kind === 'lesson') {
        const ls = p.lessons[id] || { done: false, stars: 0, attempts: 0 };
        ls.done = true; ls.attempts++; ls.stars = Math.max(ls.stars, stars); ls.last = Date.now();
        p.lessons[id] = ls;
      } else if (kind === 'story') {
        const ss = p.stories[id] || { done: false, stars: 0, reads: 0 };
        ss.done = true; ss.reads++; ss.stars = Math.max(ss.stars, stars);
        p.stories[id] = ss;
        if (p.lessons[id] === undefined || !p.lessons[id].done) p.lessons[id] = { done: true, stars, attempts: 1, last: Date.now() };
      } else {
        p.missions++;
        if (!p.manualLevel) {
          p.levelHistory.push(ratio);
          const h = p.levelHistory;
          if (h.length >= 2 && h.slice(-2).every((r) => r >= 0.8) && p.level < MAX_LEVEL) {
            p.level++; p.levelHistory = []; levelMsg = `¡Subiste al nivel ${p.level}!`;
          } else if (h.length >= 3 && h.slice(-3).every((r) => r < 0.5) && p.level > 1) {
            p.level--; p.levelHistory = []; levelMsg = `Vamos a practicar más en el nivel ${p.level}. ¡Tú puedes!`;
          }
          if (h.length > 5) p.levelHistory = h.slice(-5);
        }
      }

      // tarjeta del álbum (una por actividad terminada, del mundo elegido)
      const w = worldById(world || this.profile?.favorite || 'dinos');
      if (p.cards[w.id] < w.cards.length) { unlockedCard = w.cards[p.cards[w.id]]; p.cards[w.id]++; }

      this.checkTrophies({ kind, ratio, results });
      const newTrophies = Object.keys(p.trophies).filter((t) => !before.has(t)).map((t) => TROPHIES.find((x) => x.id === t));

      this.logEvent({ kind, lesson_id: kind !== 'mission' ? id : null, game: kind === 'mission' ? id : null, world: w.id, correct: stars, first_try: ratio >= 0.99, duration_ms: durationMs || null });
      this.saveNow();
      this.flushEvents();
      this.lastResult = { kind, id, stars, ratio, unlockedCard, world: w, levelMsg, newTrophies, results };
      return this.lastResult;
    },

    checkTrophies({ kind, ratio, results }) {
      const p = this.progress;
      const give = (id) => { if (!p.trophies[id]) p.trophies[id] = Date.now(); };
      if (kind === 'lesson' || kind === 'story') give('primera-leccion');
      if (kind === 'mission') give('primera-mision');
      if (kind === 'story') give('primer-cuento');
      if (p.stars >= 10) give('estrellas-10');
      if (p.stars >= 50) give('estrellas-50');
      if (p.stars >= 100) give('estrellas-100');
      if (p.stars >= 250) give('estrellas-250');
      if (this.streak >= 3) give('racha-3');
      if (this.streak >= 7) give('racha-7');
      UNITS.forEach((u, i) => { if (this.unitDone(u.id)) give(`unidad-${i + 1}`); });
      if (STORIES.every((s) => p.stories[s.id]?.done)) give('unidad-6');
      if (WORLDS.some((w) => p.cards[w.id] >= w.cards.length)) give('album');
      if (ratio >= 0.99 && results.length >= 4) give('perfecta');
      if (results.some((r) => r.game === 'carrera' && r.firstTry)) give('velocista');
      if (results.some((r) => r.game === 'caza' && r.firstTry)) give('cazador');
      if (results.some((r) => r.game === 'traza' && r.great)) give('trazo-perfecto');
      if (kind === 'story' && ratio >= 0.99) give('cuento-perfecto');
      if (results.some((r) => r.game === 'carrera' && r.perfect)) give('carrera-perfecta');
      if (results.some((r) => r.game === 'memoria' && r.perfect)) give('memoria-sin-fallos');
      if (this.streak >= 14) give('racha-14');
    },
  },
});
