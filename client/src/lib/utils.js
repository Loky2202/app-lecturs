export const rand = (n) => Math.floor(Math.random() * n);
export const pickOne = (arr) => arr[rand(arr.length)];
export const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const spoken = (w) => String(w).toLowerCase();

const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const todayKey = () => fmt(new Date());
export const dayKeyOffset = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); return fmt(d); };

/* Toma n elementos distintos según una clave, evitando los ya vistos. */
export function takeDistinct(src, n, key, seen = new Set()) {
  const out = [];
  for (const item of shuffle(src)) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
    if (out.length === n) break;
  }
  return out;
}
