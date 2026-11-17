/* Imágenes, grabaciones e iconos personalizados (se cargan del servidor).
   Si hay imagen para una palabra se usa; si no, el icono (emoji).
   Si hay grabación para una palabra, letra o sílaba se usa; si no, la voz del dispositivo. */
import { reactive } from 'vue';
import { api } from '../api.js';

export const media = reactive({ image: {}, audio: {}, icon: {} });

export async function loadMedia() {
  try {
    const rows = await api.media();
    const next = { image: {}, audio: {}, icon: {} };
    for (const r of rows) if (next[r.kind]) next[r.kind][r.key] = r.kind === 'icon' ? r.text : r.updated_at;
    Object.assign(media, next);
  } catch { /* sin servidor: se usan los iconos y la voz por defecto */ }
}

const url = (kind, key) => (media[kind][key] ? `/api/media/${kind}/${encodeURIComponent(key)}?v=${media[kind][key]}` : null);
export const imageUrl = (word) => url('image', word);
export const audioUrl = (key) => url('audio', key);
export const iconFor = (word, fallback) => media.icon[word] || fallback;

/* Clave de grabación para un texto suelto ("gato", "ma"): palabra y, si no, sílaba. */
export function recordingFor(text) {
  const t = String(text).replace(/[.,:;!¡¿?]/g, '').trim().toUpperCase();
  if (!t || t.includes(' ')) return null;
  return audioUrl(`w:${t}`) || audioUrl(`s:${t}`);
}

export async function saveMedia(kind, key, blob) {
  const r = await api.putMedia(kind, key, blob);
  media[kind][key] = r.updated_at;
}
export async function saveIcon(key, emoji) {
  const r = await api.setIcon(key, emoji);
  media.icon[key] = r.text;
}
export async function removeMedia(kind, key) {
  await api.deleteMedia(kind, key);
  delete media[kind][key];
}

/* Reduce una foto a 512 px como máximo antes de subirla. */
export async function shrinkImage(file) {
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
