import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const db = new Database('user_data.db');

// Enable foreign keys
db.pragma('foreign_keys = OFF');

// Initialize Tables
db.prepare(`
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT,
    balance REAL,
    type TEXT,
    currency_code TEXT,
    account_number TEXT,
    iban TEXT,
    raw_json TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT,
    amount REAL,
    description TEXT,
    date TEXT,
    status TEXT,
    raw_json TEXT,
    FOREIGN KEY(account_id) REFERENCES accounts(id)
  )
`).run();

function formatAmount(unscaled: string, scale: string): number {
  return parseInt(unscaled) / Math.pow(10, parseInt(scale));
}

async function runIngestion() {
  console.log("Reading Tink JSON files...");
  
  // Load the files
  const accountsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tink-accounts.json'), 'utf8'));
  const transactionsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tink-transactions.json'), 'utf8'));

  const insertAccount = db.prepare(`
  INSERT INTO accounts (id, name, balance, type, currency_code, account_number, iban, raw_json)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET 
    balance=excluded.balance, 
    account_number=excluded.account_number, 
    iban=excluded.iban,
    raw_json=excluded.raw_json
`);
  const insertTransaction = db.prepare(`
    INSERT INTO transactions (id, account_id, amount, description, date, status, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `);

  // Tink files: Accounts is an object with an 'accounts' array, 
  // Transactions is a direct array.
  const accountsList = accountsData.accounts || [];
  const transactionsList = Array.isArray(transactionsData) ? transactionsData : (transactionsData.transactions || []);

  console.log(`Processing ${accountsList.length} accounts and ${transactionsList.length} transactions...`);

  const runUpdates = db.transaction(() => {
    for (const acc of accountsList) {
      insertAccount.run(
        acc.id, 
      acc.name || 'Unknown Account', 
        acc.balance || 0, 
        acc.type || 'CHECKING', 
        acc.currencyCode || 'SEK',
        acc.accountNumber || null,
        acc.iban,
        JSON.stringify(acc)
      );
    }
for (const tx of transactionsList) {
      try {
        // Double check the transaction has the required Tink fields
        if (!tx.accountId || !tx.amount?.value) continue;

        const amount = formatAmount(tx.amount.value.unscaledValue, tx.amount.value.scale);
        
        insertTransaction.run(
          tx.id, 
          tx.accountId, 
          amount, 
          tx.descriptions?.display || 'No Description', 
          tx.dates?.booked || new Date().toISOString().split('T')[0], 
          tx.status || 'BOOKED', 
          JSON.stringify(tx)
        );
      } catch (e) {
        console.log(`Skipping invalid transaction: ${tx.id}`);
      }
    }
  });

  runUpdates();
  console.log("✅ Success! user_data.db is ready.");
}

runIngestion().catch(console.error);