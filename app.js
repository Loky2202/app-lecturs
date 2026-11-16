/* ==========================================================
   Misión Lectura — lógica de la app
   Sin dependencias. Guarda el progreso en localStorage.
   ========================================================== */
(() => {
  'use strict';

  const STORAGE_KEY = 'mision-lectura-v1';
  const MAX_LEVEL = 5;

  const TYPE_NAMES = {
    vocal: 'Vocal que falta',
    inicial: 'Letra inicial',
    lee: 'Leer y elegir',
    escucha: 'Escuchar y encontrar',
    arma: 'Armar la palabra',
    rima: 'Rimas',
    memoria: 'Memoria',
    frase: 'Leer frases',
  };

  const TYPES_BY_LEVEL = {
    1: ['vocal', 'inicial', 'lee'],
    2: ['vocal', 'inicial', 'lee', 'escucha', 'arma'],
    3: ['inicial', 'lee', 'escucha', 'arma', 'rima', 'memoria'],
    4: ['lee', 'escucha', 'arma', 'rima', 'memoria', 'frase'],
    5: ['escucha', 'arma', 'rima', 'memoria', 'frase', 'frase'],
  };

  /* ---------- utilidades ---------- */
  const $ = (id) => document.getElementById(id);
  const rand = (n) => Math.floor(Math.random() * n);
  const pickOne = (arr) => arr[rand(arr.length)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const dayKeyOffset = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  const spoken = (w) => w.toLowerCase();

  /* ---------- estado ---------- */
  const defaultState = () => ({
    name: '',
    level: 1,
    stars: 0,
    missions: 0,
    unlocked: { dinos: 0, carros: 0, juegos: 0, monstruos: 0 },
    stats: {},
    days: {},
    levelHistory: [],
    settings: { voice: true, autoRead: true, sfx: true, breaks: true, missionLength: 5, manualLevel: false },
    onboarded: false,
  });

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return { ...base, ...parsed, settings: { ...base.settings, ...(parsed.settings || {}) }, unlocked: { ...base.unlocked, ...(parsed.unlocked || {}) } };
    } catch {
      return defaultState();
    }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* sin almacenamiento */ }
  }

  /* ---------- voz ---------- */
  const Voice = {
    voice: null,
    ready: 'speechSynthesis' in window,
    init() {
      if (!this.ready) return;
      const pick = () => {
        const all = speechSynthesis.getVoices();
        const es = all.filter((v) => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('es'));
        const pref = ['es-mx', 'es-us', 'es-419', 'es-co', 'es-ar', 'es-cl', 'es-pe', 'es-es'];
        this.voice = pref.map((p) => es.find((v) => v.lang.toLowerCase().replace('_', '-') === p)).find(Boolean) || es[0] || null;
      };
      pick();
      speechSynthesis.addEventListener('voiceschanged', pick);
    },
    speak(text, opts = {}) {
      if (!this.ready || !state.settings.voice || !text) return;
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = this.voice ? this.voice.lang : 'es-ES';
        if (this.voice) u.voice = this.voice;
        u.rate = opts.rate || 0.85;
        u.pitch = 1.05;
        speechSynthesis.speak(u);
      } catch { /* ignorar */ }
    },
    stop() { if (this.ready) try { speechSynthesis.cancel(); } catch { /* ignorar */ } },
  };

  /* ---------- sonidos ---------- */
  const Sfx = {
    ctx: null,
    tone(freq, start, dur, type = 'sine', gain = 0.18) {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, this.ctx.currentTime + start);
      g.gain.exponentialRampToValueAtTime(gain, this.ctx.currentTime + start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + start + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(this.ctx.currentTime + start);
      o.stop(this.ctx.currentTime + start + dur + 0.05);
    },
    play(kind) {
      if (!state.settings.sfx) return;
      try {
        this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        if (kind === 'ok') [523, 659, 784].forEach((f, i) => this.tone(f, i * 0.1, 0.18));
        else if (kind === 'bad') this.tone(180, 0, 0.3, 'sawtooth', 0.08);
        else if (kind === 'win') [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, i * 0.12, 0.3));
        else if (kind === 'tap') this.tone(660, 0, 0.08, 'triangle', 0.1);
      } catch { /* sin audio */ }
    },
  };

  /* ---------- navegación ---------- */
  const screens = ['welcome', 'home', 'mission', 'result', 'break', 'album', 'parent'];
  function show(name) {
    Voice.stop();
    screens.forEach((s) => { $(`screen-${s}`).hidden = s !== name; });
    window.scrollTo(0, 0);
  }

  /* ---------- feedback flotante ---------- */
  let feedbackTimer = null;
  function feedback(text, bad = false) {
    const f = $('feedback');
    f.textContent = text;
    f.className = 'feedback' + (bad ? ' bad' : '');
    f.hidden = false;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { f.hidden = true; }, 1400);
  }

  /* ---------- inicio ---------- */
  function renderHome() {
    const name = state.name ? `¡Hola, ${state.name}!` : '¡Hola!';
    $('home-name').textContent = name;
    $('home-level').textContent = state.level;
    $('home-stars').textContent = state.stars;
    $('home-streak').textContent = streak();

    const wrap = $('worlds');
    wrap.innerHTML = '';
    WORLDS.forEach((w) => {
      const b = el('button', 'world');
      b.style.background = w.color;
      b.innerHTML = `<span class="we">${w.emoji}</span><span>${w.name}</span><span class="wc">${state.unlocked[w.id]}/${w.cards.length} tarjetas</span>`;
      b.addEventListener('click', () => beginMission(w.id));
      wrap.appendChild(b);
    });
  }

  function streak() {
    let n = 0;
    for (let i = 0; i < 365; i++) {
      if (state.days[dayKeyOffset(-i)]) n++;
      else if (i === 0) continue; // hoy todavía no, pero la racha sigue viva
      else break;
    }
    return n;
  }

  /* ---------- selección de contenido ---------- */
  const allWords = () => WORLDS.flatMap((w) => w.words);
  const worldById = (id) => WORLDS.find((w) => w.id === id);
  const maxSyllables = (level) => (level <= 2 ? 2 : level <= 4 ? 3 : 5);

  function wordPool(world, level, filter) {
    const f = (w) => w.s.length <= maxSyllables(level) && (!filter || filter(w));
    let pool = world.words.filter(f);
    if (pool.length < 4) pool = allWords().filter(f);
    return pool;
  }

  function pickWord(world, level, used, filter) {
    const pool = wordPool(world, level, filter);
    const fresh = pool.filter((w) => !used.has(w.w));
    const chosen = pickOne(fresh.length ? fresh : pool);
    used.add(chosen.w);
    return chosen;
  }

  function distractors(target, n, key, world) {
    const seen = new Set([target[key]]);
    const take = (src) => {
      const out = [];
      for (const w of shuffle(src)) {
        if (seen.has(w[key])) continue;
        seen.add(w[key]);
        out.push(w);
        if (out.length === n) break;
      }
      return out;
    };
    let out = take(world.words);
    if (out.length < n) out = out.concat(take(allWords()).slice(0, n - out.length));
    return out;
  }

  /* ---------- misión ---------- */
  let mission = null;
  let sessionMissions = 0;
  let currentSpeak = null;

  function buildTypes(level, n) {
    const allowed = TYPES_BY_LEVEL[level];
    const out = [];
    let bag = shuffle(allowed);
    while (out.length < n) {
      if (!bag.length) bag = shuffle(allowed);
      let t = bag.shift();
      if (out.length && t === out[out.length - 1] && bag.length) { bag.push(t); t = bag.shift(); }
      out.push(t);
    }
    return out;
  }

  let breakPending = false;

  function beginMission(worldId) {
    if (breakPending) {
      showBreak(() => { breakPending = false; startMission(worldId); });
      return;
    }
    startMission(worldId);
  }

  function startMission(worldId) {
    const world = worldById(worldId);
    const n = Number(state.settings.missionLength) || 5;
    mission = {
      world,
      level: state.level,
      types: buildTypes(state.level, n),
      index: 0,
      results: [],
      used: new Set(),
    };
    renderProgress();
    show('mission');
    nextTask();
  }

  function renderProgress() {
    const p = $('progress');
    p.innerHTML = '';
    mission.types.forEach((_, i) => {
      const d = el('div', 'dot');
      const r = mission.results[i];
      if (r) { d.classList.add(r.firstTry ? 'star' : 'done'); d.textContent = r.firstTry ? '⭐' : '✓'; }
      else if (i === mission.index) d.classList.add('current');
      p.appendChild(d);
    });
  }

  async function nextTask() {
    if (mission.index >= mission.types.length) return finishMission();
    renderProgress();
    const type = mission.types[mission.index];
    const firstTry = await TASKS[type]();
    mission.results[mission.index] = { type, firstTry };
    const st = state.stats[type] || { n: 0, ok: 0 };
    st.n++; if (firstTry) st.ok++;
    state.stats[type] = st;
    save();
    mission.index++;
    nextTask();
  }

  function setInstruction(text, speakText) {
    $('instruction').textContent = text;
    currentSpeak = () => Voice.speak(speakText || text);
    if (state.settings.autoRead) currentSpeak();
  }

  /* Tarea genérica de opciones: devuelve una promesa con firstTry. */
  function choiceTask({ content, options, cols, onCorrectSpeak }) {
    return new Promise((resolve) => {
      const task = $('task');
      task.innerHTML = '';
      if (content) task.appendChild(content);
      const grid = el('div', `options cols-${cols || 3}`);
      let wrong = 0;
      let locked = false;
      const buttons = options.map((o) => {
        const b = el('button', `opt ${o.cls || ''}`, o.html);
        b.addEventListener('click', async () => {
          if (locked || b.disabled) return;
          if (o.correct) {
            locked = true;
            buttons.forEach((x) => { x.disabled = true; x.classList.remove('hint'); });
            b.classList.add('ok');
            Sfx.play('ok');
            feedback(pickOne(PRAISE));
            Voice.speak(onCorrectSpeak || pickOne(PRAISE));
            await wait(1100);
            resolve(wrong === 0);
          } else {
            wrong++;
            b.disabled = true;
            b.classList.add('bad');
            Sfx.play('bad');
            feedback(pickOne(RETRY), true);
            if (wrong === 1) Voice.speak(pickOne(RETRY));
            if (wrong >= 2) {
              const correct = buttons.find((x, i) => options[i].correct);
              correct.classList.add('hint');
              if (options.find((x) => x.correct).hintSpeak) Voice.speak(options.find((x) => x.correct).hintSpeak);
            }
          }
        });
        grid.appendChild(b);
        return b;
      });
      task.appendChild(grid);
    });
  }

  function wordWithBlank(word, pos) {
    return `<div class="big-word">${[...word].map((ch, i) => (i === pos ? `<span class="blank">_</span>` : ch)).join('')}</div>`;
  }

  /* ---------- tareas ---------- */
  const TASKS = {
    /* ¿Qué vocal falta? */
    vocal() {
      const hasVowel = (w) => [...w.w].some((c, i) => i > 0 && VOWELS.includes(c));
      const word = pickWord(mission.world, mission.level, mission.used, (w) => w.s.length >= 2 && hasVowel(w));
      const positions = [...word.w].map((c, i) => (i > 0 && VOWELS.includes(c) ? i : -1)).filter((i) => i >= 0);
      const pos = pickOne(positions);
      const answer = word.w[pos];
      const choices = mission.level === 1 ? shuffle([answer, ...shuffle(VOWELS.filter((v) => v !== answer)).slice(0, 2)]) : VOWELS;
      setInstruction('¿Qué vocal falta?', `¿Qué vocal falta en ${spoken(word.w)}?`);
      const content = el('div', 'task');
      content.innerHTML = `<div class="big-emoji">${word.e}</div>${wordWithBlank(word.w, pos)}`;
      return choiceTask({
        content,
        cols: choices.length,
        options: choices.map((v) => ({ html: v, cls: 'letter', correct: v === answer, hintSpeak: `${spoken(word.w)}. La vocal es la ${spoken(v)}.` })),
        onCorrectSpeak: `${spoken(word.w)}. ¡Muy bien!`,
      });
    },

    /* ¿Con qué letra empieza? */
    inicial() {
      const ok = (w) => /^[A-Z]/.test(w.w) && !/^(LL|CH|RR)/.test(w.w) && !/^Ñ/.test(w.w);
      const word = pickWord(mission.world, mission.level, mission.used, ok);
      const answer = word.w[0];
      const similar = { B: ['D', 'P'], D: ['B', 'P'], P: ['B', 'Q'], M: ['N', 'W'], N: ['M', 'H'], C: ['G', 'O'], G: ['C', 'Q'], R: ['P', 'B'], T: ['F', 'L'], F: ['T', 'E'], V: ['B', 'U'], S: ['Z', 'C'], Z: ['S', 'Z'], H: ['N', 'M'], L: ['T', 'I'], J: ['I', 'L'], E: ['F', 'A'], A: ['E', 'O'], O: ['C', 'U'], U: ['V', 'O'], I: ['L', 'J'] };
      const letters = [...new Set([...CONSONANTS, ...VOWELS])].filter((l) => l !== answer);
      let dis = mission.level >= 3 && similar[answer] ? similar[answer].filter((l) => l !== answer) : [];
      dis = [...new Set(dis)];
      while (dis.length < 2) { const l = pickOne(letters); if (!dis.includes(l)) dis.push(l); }
      const choices = shuffle([answer, ...dis.slice(0, 2)]);
      setInstruction('¿Con qué letra empieza?', `¿Con qué letra empieza ${spoken(word.w)}?`);
      const content = el('div', 'task');
      content.innerHTML = `<div class="big-emoji">${word.e}</div>${wordWithBlank(word.w, 0)}`;
      return choiceTask({
        content,
        cols: 3,
        options: choices.map((l) => ({ html: l, cls: 'letter', correct: l === answer, hintSpeak: `${spoken(word.w)} empieza con ${spoken(l)}.` })),
        onCorrectSpeak: `${spoken(word.w)}. ¡Eso es!`,
      });
    },

    /* Lee la palabra y toca el dibujo. */
    lee() {
      const word = pickWord(mission.world, mission.level, mission.used);
      const dis = distractors(word, 2, 'e', mission.world);
      const choices = shuffle([word, ...dis]);
      setInstruction('Lee la palabra y toca el dibujo.');
      const content = el('div', 'task');
      content.innerHTML = `<div class="big-word">${word.w}</div>`;
      return choiceTask({
        content,
        cols: 3,
        options: choices.map((c) => ({ html: c.e, cls: 'emoji', correct: c.w === word.w, hintSpeak: `Dice ${spoken(word.w)}. Busca ${spoken(word.w)}.` })),
        onCorrectSpeak: `${spoken(word.w)}. ¡Genial!`,
      });
    },

    /* Escucha la palabra y toca la escrita. */
    escucha() {
      const word = pickWord(mission.world, mission.level, mission.used);
      let pool = allWords().filter((w) => w.w !== word.w);
      if (mission.level >= 3) {
        const hard = pool.filter((w) => w.w[0] === word.w[0] || Math.abs(w.w.length - word.w.length) <= 1);
        if (hard.length >= 2) pool = hard;
      }
      const dis = [];
      const seen = new Set([word.w]);
      for (const w of shuffle(pool)) { if (!seen.has(w.w)) { seen.add(w.w); dis.push(w); } if (dis.length === 2) break; }
      const choices = shuffle([word, ...dis]);
      setInstruction('Escucha y toca la palabra.', `Escucha y toca la palabra: ${spoken(word.w)}.`);
      currentSpeak = () => Voice.speak(spoken(word.w));
      const content = el('div', 'task');
      const btn = el('button', 'btn secondary listen-btn', '🔊 Escuchar otra vez');
      btn.addEventListener('click', () => Voice.speak(spoken(word.w)));
      content.appendChild(btn);
      return choiceTask({
        content,
        cols: 3,
        options: choices.map((c) => ({ html: c.w, cls: 'word', correct: c.w === word.w, hintSpeak: `${spoken(word.w)}. Empieza con ${spoken(word.w[0])}.` })),
        onCorrectSpeak: `${spoken(word.w)}. ¡Súper!`,
      });
    },

    /* Lee la frase y responde. */
    frase() {
      let pool = SENTENCES.filter((s) => s.world === mission.world.id && s.lvl <= mission.level && !mission.used.has(s.t));
      if (!pool.length) pool = SENTENCES.filter((s) => s.lvl <= mission.level && !mission.used.has(s.t));
      if (!pool.length) pool = SENTENCES.filter((s) => s.lvl <= mission.level);
      const s = pickOne(pool);
      mission.used.add(s.t);
      setInstruction('Lee la frase y responde.');
      currentSpeak = () => Voice.speak(`${s.t} ${s.q}`);
      const content = el('div', 'task');
      content.innerHTML = `<div class="sentence">${s.t}</div><div class="question">${s.q}</div>`;
      return choiceTask({
        content,
        cols: 3,
        options: s.o.map((o, i) => ({ html: o, cls: 'emoji', correct: i === s.ans, hintSpeak: `${s.t} ${s.q}` })),
        onCorrectSpeak: '¡Muy bien! Leíste la frase.',
      });
    },

    /* ¿Cuál rima? */
    rima() {
      const group = pickOne(RHYMES.filter((g) => g.length >= 2));
      const [target, correct] = shuffle(group).slice(0, 2);
      const others = RHYMES.filter((g) => g !== group).flat();
      const ending = (w) => w.slice(-2);
      const dis = shuffle(others.filter((o) => ending(o.w) !== ending(target.w))).slice(0, 2);
      const choices = shuffle([correct, ...dis]);
      setInstruction(`¿Cuál rima con ${target.w}?`, `¿Cuál rima con ${spoken(target.w)}? ${choices.map((c) => spoken(c.w)).join(', ')}.`);
      const content = el('div', 'task');
      content.innerHTML = `<div class="big-emoji">${target.e}</div><div class="big-word">${target.w}</div>`;
      return choiceTask({
        content,
        cols: 3,
        options: choices.map((c) => ({ html: `<small>${c.e}</small>${c.w}`, cls: 'word', correct: c.w === correct.w, hintSpeak: `${spoken(target.w)} rima con ${spoken(correct.w)}.` })),
        onCorrectSpeak: `${spoken(target.w)} y ${spoken(correct.w)}. ¡Riman!`,
      });
    },

    /* Arma la palabra con sílabas. */
    arma() {
      return new Promise((resolve) => {
        const maxS = mission.level <= 2 ? 2 : mission.level <= 4 ? 3 : 5;
        const word = pickWord(mission.world, mission.level, mission.used, (w) => w.s.length >= 2 && w.s.length <= maxS);
        const showWord = mission.level <= 2;
        setInstruction('Arma la palabra con las sílabas.', `Arma la palabra ${spoken(word.w)}.`);
        currentSpeak = () => Voice.speak(spoken(word.w));

        const task = $('task');
        task.innerHTML = `<div class="big-emoji">${word.e}</div>${showWord ? `<div class="question">${word.s.join(' · ')}</div>` : ''}`;
        const slots = el('div', 'slots');
        const slotEls = word.s.map(() => { const s = el('div', 'slot', ''); slots.appendChild(s); return s; });
        let order = shuffle(word.s);
        if (word.s.length > 1 && order.join('-') === word.s.join('-')) order = [...order.slice(1), order[0]];
        const chips = el('div', 'chips');
        let pos = 0;
        let wrong = 0;
        const chipEls = order.map((syl) => {
          const c = el('button', 'chip', syl);
          c.addEventListener('click', async () => {
            if (c.classList.contains('used')) return;
            if (syl === word.s[pos]) {
              Sfx.play('tap');
              c.classList.add('used');
              slotEls[pos].textContent = syl;
              slotEls[pos].classList.add('filled');
              pos++;
              if (pos === word.s.length) {
                Sfx.play('ok');
                feedback(pickOne(PRAISE));
                Voice.speak(`${spoken(word.w)}. ${pickOne(PRAISE)}`);
                await wait(1200);
                resolve(wrong === 0);
              }
            } else {
              wrong++;
              Sfx.play('bad');
              c.classList.add('bad');
              setTimeout(() => c.classList.remove('bad'), 500);
              feedback(pickOne(RETRY), true);
              if (wrong >= 2) {
                const next = chipEls.find((x, i) => order[i] === word.s[pos] && !x.classList.contains('used'));
                if (next) next.classList.add('hint');
                Voice.speak(`${spoken(word.w)}. Sigue con ${spoken(word.s[pos])}.`);
              }
            }
          });
          chips.appendChild(c);
          return c;
        });
        const listen = el('button', 'btn ghost listen-btn', '🔊 Escuchar');
        listen.addEventListener('click', () => Voice.speak(spoken(word.w)));
        task.appendChild(slots);
        task.appendChild(chips);
        task.appendChild(listen);
      });
    },

    /* Memoria: palabra ↔ dibujo. */
    memoria() {
      return new Promise((resolve) => {
        const pairs = mission.level >= 4 ? 4 : 3;
        const words = [];
        const seenE = new Set();
        const pool = shuffle(wordPool(mission.world, mission.level, (w) => w.s.length <= 3));
        for (const w of pool) { if (!seenE.has(w.e)) { seenE.add(w.e); words.push(w); } if (words.length === pairs) break; }
        setInstruction('Encuentra las parejas: palabra y dibujo.');
        const task = $('task');
        task.innerHTML = '';
        const grid = el('div', `memory pairs-${pairs}`);
        const cards = shuffle(words.flatMap((w) => [{ w, kind: 'word' }, { w, kind: 'emoji' }]));
        let up = [];
        let matched = 0;
        let misses = 0;
        let busy = false;
        cards.forEach((c) => {
          const b = el('button', `mcard ${c.kind}`);
          b.innerHTML = `<span class="back">❓</span><span class="face">${c.kind === 'word' ? c.w.w : c.w.e}</span>`;
          b.addEventListener('click', async () => {
            if (busy || b.classList.contains('up') || b.classList.contains('matched')) return;
            Sfx.play('tap');
            b.classList.add('up');
            up.push({ b, c });
            if (up.length < 2) return;
            busy = true;
            const [a, z] = up;
            if (a.c.w.w === z.c.w.w && a.c.kind !== z.c.kind) {
              a.b.classList.add('matched'); z.b.classList.add('matched');
              a.b.classList.remove('up'); z.b.classList.remove('up');
              matched++;
              Sfx.play('ok');
              Voice.speak(spoken(a.c.w.w));
              up = [];
              busy = false;
              if (matched === pairs) {
                feedback(pickOne(PRAISE));
                await wait(1100);
                resolve(misses <= pairs - 1);
              }
            } else {
              misses++;
              Sfx.play('bad');
              a.b.classList.add('bad'); z.b.classList.add('bad');
              await wait(800);
              [a.b, z.b].forEach((x) => x.classList.remove('up', 'bad'));
              up = [];
              busy = false;
            }
          });
          grid.appendChild(b);
        });
        task.appendChild(grid);
      });
    },
  };

  /* ---------- fin de misión ---------- */
  function finishMission() {
    const total = mission.results.length;
    const first = mission.results.filter((r) => r.firstTry).length;
    const ratio = total ? first / total : 0;
    const stars = ratio >= 0.99 ? 3 : ratio >= 0.6 ? 2 : 1;

    state.stars += stars;
    state.missions++;
    sessionMissions++;
    breakPending = state.settings.breaks && sessionMissions % 2 === 0;
    state.days[todayKey()] = (state.days[todayKey()] || 0) + 1;

    // tarjeta nueva
    const world = mission.world;
    let unlocked = null;
    if (state.unlocked[world.id] < world.cards.length) {
      unlocked = world.cards[state.unlocked[world.id]];
      state.unlocked[world.id]++;
    }

    // nivel automático
    let levelMsg = '';
    if (!state.settings.manualLevel) {
      state.levelHistory.push(ratio);
      const h = state.levelHistory;
      if (h.length >= 2 && h.slice(-2).every((r) => r >= 0.8) && state.level < MAX_LEVEL) {
        state.level++;
        state.levelHistory = [];
        levelMsg = `🎉 ¡Subiste al nivel ${state.level}!`;
      } else if (h.length >= 3 && h.slice(-3).every((r) => r < 0.5) && state.level > 1) {
        state.level--;
        state.levelHistory = [];
        levelMsg = `Vamos a practicar un poco más en el nivel ${state.level}. ¡Tú puedes!`;
      }
      if (state.levelHistory.length > 5) state.levelHistory = state.levelHistory.slice(-5);
    }
    save();

    $('result-stars').innerHTML = [1, 2, 3].map((i) => `<span class="${i <= stars ? '' : 'off'}">⭐</span>`).join('');
    const msgs = { 3: '¡Perfecto! Todas a la primera.', 2: '¡Muy bien! Casi todas a la primera.', 1: '¡Terminaste la misión! Eso es lo importante.' };
    $('result-msg').textContent = msgs[stars];

    const u = $('result-unlock');
    u.innerHTML = '';
    if (levelMsg) u.appendChild(el('div', 'levelup', levelMsg));
    if (unlocked) {
      u.insertAdjacentHTML('beforeend', `<div class="ue">${unlocked.e}</div><div class="un">¡Nueva tarjeta: ${unlocked.n}!</div><div class="ut">${unlocked.t}</div>`);
    } else {
      u.insertAdjacentHTML('beforeend', `<div class="ue">${world.emoji}</div><div class="un">¡Álbum de ${world.name} completo!</div><div class="ut">Prueba otro mundo para ganar más tarjetas.</div>`);
    }

    show('result');
    Sfx.play('win');
    confetti();
    const say = `¡Misión cumplida! ${msgs[stars]} ${levelMsg ? levelMsg.replace('🎉', '') : ''} ${unlocked ? `Nueva tarjeta: ${unlocked.n}. ${unlocked.t}` : ''}`;
    setTimeout(() => Voice.speak(say), 300);
  }

  /* ---------- confeti ---------- */
  function confetti() {
    const c = $('confetti');
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const colors = ['#ffb300', '#2962ff', '#43a047', '#e53935', '#8e24aa', '#fb8c00'];
    const parts = Array.from({ length: 120 }, () => ({
      x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.5,
      r: 5 + Math.random() * 6, vy: 2 + Math.random() * 3, vx: -1.5 + Math.random() * 3,
      col: pickOne(colors), rot: Math.random() * Math.PI,
    }));
    const start = performance.now();
    (function frame(now) {
      ctx.clearRect(0, 0, c.width, c.height);
      parts.forEach((p) => {
        p.y += p.vy; p.x += p.vx; p.rot += 0.05;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.col; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        ctx.restore();
      });
      if (now - start < 3000 && !$('screen-result').hidden) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, c.width, c.height);
    })(start);
  }

  /* ---------- pausa activa ---------- */
  let breakTimer = null;
  function showBreak(done) {
    const b = pickOne(BREAKS);
    $('break-emoji').textContent = b.e;
    $('break-text').textContent = b.t;
    let secs = 30;
    $('break-timer').textContent = secs;
    show('break');
    Voice.speak(`¡Pausa activa! ${b.t}`);
    clearInterval(breakTimer);
    breakTimer = setInterval(() => {
      secs--;
      $('break-timer').textContent = Math.max(0, secs);
      if (secs <= 0) { clearInterval(breakTimer); Voice.speak('¡Listo! Volvemos a leer.'); }
    }, 1000);
    $('btn-break-done').onclick = () => { clearInterval(breakTimer); done(); };
  }

  /* ---------- álbum ---------- */
  let albumTab = 'dinos';
  function renderAlbum() {
    $('album-stars').textContent = state.stars;
    const tabs = $('album-tabs');
    tabs.innerHTML = '';
    WORLDS.forEach((w) => {
      const t = el('button', `tab ${w.id === albumTab ? 'active' : ''}`, `${w.emoji} ${w.name}`);
      t.addEventListener('click', () => { albumTab = w.id; renderAlbum(); });
      tabs.appendChild(t);
    });
    const world = worldById(albumTab);
    const grid = $('album-grid');
    grid.innerHTML = '';
    world.cards.forEach((c, i) => {
      const open = i < state.unlocked[world.id];
      const card = el('div', `acard ${open ? '' : 'locked'}`);
      card.innerHTML = open ? `<div class="ae">${c.e}</div><div class="an">${c.n}</div>` : `<div class="ae">❓</div><div class="an">Misión ${i + 1}</div>`;
      if (open) card.addEventListener('click', () => Voice.speak(`${c.n}. ${c.t}`));
      grid.appendChild(card);
    });
  }

  /* ---------- zona de padres ---------- */
  let gateAnswer = 0;
  function renderGate() {
    const a = 3 + rand(7), b = 3 + rand(7);
    gateAnswer = a * b;
    $('gate-q').textContent = `${a} × ${b} = ?`;
    $('gate-input').value = '';
    $('gate-error').textContent = '';
    $('parent-gate').hidden = false;
    $('parent-panel').hidden = true;
  }

  function renderParentPanel() {
    $('parent-gate').hidden = true;
    $('parent-panel').hidden = false;
    $('p-level').textContent = state.level;
    $('p-missions').textContent = state.missions;
    const tot = Object.values(state.stats).reduce((a, s) => ({ n: a.n + s.n, ok: a.ok + s.ok }), { n: 0, ok: 0 });
    $('p-accuracy').textContent = tot.n ? `${Math.round((tot.ok / tot.n) * 100)}%` : '–';
    $('p-streak').textContent = streak();

    const days = $('p-days');
    days.innerHTML = '';
    for (let i = 13; i >= 0; i--) {
      const key = dayKeyOffset(-i);
      const d = el('div', `day ${state.days[key] ? 'on' : ''} ${i === 0 ? 'today' : ''}`, String(Number(key.slice(-2))));
      d.title = state.days[key] ? `${state.days[key]} misión(es)` : 'Sin práctica';
      days.appendChild(d);
    }

    const table = $('p-table');
    table.innerHTML = '<tr><th>Actividad</th><th>Tareas</th><th>A la primera</th></tr>';
    Object.keys(TYPE_NAMES).forEach((t) => {
      const s = state.stats[t];
      if (!s) return;
      const pct = Math.round((s.ok / s.n) * 100);
      table.insertAdjacentHTML('beforeend', `<tr><td>${TYPE_NAMES[t]}<div class="bar"><i style="width:${pct}%"></i></div></td><td>${s.n}</td><td>${pct}%</td></tr>`);
    });
    if (table.rows.length === 1) table.insertAdjacentHTML('beforeend', '<tr><td colspan="3">Todavía no hay misiones completadas.</td></tr>');

    $('s-name').value = state.name;
    $('s-level').value = state.settings.manualLevel ? String(state.level) : 'auto';
    $('s-length').value = String(state.settings.missionLength);
    $('s-voice').checked = state.settings.voice;
    $('s-autoread').checked = state.settings.autoRead;
    $('s-sfx').checked = state.settings.sfx;
    $('s-breaks').checked = state.settings.breaks;
  }

  function bindParentSettings() {
    $('s-name').addEventListener('change', (e) => { state.name = e.target.value.trim(); save(); });
    $('s-level').addEventListener('change', (e) => {
      if (e.target.value === 'auto') state.settings.manualLevel = false;
      else { state.settings.manualLevel = true; state.level = Number(e.target.value); }
      state.levelHistory = [];
      save();
      $('p-level').textContent = state.level;
    });
    $('s-length').addEventListener('change', (e) => { state.settings.missionLength = Number(e.target.value); save(); });
    [['s-voice', 'voice'], ['s-autoread', 'autoRead'], ['s-sfx', 'sfx'], ['s-breaks', 'breaks']].forEach(([id, key]) => {
      $(id).addEventListener('change', (e) => { state.settings[key] = e.target.checked; save(); });
    });
    $('btn-reset').addEventListener('click', () => {
      if (confirm('¿Borrar todo el progreso? Esta acción no se puede deshacer.')) {
        const name = state.name;
        state = defaultState();
        state.name = name;
        state.onboarded = true;
        save();
        renderParentPanel();
      }
    });
  }

  /* ---------- eventos ---------- */
  function bind() {
    $('btn-start').addEventListener('click', () => {
      state.name = $('name-input').value.trim();
      state.onboarded = true;
      save();
      Voice.speak(state.name ? `¡Hola, ${state.name}! Elige tu mundo.` : '¡Hola! Elige tu mundo.');
      renderHome();
      show('home');
    });
    $('name-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('btn-start').click(); });

    $('btn-album').addEventListener('click', () => { renderAlbum(); show('album'); });
    $('btn-album-back').addEventListener('click', () => { renderHome(); show('home'); });

    $('btn-parents').addEventListener('click', () => { renderGate(); show('parent'); });
    $('btn-parent-back').addEventListener('click', () => { renderHome(); show('home'); });
    $('btn-gate').addEventListener('click', () => {
      if (Number($('gate-input').value) === gateAnswer) renderParentPanel();
      else { $('gate-error').textContent = 'Respuesta incorrecta. Prueba otra vez.'; renderGate(); }
    });
    $('gate-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('btn-gate').click(); });
    bindParentSettings();

    $('btn-exit').addEventListener('click', () => {
      if (confirm('¿Salir de la misión? Se perderá el progreso de esta misión.')) { mission = null; renderHome(); show('home'); }
    });
    $('btn-speak').addEventListener('click', () => { if (currentSpeak) currentSpeak(); });

    $('btn-again').addEventListener('click', () => { const id = mission.world.id; beginMission(id); });
    $('btn-home-from-result').addEventListener('click', () => { renderHome(); show('home'); });

    window.addEventListener('resize', () => { const c = $('confetti'); c.width = window.innerWidth; c.height = window.innerHeight; });
  }

  /* ---------- arranque ---------- */
  function init() {
    Voice.init();
    bind();
    if (!state.onboarded) {
      show('welcome');
    } else {
      renderHome();
      show('home');
    }
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
