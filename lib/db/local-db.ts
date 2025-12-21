// lib/db/local-db.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'user_data.db');
export const localDb = new Database(dbPath);