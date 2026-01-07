// lib/notifications/rules.ts
import { getAccounts, getTransactions, BankAccount, Transaction } from '@/lib/bank-service';
import { getUserDb } from '@/lib/db/local-db';

export interface NotificationRule {
  id: string;
  type: 'BALANCE_LOW' | 'TRANSACTION_HIGH' | 'CATEGORY_EXCEEDED';
  threshold: number;
  params?: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

const DEFAULT_RULES: NotificationRule[] = [
  { id: 'low-balance', type: 'BALANCE_LOW', threshold: 100 },
  { id: 'high-expense', type: 'TRANSACTION_HIGH', threshold: 1000 },
];

export function checkRules(userId: string): Notification[] {
  const accounts = getAccounts(userId);
  const transactions = getTransactions(userId);
  const notifications: Notification[] = [];
  const db = getUserDb(userId);

  const saveNotification = db.prepare(`
    INSERT OR IGNORE INTO notifications (id, title, body, createdAt, read)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Check Low Balance
  for (const account of accounts) {
    if (account.balance < 100) {
       const n = {
         id: `low-bal-${account.id}-${new Date().toISOString().split('T')[0]}`,
         userId,
         title: 'Low Balance Alert',
         body: `Your account ${account.name} is low on funds: ${account.balance} ${account.currencyCode}`,
         createdAt: Date.now(),
         read: false
       };
       notifications.push(n);
       saveNotification.run(n.id, n.title, n.body, n.createdAt, 0);
    }
  }

  // Check High Transactions
  for (const tx of transactions) {
    if (Math.abs(tx.amount) > 1000) {
      const n = {
        id: `high-tx-${tx.id}`,
        userId,
        title: 'High Transaction Alert',
        body: `A large transaction of ${tx.amount} ${tx.currencyCode} was detected: ${tx.description}`,
        createdAt: Date.now(),
        read: false
      };
      notifications.push(n);
      saveNotification.run(n.id, n.title, n.body, n.createdAt, 0);
    }
  }

  return notifications;
}
