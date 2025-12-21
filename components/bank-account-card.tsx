"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy, CreditCard } from "lucide-react";

interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
  currency_code: string;
  account_number: string | null;
  iban: string | null;
  raw_json?: string;
}

export const BankAccountCard = ({ accounts }: { accounts: Account[] }) => {
  if (!accounts || accounts.length === 0) return null;

  return (
    <div className="grid gap-4 w-full sm:grid-cols-1 md:grid-cols-2 py-2">
      {accounts.map((acc) => (
        <SingleAccountCard key={acc.id} acc={acc} />
      ))}
    </div>
  );
};

const SingleAccountCard = ({ acc }: { acc: Account }) => {
  const [displayMode, setDisplayMode] = useState<"iban" | "number">("iban");
  const [copied, setCopied] = useState(false);

  // Fallback logic for Tink's varied identifier formats
  const accountNumber = acc.account_number || "N/A";
  const iban = acc.iban || "";
  
  const activeValue = displayMode === "iban" ? iban : accountNumber;
  const label = displayMode === "iban" ? "IBAN" : "Account Number";

  const copyToClipboard = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't flip the card when clicking copy
    if (!text || text === "N/A") return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => setDisplayMode(prev => prev === "iban" ? "number" : "iban")}
      className={cn(
        "relative overflow-hidden flex flex-col p-6 rounded-2xl border shadow-xl transition-all cursor-pointer group active:scale-[0.98] h-48",
        acc.balance >= 0 
          ? "bg-gradient-to-br from-zinc-900 to-black text-white border-zinc-800" 
          : "bg-gradient-to-br from-red-950 to-zinc-900 text-white border-red-900/30"
      )}
    >
      {/* Decorative Background Pattern */}
      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
        <CreditCard size={120} />
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{acc.type}</span>
          <span className="font-medium text-lg tracking-tight">{acc.name}</span>
        </div>
        
        <div className="bg-white/5 px-2.5 py-1 rounded-md text-[10px] font-mono border border-white/10 backdrop-blur-md text-zinc-400">
          {accountNumber.slice(-4).padStart(accountNumber.length, '•')}
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <div className="flex items-baseline gap-1.5 mb-4">
          <span className="text-3xl font-bold tracking-tighter">
            {new Intl.NumberFormat("sv-SE", { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            }).format(acc.balance)}
          </span>
          <span className="text-sm font-medium text-zinc-500 uppercase">{acc.currency_code}</span>
        </div>

        <div className="pt-3 border-t border-white/5 flex justify-between items-center relative z-10">
          <div className="flex flex-col truncate">
            <span className="text-[8px] uppercase font-black tracking-widest text-zinc-600 mb-0.5">{label}</span>
            <p className="text-[11px] font-mono tracking-wider truncate text-zinc-300">
              {activeValue ? (activeValue.match(/.{1,4}/g)?.join(" ") || activeValue) : "Not Provided"}
            </p>
          </div>
          <button
            onClick={(e) => copyToClipboard(activeValue, e)}
            className="ml-2 p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-zinc-500" />}
          </button>
        </div>
      </div>
    </div>
  );
};