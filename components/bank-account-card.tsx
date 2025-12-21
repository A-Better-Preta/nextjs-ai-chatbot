"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react"; // Make sure lucide-react is installed

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

const iban = acc.iban || "";
  const accountNumber = acc.account_number || "";
  
  const activeValue = displayMode === "iban" ? iban : accountNumber;
  const label = displayMode === "iban" ? "IBAN" : "Account No";
  
  if (acc.raw_json) {
    try {
      const raw = JSON.parse(acc.raw_json);
      const ibanEntry = raw.identifiers?.find((s: string) => s.startsWith("iban://"));
        } catch (e) {}
  }

  // Helper to copy text
  const copyToClipboard = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBtn = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(activeValue);
  };

  const isNegative = acc.balance < 0;

  return (
   <div
      onClick={() => setDisplayMode(prev => prev === "iban" ? "number" : "iban")}
      className={cn(
        "relative overflow-hidden flex flex-col p-5 rounded-2xl border shadow-lg transition-all cursor-pointer group active:scale-[0.98]",
        acc.balance >= 0 
          ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-400" 
          : "bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700"
      )}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{acc.type}</span>
          <span className="font-semibold text-base leading-tight">{acc.name}</span>
        </div>
        
        {/* Clean top-right badge using the new column */}
        <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-mono border border-white/10 backdrop-blur-sm">
          {accountNumber || "No Acc No"}
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-black tracking-tighter">
            {new Intl.NumberFormat("sv-SE").format(acc.balance)}
          </span>
          <span className="text-xs font-bold opacity-80 uppercase">{acc.currency_code}</span>
        </div>

      <div className="pt-2 border-t border-white/10 flex justify-between items-center relative z-10">
        <div className="flex flex-col truncate">
          <span className="text-[8px] uppercase font-bold opacity-50 mb-0.5">{label}</span>
          <p className="text-[10px] font-mono tracking-wider truncate">
            {activeValue.match(/.{1,4}/g)?.join(" ") || activeValue || "N/A"}
          </p>
        </div>
          <button
            onClick={handleCopyBtn}
            className="ml-2 p-2 hover:bg-white/20 rounded-full transition-colors shrink-0"
          >
            {copied ? <Check size={14} className="text-green-300" /> : <Copy size={14} className="opacity-60" />}
          </button>
        </div>
      </div>
    </div>
  );
};