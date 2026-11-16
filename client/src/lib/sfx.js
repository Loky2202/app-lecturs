/* Sonidos cortos generados con WebAudio (sin archivos). */
let ctx = null;
let enabled = true;

function tone(freq, start, dur, type = 'sine', gain = 0.18) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = ctx.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const Sfx = {
  configure({ enabled: e }) { if (e !== undefined) enabled = e; },
  play(kind) {
    if (!enabled) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      if (kind === 'ok') [523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.18));
      else if (kind === 'bad') tone(180, 0, 0.3, 'sawtooth', 0.08);
      else if (kind === 'win') [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.3));
      else if (kind === 'tap') tone(660, 0, 0.08, 'triangle', 0.1);
      else if (kind === 'tick') tone(880, 0, 0.05, 'square', 0.05);
      else if (kind === 'unlock') [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.25, 'triangle'));
    } catch { /* sin audio */ }
  },
};
