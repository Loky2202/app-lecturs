/* Voz con el sintetizador del dispositivo (no necesita internet). */
const cfg = { enabled: true, rate: 0.85 };
let voice = null;
const ready = typeof window !== 'undefined' && 'speechSynthesis' in window;

function pickVoice() {
  const all = speechSynthesis.getVoices();
  const norm = (l) => (l || '').toLowerCase().replace('_', '-');
  const es = all.filter((v) => norm(v.lang).startsWith('es'));
  const pref = ['es-mx', 'es-us', 'es-419', 'es-co', 'es-ar', 'es-cl', 'es-pe', 'es-es'];
  voice = pref.map((p) => es.find((v) => norm(v.lang) === p)).find(Boolean) || es[0] || null;
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
  speak(text, opts = {}) {
    if (!ready || !cfg.enabled || !text) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice ? voice.lang : 'es-ES';
      if (voice) u.voice = voice;
      u.rate = opts.rate || cfg.rate;
      u.pitch = 1.05;
      speechSynthesis.speak(u);
    } catch { /* ignorar */ }
  },
  stop() { if (ready) try { speechSynthesis.cancel(); } catch { /* ignorar */ } },
  hasSpanishVoice() { return !!voice; },
};
