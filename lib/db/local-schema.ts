// lib/db/local-schema.ts

export const CREATE_ACCOUNTS_TABLE = `
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    accountNumber TEXT,
    balance REAL,
    currencyCode TEXT,
    name TEXT,
    bankId TEXT,
    type TEXT,
    lastRefreshed INTEGER
  )
`;

export const CREATE_TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    accountId TEXT,
    amount REAL,
    currencyCode TEXT,
    description TEXT,
    date INTEGER,
    category TEXT,
    pending INTEGER,
    FOREIGN KEY(accountId) REFERENCES accounts(id)
  )
`;

export const CREATE_BANK_TOKENS_TABLE = `
  CREATE TABLE IF NOT EXISTS bank_tokens (
    provider TEXT PRIMARY KEY,
    accessToken TEXT,
    refreshToken TEXT,
    expiresAt INTEGER
  )
`;

export const CREATE_NOTIFICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT,
    body TEXT,
    createdAt INTEGER,
    read INTEGER DEFAULT 0
  )
`;

export const CREATE_PUSH_SUBSCRIPTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id TEXT PRIMARY KEY,
    endpoint TEXT UNIQUE,
    p256dh TEXT,
    auth TEXT,
    createdAt INTEGER
  )
`;

export function initializeUserDb(db: any) {
  db.exec(CREATE_ACCOUNTS_TABLE);
  db.exec(CREATE_TRANSACTIONS_TABLE);
  db.exec(CREATE_BANK_TOKENS_TABLE);
  db.exec(CREATE_NOTIFICATIONS_TABLE);
  db.exec(CREATE_PUSH_SUBSCRIPTIONS_TABLE);
}
