// lib/ai/tools/get-financial-overview.ts
import { z } from 'zod';
import { getAccounts, getTransactions } from '../../bank-service';
import { auth } from '@clerk/nextjs/server';

export const getFinancialOverview = {
  description: 'Get an overview of the users bank accounts and recent transactions.',
  inputSchema: z.object({}),
  execute: async () => {
    const { userId } = await auth();
    if (!userId) return { error: 'Not authenticated' };

    const accounts = getAccounts(userId);
    const transactions = getTransactions(userId);

    return {
      accounts,
      recentTransactions: transactions.slice(0, 10),
    };
  },
};
