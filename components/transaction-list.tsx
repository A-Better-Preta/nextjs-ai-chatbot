"use client";

import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, ShoppingBag, Coffee, CreditCard, Utensils } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  status: string;
}

export const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="p-4 text-center text-muted-foreground text-sm">No transactions found.</div>;
  }

  // Helper to get an icon based on description
  const getIcon = (desc: string) => {
    const d = desc.toLowerCase();
    if (d.includes("coffee") || d.includes("starbucks") || d.includes("espresso")) return <Coffee size={16} />;
    if (d.includes("restaurant") || d.includes("food") || d.includes("pizza")) return <Utensils size={16} />;
    if (d.includes("shop") || d.includes("amazon") || d.includes("hm")) return <ShoppingBag size={16} />;
    return <CreditCard size={16} />;
  };

  return (
    <div className="w-full bg-background border rounded-2xl overflow-hidden shadow-sm my-2">
      <div className="bg-muted/50 px-4 py-3 border-b flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-70">Recent Transactions</h3>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
          {transactions.length} Items
        </span>
      </div>
      
      <div className="divide-y max-h-[400px] overflow-y-auto">
        {transactions.map((tx) => {
          const isExpense = tx.amount < 0;
          return (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
              <div className="flex items-center gap-3">
                {/* Icon Circle */}
                <div className={cn(
                  "size-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  isExpense ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-green-100 text-green-600 dark:bg-green-900/30"
                )}>
                  {getIcon(tx.description)}
                </div>
                
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate leading-tight">
                    {tx.description}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {new Date(tx.date).toLocaleDateString('sv-SE', { dateStyle: 'medium' })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 ml-4">
                <div className={cn(
                  "text-sm font-black tracking-tight flex items-center gap-1",
                  isExpense ? "text-slate-900 dark:text-slate-100" : "text-green-600"
                )}>
                  {isExpense ? "" : "+"}
                  {new Intl.NumberFormat('sv-SE', { 
                    style: 'currency', 
                    currency: 'SEK',
                    signDisplay: 'never' 
                  }).format(tx.amount)}
                  {isExpense ? <ArrowDownLeft size={12} className="text-red-500" /> : <ArrowUpRight size={12} />}
                </div>
                <span className="text-[9px] uppercase font-bold opacity-40">{tx.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};