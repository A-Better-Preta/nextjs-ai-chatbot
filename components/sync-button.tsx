"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/finance/sync", { method: "POST" });
      if (response.ok) {
        toast.success("Accounts synchronized successfully!");
        router.refresh();
      } else {
        toast.error("Failed to synchronize accounts.");
      }
    } catch (error) {
      toast.error("An error occurred during sync.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSync} 
      disabled={loading}
      variant="outline"
      className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl gap-2"
    >
      <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? "Syncing..." : "Sync Now"}
    </Button>
  );
}
