/* Cliente de la API del servidor. */
const BASE = '/api';
let parentToken = sessionStorage.getItem('parentToken') || '';

async function request(method, path, body, parent = false, keepalive = false) {
  // Sin cuerpo no se envía Content-Type: Fastify rechaza un JSON vacío (los DELETE fallaban).
  const headers = body === undefined ? {} : { 'Content-Type': 'application/json' };
  if (parent && parentToken) headers['x-parent-token'] = parentToken;
  // keepalive: la petición sobrevive aunque se cierre la pestaña (guardado al salir)
  const res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), keepalive });
  let data = null;
  try { data = await res.json(); } catch { /* sin cuerpo */ }
  if (!res.ok) {
    const err = new Error(data?.error || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function upload(path, blob) {
  const res = await fetch(BASE + path, { method: 'PUT', headers: { 'Content-Type': blob.type, 'x-parent-token': parentToken }, body: blob });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || (res.status === 413 ? 'El archivo es demasiado grande.' : `Error ${res.status}`));
  return data;
}
const mediaPath = (kind, key) => `/media/${kind}/${encodeURIComponent(key)}`;

export const api = {
  setParentToken(t) { parentToken = t || ''; if (t) sessionStorage.setItem('parentToken', t); else sessionStorage.removeItem('parentToken'); },
  hasParentToken: () => !!parentToken,
  health: () => request('GET', '/health'),
  profiles: () => request('GET', '/profiles'),
  createProfile: (p) => request('POST', '/profiles', p),
  updateProfile: (id, p) => request('PUT', `/profiles/${id}`, p, true),
  deleteProfile: (id) => request('DELETE', `/profiles/${id}`, undefined, true),
  progress: (id) => request('GET', `/profiles/${id}/progress`),
  saveProgress: (id, data) => request('PUT', `/profiles/${id}/progress`, { data }, false, true),
  sendEvents: (id, events) => request('POST', `/profiles/${id}/events`, { events }, false, true),
  stats: (id, days = 14) => request('GET', `/profiles/${id}/stats?days=${days}`, undefined, true),
  exportUrl: (id) => `${BASE}/profiles/${id}/export`,
  parentLogin: (pin) => request('POST', '/parent/login', { pin }),
  parentCheck: () => request('GET', '/parent/check', undefined, true),
  setPin: (pin) => request('PUT', '/parent/pin', { pin }, true),
  customWords: () => request('GET', '/words'),
  addWord: (w) => request('POST', '/words', w, true),
  deleteWord: (id) => request('DELETE', `/words/${id}`, undefined, true),
  media: () => request('GET', '/media'),
  putMedia: (kind, key, blob) => upload(mediaPath(kind, key), blob),
  setIcon: (key, emoji) => request('PUT', mediaPath('icon', key), { emoji }, true),
  deleteMedia: (kind, key) => request('DELETE', mediaPath(kind, key), undefined, true),
};
