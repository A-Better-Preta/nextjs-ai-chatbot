"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
      setPermission(Notification.permission);
    }
  }, []);

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribe() {
    if (!VAPID_PUBLIC_KEY) {
      toast.error("Push notification configuration is missing.");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        await fetch("/api/notifications/subscribe", {
          method: "POST",
          body: JSON.stringify(sub),
          headers: { "Content-Type": "application/json" },
        });

        setSubscription(sub);
        toast.success("Notifications enabled!");
      }
    } catch (err) {
      console.error("Failed to subscribe:", err);
      toast.error("Failed to enable notifications.");
    }
  }

  async function unsubscribe() {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      toast.info("Notifications disabled.");
    }
  }

  if (!isSupported) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={subscription ? unsubscribe : subscribe}
      title={subscription ? "Disable Notifications" : "Enable Notifications"}
    >
      {subscription ? (
        <Bell className="h-4 w-4 text-emerald-500" />
      ) : (
        <BellOff className="h-4 w-4 text-zinc-500" />
      )}
    </Button>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
