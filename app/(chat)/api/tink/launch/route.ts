import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. Get the current user ID before we leave for Tink
  const { userId } = await auth();
  
  // If no user is found, redirect to login immediately
  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const CLIENT_ID = process.env.TINK_CLIENT_ID;
  const url = new URL(request.url);
  const redirectUri = `${url.protocol}//${url.host}/api/tink/callback`;
  const scope = "accounts:read,balances:read,transactions:read";

  // 2. Build the Tink Link
  // We add the 'state' parameter and pass the userId there.
  const tinkLink = `https://link.tink.com/1.0/authorize?` + 
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&market=SE` +
    `&state=${userId}` + // <--- THIS IS THE FIX
    `&response_type=code`;

  console.log(`[Tink] Launching for user ${userId}`);
  
  return NextResponse.redirect(tinkLink);
}