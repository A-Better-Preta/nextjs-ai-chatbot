import { auth } from '@clerk/nextjs/server';
import { getAccounts } from '@/lib/bank-service';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const accounts = getAccounts(userId);
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
