"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SyncButton } from "./sync-button";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

interface BankAccount {
  id: string;
  name: string;
  balance: number;
  currencyCode: string;
  accountNumber: string;
}

export function FinancialOverview() {
  const { user, isLoaded } = useUser();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchAccounts();
    }
  }, [isLoaded, user]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/finance/accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error("Failed to fetch accounts", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) return null;
  if (accounts.length === 0) {
      return (
          <div className="flex items-center gap-4 mt-8 px-4 md:px-8">
              <SyncButton />
              <p className="text-sm text-zinc-500 italic">No accounts connected yet. Click Sync to get started.</p>
          </div>
      );
  }

  return (
    <div className="w-full mt-8 px-4 md:px-8">
      <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Your Financial Empire</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-2"
              onClick={async () => {
                const res = await fetch('/api/notifications/test-push', { method: 'POST' });
                if (res.ok) toast.success("Test notification sent!");
                else toast.error("Failed to send test notification.");
              }}
            >
              <Send className="h-3 w-3" />
              Test Push
            </Button>
            <SyncButton />
          </div>
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-4 px-4 md:-mx-8 md:px-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible md:pb-0">
        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className="min-w-[280px] md:min-w-0"
          >
            <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10 rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-xl ring-1 ring-white/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground truncate">
                  {account.name}
                </CardTitle>
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-[10px]">
                  🏦
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">
                  {account.balance.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{account.currencyCode}</span>
                </div>
                <p className="text-[10px] text-muted-foreground opacity-50 font-mono">
                  {account.accountNumber}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
