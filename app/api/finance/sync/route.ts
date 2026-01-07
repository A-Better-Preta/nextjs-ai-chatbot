import { auth } from '@clerk/nextjs/server';
import { syncBankData } from '@/lib/bank-service';
import { checkRules } from '@/lib/notifications/rules';
import { NextResponse } from 'next/server';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  try {
    await syncBankData(userId, 'tink');
    const notifications = checkRules(userId);
    
    return NextResponse.json({ 
      success: true, 
      notificationsCount: notifications.length 
    });
  } catch (error) {
    console.error('Sync failed:', error);
    return new NextResponse('Sync failed', { status: 500 });
  }
}
