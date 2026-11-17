/* Voz: grabaciones de la familia cuando existen y, si no, el sintetizador
   del dispositivo (no necesita internet). */
import { recordingFor, audioUrl } from './media.js';

const cfg = { enabled: true, rate: 0.85 };
let voice = null;
let turn = 0;
let player = null;
const ready = typeof window !== 'undefined' && 'speechSynthesis' in window;

function pickVoice() {
  const all = speechSynthesis.getVoices();
  const norm = (l) => (l || '').toLowerCase().replace('_', '-');
  const es = all.filter((v) => norm(v.lang).startsWith('es'));
  const pref = ['es-mx', 'es-us', 'es-419', 'es-co', 'es-ar', 'es-cl', 'es-pe', 'es-es'];
  voice = pref.map((p) => es.find((v) => norm(v.lang) === p)).find(Boolean) || es[0] || null;
}

function synth(text, opts, done) {
  if (!ready) return done();
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice ? voice.lang : 'es-ES';
    if (voice) u.voice = voice;
    u.rate = opts.rate || cfg.rate;
    u.pitch = 1.05;
    u.onend = done;
    u.onerror = done;
    speechSynthesis.speak(u);
  } catch { done(); }
}

function playFile(src, done, fail) {
  player = new Audio(src);
  player.onended = done;
  player.onerror = fail;
  player.play().catch(fail);
}

/* Parte el texto en frases y marca las que tienen grabación ("Escucha: gato." → voz + grabación). */
function plan(text) {
  const parts = [];
  for (const piece of String(text).split(/(?<=[.,:;!?])\s+/)) {
    const src = recordingFor(piece);
    const last = parts[parts.length - 1];
    if (src) parts.push({ src, text: piece });
    else if (last && !last.src) last.text += ` ${piece}`;
    else parts.push({ text: piece });
  }
  return parts;
}

export const Voice = {
  available: ready,
  init() {
    if (!ready) return;
    pickVoice();
    speechSynthesis.addEventListener('voiceschanged', pickVoice);
  },
  configure({ enabled, rate }) {
    if (enabled !== undefined) cfg.enabled = enabled;
    if (rate !== undefined) cfg.rate = rate;
  },
  /* opts.rec: clave de una grabación que sustituye a todo el texto (p. ej. "l:M"). */
  speak(text, opts = {}) {
    if (!cfg.enabled || !text) return;
    this.stop();
    const mine = turn;
    const whole = opts.rec && audioUrl(opts.rec);
    const parts = whole ? [{ src: whole, text }] : plan(text);
    const next = (i) => {
      if (mine !== turn || i >= parts.length) return;
      const p = parts[i];
      const go = () => next(i + 1);
      const say = () => { if (mine === turn) synth(p.text, opts, go); };
      if (p.src) playFile(p.src, go, say); else say();
    };
    next(0);
  },
  stop() {
    turn++;
    if (player) { player.onended = null; player.onerror = null; player.pause(); player = null; }
    if (ready) try { speechSynthesis.cancel(); } catch { /* ignorar */ }
  },
  hasSpanishVoice() { return !!voice; },
};
