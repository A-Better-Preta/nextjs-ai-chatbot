import { auth } from '@clerk/nextjs/server';
import { saveSubscription } from '@/lib/notifications/push';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const subscription = await request.json();
    saveSubscription(userId, subscription);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save subscription:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
