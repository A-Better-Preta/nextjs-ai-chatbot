// lib/db/local-db.ts
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

import { initializeUserDb } from './local-schema';

const DB_DIR = path.resolve(process.cwd(), 'user_data');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export function getUserDb(userId: string) {
  const dbPath = path.join(DB_DIR, `${userId}.db`);
  const db = new Database(dbPath);
  
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
  
  // Initialize tables
  initializeUserDb(db);
  
  return db;
}

// Deprecated: legacy connection
export const localDb = new Database(path.resolve(process.cwd(), 'user_data.db'));