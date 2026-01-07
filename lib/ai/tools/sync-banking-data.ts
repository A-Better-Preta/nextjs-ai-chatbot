// lib/ai/tools/sync-banking-data.ts
import { z } from 'zod';
import { syncBankData } from '../../bank-service';
import { auth } from '@clerk/nextjs/server';

export const syncBankingData = {
  description: 'Synchronize banking data from a third-party provider (e.g., Tink).',
  inputSchema: z.object({
    provider: z.enum(['tink', 'gocardless']).describe('The bank data provider to sync from.'),
  }),
  execute: async ({ provider }: { provider: 'tink' | 'gocardless' }) => {
    const { userId } = await auth();
    if (!userId) return { error: 'Not authenticated' };

    await syncBankData(userId, provider);
    return { success: true, message: `Successfully synced data from ${provider}.` };
  },
};
