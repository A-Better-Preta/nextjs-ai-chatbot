import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'user_data.db');
export const db = new Database(dbPath);

// Initialize the database structure to support Tink data
// This ensures userId, IBAN, and raw_json are preserved
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT,
    balance REAL,
    type TEXT,
    currency_code TEXT,
    account_number TEXT,
    iban TEXT,
    raw_json TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT,
    account_id TEXT,
    amount REAL,
    description TEXT,
    date TEXT,
    status TEXT,
    raw_json TEXT,
    FOREIGN KEY(account_id) REFERENCES accounts(id)
  );
`);