/* ==========================================================
   Misión Lectura — servidor
   API REST (perfiles, progreso, eventos, estadísticas, padres)
   + archivos estáticos de la interfaz compilada.
   ========================================================== */
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { openDb, newToken } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = process.env.DATA_DIR || join(__dirname, '..', '..', 'data');
const PUBLIC_DIR = process.env.PUBLIC_DIR || join(__dirname, '..', 'public');
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

const db = openDb(DATA_DIR);
const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

/* ---------- sesiones de padres (en memoria) ---------- */
const parentTokens = new Map();
function requireParent(req, reply, done) {
  const token = req.headers['x-parent-token'];
  const exp = token && parentTokens.get(token);
  if (!exp || exp < Date.now()) {
    if (token) parentTokens.delete(token);
    reply.code(401).send({ error: 'Se necesita el PIN de padres.' });
    return;
  }
  parentTokens.set(token, Date.now() + TOKEN_TTL_MS);
  done();
}

/* ---------- consultas preparadas ---------- */
const q = {
  profiles: db.prepare('SELECT p.*, pr.data AS progress FROM profiles p LEFT JOIN progress pr ON pr.profile_id = p.id ORDER BY p.created_at'),
  profile: db.prepare('SELECT * FROM profiles WHERE id = ?'),
  insertProfile: db.prepare('INSERT INTO profiles (name, avatar, favorite, created_at) VALUES (?, ?, ?, ?)'),
  updateProfile: db.prepare('UPDATE profiles SET name = ?, avatar = ?, favorite = ? WHERE id = ?'),
  deleteProfile: db.prepare('DELETE FROM profiles WHERE id = ?'),
  progress: db.prepare('SELECT data, updated_at FROM progress WHERE profile_id = ?'),
  upsertProgress: db.prepare(`INSERT INTO progress (profile_id, data, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(profile_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`),
  insertEvent: db.prepare('INSERT INTO events (profile_id, ts, kind, game, lesson_id, world, correct, first_try, duration_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'),
  eventsSince: db.prepare('SELECT * FROM events WHERE profile_id = ? AND ts >= ? ORDER BY ts'),
  allEvents: db.prepare('SELECT * FROM events WHERE profile_id = ? ORDER BY ts'),
  setting: db.prepare('SELECT value FROM settings WHERE key = ?'),
  setSetting: db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'),
  customWords: db.prepare('SELECT * FROM custom_words ORDER BY created_at'),
  insertWord: db.prepare('INSERT INTO custom_words (word, syllables, emoji, world, created_at) VALUES (?, ?, ?, ?, ?)'),
  deleteWord: db.prepare('DELETE FROM custom_words WHERE id = ?'),
};

const summarize = (row) => {
  let p = {};
  try { p = row.progress ? JSON.parse(row.progress) : {}; } catch { p = {}; }
  return {
    id: row.id, name: row.name, avatar: row.avatar, favorite: row.favorite, created_at: row.created_at,
    stars: p.stars || 0, level: p.level || 1,
    lessonsDone: p.lessons ? Object.values(p.lessons).filter((l) => l.done).length : 0,
  };
};
const localDay = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/* ---------- API ---------- */
app.get('/api/health', async () => ({ ok: true, time: Date.now() }));

app.get('/api/profiles', async () => q.profiles.all().map(summarize));

app.post('/api/profiles', async (req, reply) => {
  const { name, avatar, favorite } = req.body || {};
  const clean = String(name || '').trim().slice(0, 20);
  if (!clean) return reply.code(400).send({ error: 'Falta el nombre.' });
  const r = q.insertProfile.run(clean, String(avatar || '🦕').slice(0, 8), String(favorite || 'dinos').slice(0, 20), Date.now());
  return summarize({ ...q.profile.get(r.lastInsertRowid), progress: null });
});

app.put('/api/profiles/:id', { preHandler: requireParent }, async (req, reply) => {
  const cur = q.profile.get(Number(req.params.id));
  if (!cur) return reply.code(404).send({ error: 'Perfil no encontrado.' });
  const { name, avatar, favorite } = req.body || {};
  q.updateProfile.run(String(name || cur.name).trim().slice(0, 20), String(avatar || cur.avatar).slice(0, 8), String(favorite || cur.favorite).slice(0, 20), cur.id);
  return summarize({ ...q.profile.get(cur.id), progress: q.progress.get(cur.id)?.data || null });
});

app.delete('/api/profiles/:id', { preHandler: requireParent }, async (req) => {
  q.deleteProfile.run(Number(req.params.id));
  return { ok: true };
});

app.get('/api/profiles/:id/progress', async (req, reply) => {
  const id = Number(req.params.id);
  if (!q.profile.get(id)) return reply.code(404).send({ error: 'Perfil no encontrado.' });
  const row = q.progress.get(id);
  return { data: row ? JSON.parse(row.data) : null, updated_at: row?.updated_at || null };
});

app.put('/api/profiles/:id/progress', async (req, reply) => {
  const id = Number(req.params.id);
  if (!q.profile.get(id)) return reply.code(404).send({ error: 'Perfil no encontrado.' });
  const data = req.body?.data;
  if (!data || typeof data !== 'object') return reply.code(400).send({ error: 'Datos inválidos.' });
  const now = Date.now();
  q.upsertProgress.run(id, JSON.stringify(data), now);
  return { ok: true, updated_at: now };
});

app.post('/api/profiles/:id/events', async (req, reply) => {
  const id = Number(req.params.id);
  if (!q.profile.get(id)) return reply.code(404).send({ error: 'Perfil no encontrado.' });
  const events = Array.isArray(req.body?.events) ? req.body.events.slice(0, 500) : [];
  const insertAll = db.prepare('BEGIN');
  insertAll.run();
  try {
    for (const e of events) {
      q.insertEvent.run(id, Number(e.ts) || Date.now(), String(e.kind || 'task').slice(0, 30), e.game ? String(e.game).slice(0, 30) : null,
        e.lesson_id ? String(e.lesson_id).slice(0, 40) : null, e.world ? String(e.world).slice(0, 20) : null,
        e.correct == null ? null : (e.correct ? 1 : 0), e.first_try == null ? null : (e.first_try ? 1 : 0), e.duration_ms == null ? null : Number(e.duration_ms));
    }
    db.prepare('COMMIT').run();
  } catch (err) {
    db.prepare('ROLLBACK').run();
    throw err;
  }
  return { ok: true, saved: events.length };
});

app.get('/api/profiles/:id/stats', { preHandler: requireParent }, async (req, reply) => {
  const id = Number(req.params.id);
  if (!q.profile.get(id)) return reply.code(404).send({ error: 'Perfil no encontrado.' });
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 14));
  const since = Date.now() - days * 86400000;
  const rows = q.eventsSince.all(id, since);
  const byDay = {};
  const byGame = {};
  const byLesson = {};
  for (const e of rows) {
    const day = localDay(e.ts);
    byDay[day] = byDay[day] || { day, tasks: 0, correct: 0, lessons: 0, missions: 0, stories: 0, minutes: 0 };
    const d = byDay[day];
    if (e.kind === 'task') { d.tasks++; if (e.first_try) d.correct++; d.minutes += (e.duration_ms || 0) / 60000; }
    if (e.kind === 'lesson') d.lessons++;
    if (e.kind === 'mission') d.missions++;
    if (e.kind === 'story') d.stories++;
    if (e.kind !== 'task' && e.duration_ms) d.minutes += e.duration_ms / 60000;
    if (e.kind === 'task' && e.game) {
      byGame[e.game] = byGame[e.game] || { game: e.game, n: 0, ok: 0 };
      byGame[e.game].n++; if (e.first_try) byGame[e.game].ok++;
    }
    if (e.kind === 'task' && e.lesson_id) {
      byLesson[e.lesson_id] = byLesson[e.lesson_id] || { lesson: e.lesson_id, n: 0, ok: 0 };
      byLesson[e.lesson_id].n++; if (e.first_try) byLesson[e.lesson_id].ok++;
    }
  }
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = localDay(Date.now() - i * 86400000);
    out.push(byDay[day] || { day, tasks: 0, correct: 0, lessons: 0, missions: 0, stories: 0, minutes: 0 });
  }
  return { days: out.map((d) => ({ ...d, minutes: Math.round(d.minutes * 10) / 10 })), byGame: Object.values(byGame), byLesson: Object.values(byLesson), totalEvents: rows.length };
});

app.get('/api/profiles/:id/export', { preHandler: requireParent }, async (req, reply) => {
  const id = Number(req.params.id);
  const profile = q.profile.get(id);
  if (!profile) return reply.code(404).send({ error: 'Perfil no encontrado.' });
  const row = q.progress.get(id);
  reply.header('Content-Disposition', `attachment; filename="mision-lectura-${profile.name}.json"`);
  return { profile, progress: row ? JSON.parse(row.data) : null, events: q.allEvents.all(id), exported_at: new Date().toISOString() };
});

/* padres */
app.post('/api/parent/login', async (req, reply) => {
  const pin = String(req.body?.pin || '');
  const real = q.setting.get('parent_pin')?.value;
  if (!pin || pin !== real) {
    await new Promise((r) => setTimeout(r, 500));
    return reply.code(401).send({ error: 'PIN incorrecto.' });
  }
  const token = newToken();
  parentTokens.set(token, Date.now() + TOKEN_TTL_MS);
  return { token };
});
app.get('/api/parent/check', { preHandler: requireParent }, async () => ({ ok: true }));
app.put('/api/parent/pin', { preHandler: requireParent }, async (req, reply) => {
  const pin = String(req.body?.pin || '').trim();
  if (!/^\d{4,8}$/.test(pin)) return reply.code(400).send({ error: 'El PIN debe tener entre 4 y 8 dígitos.' });
  q.setSetting.run('parent_pin', pin);
  return { ok: true };
});

/* palabras personalizadas */
const mapWord = (r) => ({ id: r.id, w: r.word, s: r.syllables.split('-'), e: r.emoji, world: r.world, custom: true });
app.get('/api/words', async () => q.customWords.all().map(mapWord));
app.post('/api/words', { preHandler: requireParent }, async (req, reply) => {
  const { word, syllables, emoji, world } = req.body || {};
  const w = String(word || '').trim().toUpperCase().slice(0, 20);
  const s = String(syllables || '').trim().toUpperCase().replace(/\s+/g, '').split('-').filter(Boolean);
  const e = String(emoji || '').trim().slice(0, 8);
  if (!w || !s.length || !e) return reply.code(400).send({ error: 'Faltan datos: palabra, sílabas (separadas por guion) y emoji.' });
  if (s.join('') !== w.replace(/-/g, '')) return reply.code(400).send({ error: 'Las sílabas unidas deben formar la palabra.' });
  const r = q.insertWord.run(w, s.join('-'), e, String(world || 'general').slice(0, 20), Date.now());
  return mapWord({ id: r.lastInsertRowid, word: w, syllables: s.join('-'), emoji: e, world: world || 'general' });
});
app.delete('/api/words/:id', { preHandler: requireParent }, async (req) => {
  q.deleteWord.run(Number(req.params.id));
  return { ok: true };
});

/* ---------- interfaz (archivos estáticos + SPA) ---------- */
if (existsSync(PUBLIC_DIR)) {
  await app.register(fastifyStatic, { root: PUBLIC_DIR, prefix: '/', cacheControl: true, maxAge: '1h', immutable: false });
  app.setNotFoundHandler((req, reply) => {
    if (req.raw.url.startsWith('/api/')) return reply.code(404).send({ error: 'No encontrado.' });
    return reply.sendFile('index.html');
  });
} else {
  app.log.warn(`No existe ${PUBLIC_DIR}: solo se sirve la API (compila la interfaz con "npm run build" en client/).`);
}

/* ---------- arranque ---------- */
try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`Misión Lectura lista en http://${HOST}:${PORT} (datos en ${DATA_DIR})`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

const shutdown = () => { app.close().then(() => { db.close(); process.exit(0); }); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
