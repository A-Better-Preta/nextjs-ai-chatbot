import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db'; 
import { auth } from '@clerk/nextjs/server';

export const getAccountBalances = tool({
  description: 'Get current balances for all accounts.',
  // Use inputSchema instead of parameters
  inputSchema: z.object({}), 
  execute: async ({}) => { 
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const accounts = db.prepare('SELECT * FROM accounts WHERE userId = ?').all(userId);
    return { accounts };
  },
});

export const getRecentTransactions = tool({
  description: 'Get recent bank transactions.',
  // Use inputSchema instead of parameters
  inputSchema: z.object({
    limit: z.number().describe('Number of transactions to show'),
  }),
  execute: async ({ limit }) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE userId = ? 
      ORDER BY date DESC 
      LIMIT ?
    `).all(userId, limit);

    return { transactions };
  },
});