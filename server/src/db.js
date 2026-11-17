/* Base de datos SQLite (módulo nativo de Node 22, sin dependencias). */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomInt } from 'node:crypto';

export function openDb(dataDir) {
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(join(dataDir, 'mision-lectura.sqlite'));
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL DEFAULT '🦕',
      favorite TEXT NOT NULL DEFAULT 'dinos',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS progress (
      profile_id INTEGER PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      ts INTEGER NOT NULL,
      kind TEXT NOT NULL,
      game TEXT,
      lesson_id TEXT,
      world TEXT,
      correct INTEGER,
      first_try INTEGER,
      duration_ms INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_events_profile_ts ON events(profile_id, ts);
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS custom_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      syllables TEXT NOT NULL,
      emoji TEXT NOT NULL,
      world TEXT NOT NULL DEFAULT 'general',
      created_at INTEGER NOT NULL
    );
  `);

  // Migración: imagen opcional para palabras personalizadas
  const wordCols = db.prepare('PRAGMA table_info(custom_words)').all().map((c) => c.name);
  if (!wordCols.includes('image')) db.exec('ALTER TABLE custom_words ADD COLUMN image BLOB');
  if (!wordCols.includes('image_type')) db.exec('ALTER TABLE custom_words ADD COLUMN image_type TEXT');

  // PIN de padres por defecto (se puede cambiar desde el panel)
  const pin = db.prepare('SELECT value FROM settings WHERE key = ?').get('parent_pin');
  if (!pin) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('parent_pin', '1234');
  }
  return db;
}

export const newToken = () => Array.from({ length: 32 }, () => randomInt(0, 16).toString(16)).join('');
