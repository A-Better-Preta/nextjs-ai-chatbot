import Database from 'better-sqlite3';
import path from 'path';

// Connect to your local file
const dbPath = path.resolve(process.cwd(), 'user_data.db');
export const db = new Database(dbPath);