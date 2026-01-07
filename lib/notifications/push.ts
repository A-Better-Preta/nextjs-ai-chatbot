import webpush from 'web-push';
import crypto from 'crypto';
import { getUserDb } from '@/lib/db/local-db';

// These should be set in .env.local
// npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@piloted.app';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function sendPushNotification(userId: string, title: string, body: string, url: string = '/') {
  const db = getUserDb(userId);
  const subscriptions = db.prepare('SELECT endpoint, p256dh, auth FROM push_subscriptions').all() as any[];

  const payload = JSON.stringify({ title, body, url });

  const promises = subscriptions.map((sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    return webpush.sendNotification(pushSubscription, payload).catch((err) => {
      if (err.statusCode === 404 || err.statusCode === 410) {
        // Subscription is no longer valid, delete it
        db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(sub.endpoint);
      } else {
        console.error('Push notification error:', err);
      }
    });
  });

  await Promise.all(promises);
}

export function saveSubscription(userId: string, subscription: any) {
  const db = getUserDb(userId);
  const { endpoint, keys } = subscription;
  const { p256dh, auth } = keys;

  db.prepare(`
    INSERT OR REPLACE INTO push_subscriptions (id, endpoint, p256dh, auth, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    endpoint,
    p256dh,
    auth,
    Date.now()
  );
}
