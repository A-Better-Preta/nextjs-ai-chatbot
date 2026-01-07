// lib/bank-service.ts
import { getUserDb } from '@/lib/db/local-db';

export interface BankAccount {
  id: string;
  accountNumber: string;
  balance: number;
  currencyCode: string;
  name: string;
  bankId: string;
  type: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  currencyCode: string;
  description: string;
  date: number;
  category: string;
  pending: boolean;
}

export async function syncBankData(userId: string, provider: 'tink' | 'gocardless') {
  const db = getUserDb(userId);
  
  // 1. Get tokens (Mocked for now)
  const token = db.prepare('SELECT * FROM bank_tokens WHERE provider = ?').get(provider);
  
  if (!token && provider === 'tink') {
    // Initial setup mock
    db.prepare('INSERT OR REPLACE INTO bank_tokens (provider, accessToken, refreshToken, expiresAt) VALUES (?, ?, ?, ?)')
      .run(provider, 'mock_access', 'mock_refresh', Date.now() + 3600000);
  }

  // 2. Fetch data (In real world, call Tink API here)
  // For this demo, we can simulate fetching from a source
  console.log(`Syncing ${provider} data for user ${userId}...`);

  // 3. Save Accounts
  const saveAccount = db.prepare(`
    INSERT OR REPLACE INTO accounts (id, accountNumber, balance, currencyCode, name, bankId, type, lastRefreshed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 4. Save Transactions
  const saveTransaction = db.prepare(`
    INSERT OR REPLACE INTO transactions (id, accountId, amount, currencyCode, description, date, category, pending)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    const fs = require('fs');
    const path = require('path');
    
    // Load mock accounts
    if (fs.existsSync(path.join(process.cwd(), 'tink-accounts.json'))) {
      const { accounts } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tink-accounts.json'), 'utf8'));
      for (const account of accounts) {
        saveAccount.run(
          account.id,
          account.accountNumber,
          account.balance,
          account.currencyCode,
          account.name,
          account.bankId,
          account.type,
          Date.now()
        );
      }
    }

    // Load mock transactions
    if (fs.existsSync(path.join(process.cwd(), 'tink-transactions.json'))) {
      const rawTransactions = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tink-transactions.json'), 'utf8'));
      // Handle both array format and {transactions: []} format
      const transactions = Array.isArray(rawTransactions) ? rawTransactions : rawTransactions.transactions;
      
      for (const tx of transactions) {
        try {
          // Parse Tink's nested format
          const amount = parseFloat(tx.amount?.value?.unscaledValue || tx.amount || 0) / Math.pow(10, parseInt(tx.amount?.value?.scale || 0));
          const description = tx.descriptions?.display || tx.descriptions?.original || tx.description || 'Unknown';
          const date = tx.dates?.booked || tx.date;
          const currencyCode = tx.amount?.currencyCode || tx.currencyCode || 'SEK';
          const pending = tx.status === 'PENDING' ? 1 : 0;
          
          // Convert date string to timestamp
          const dateTimestamp = date ? new Date(date).getTime() : Date.now();
          
          // Categorize based on description
          let category = 'Other';
          const desc = description.toLowerCase();
          if (desc.includes('ica') || desc.includes('coop') || desc.includes('hemköp')) category = 'Groceries';
          else if (desc.includes('shell') || desc.includes('bensin')) category = 'Transport';
          else if (desc.includes('spotify') || desc.includes('netflix')) category = 'Entertainment';
          else if (desc.includes('lön') || desc.includes('salary')) category = 'Income';
          else if (desc.includes('hyra') || desc.includes('rent')) category = 'Housing';
          else if (desc.includes('telia') || desc.includes('bredband')) category = 'Utilities';
          
          saveTransaction.run(
            tx.id,
            tx.accountId,
            amount,
            currencyCode,
            description,
            dateTimestamp,
            category,
            pending
          );
        } catch (txError: any) {
          // Skip transactions with invalid account references
          if (txError.code !== 'SQLITE_CONSTRAINT_FOREIGNKEY') {
            console.error(`Error inserting transaction ${tx.id}:`, txError);
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to load mock data files', err);
  }

  return { success: true };
}

export function getAccounts(userId: string): BankAccount[] {
  const db = getUserDb(userId);
  return db.prepare('SELECT * FROM accounts').all() as BankAccount[];
}

export function getTransactions(userId: string, accountId?: string): Transaction[] {
  const db = getUserDb(userId);
  if (accountId) {
    return db.prepare('SELECT * FROM transactions WHERE accountId = ? ORDER BY date DESC').all(accountId) as Transaction[];
  }
  return db.prepare('SELECT * FROM transactions ORDER BY date DESC').all() as Transaction[];
}
