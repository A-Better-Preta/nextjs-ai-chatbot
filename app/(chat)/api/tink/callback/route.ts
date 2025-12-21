import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const stateUserId = searchParams.get('state'); // <--- Recover the ID we passed in launch

  // 1. Identity Fallback: Get userId from session, or state if session failed
  const { userId: sessionUserId } = await auth();
  const userId = sessionUserId || stateUserId;

  // 2. Guard Clause: If anything is missing or Tink sent an error
  if (errorParam || !code || !userId) {
    console.log(`[Tink Callback] Guard triggered. Error: ${errorParam}, Code: ${!!code}, User: ${userId}`);
    
    return new NextResponse(
      `<html><body><script>
        if (window.opener) { window.close(); } 
        else { window.location.href = '${origin}/?error=cancelled'; }
      </script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  try {
    // 3. Token Exchange
    const tokenResp = await fetch('https://api.tink.com/api/v1/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.TINK_CLIENT_ID!,
        client_secret: process.env.TINK_CLIENT_SECRET!,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResp.json();
    if (!tokenData.access_token) throw new Error("Failed to exchange token");

    // 4. Fetch Accounts
    const accsResp = await fetch('https://api.tink.com/api/v1/accounts/list', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    });
    const accountsData = await accsResp.json();

    // 5. Database Sync
    // Ensure you have run: ALTER TABLE accounts ADD COLUMN userId TEXT;
    const insertAccount = db.prepare(`
      INSERT OR REPLACE INTO accounts (id, userId, name, balance, type)
      VALUES (?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
      accountsData.accounts.forEach((acc: any) => {
        // Tink V1 scale logic: 1050 with scale 2 = 10.50
        const rawBalance = acc.currencyDenominatedBalance;
        const balance = rawBalance.unscaledValue / Math.pow(10, rawBalance.scale);
        
        insertAccount.run(acc.id, userId, acc.name, balance, acc.type);
      });
    })();

    console.log(`[Database] Synced ${accountsData.accounts.length} accounts for ${userId}`);

    // 6. Final Handshake: Close and Notify Parent
    return new NextResponse(
      `<html><body><script>
        if (window.opener) {
          window.opener.postMessage('tink-success', '${origin}');
          window.close();
        } else {
          window.location.href = '${origin}/?success=bank_connected';
        }
      </script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (err: any) {
    console.error("[Tink Callback Error]", err);
    return new NextResponse(`<html><body><script>window.close();</script></body></html>`, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}