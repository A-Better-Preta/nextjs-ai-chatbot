import { auth } from '@clerk/nextjs/server';
import { sendPushNotification } from '@/lib/notifications/push';
import { NextResponse } from 'next/server';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  try {
    await sendPushNotification(
      userId, 
      'Piloted.app Test', 
      'Your push notifications are working perfectly! 🚀',
      '/'
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send test push:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
