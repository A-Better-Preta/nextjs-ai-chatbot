"use client";

import { useState } from "react";
import { CreditCard, Loader2, Landmark, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust path to your UI library

export function BankDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

const handleConnect = () => {
  // 1. Immediate loading state
  setLoading(true);

  const width = 500;
  const height = 750;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  // 2. Open the window IMMEDIATELY (no awaits before this)
  const popup = window.open(
    '/api/tink/launch',
    'TinkConnect',
    `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
  );

  // 3. Handle the "Blocked" case
  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    alert("Popup blocked! Please allow popups for this site to connect your bank.");
    setLoading(false);
    return;
  }

const messageListener = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.data === 'tink-success') {
      window.removeEventListener('message', messageListener);
      window.location.reload();
    }
  };

  window.addEventListener('message', messageListener);

  // ADD THIS: Check if the user closed the window manually
  const checkClosed = setInterval(() => {
    if (popup?.closed) {
      clearInterval(checkClosed);
      window.removeEventListener('message', messageListener);
      setLoading(false); // This stops the spinner on the main page
      console.log("Sync was cancelled by the user.");
    }
  }, 1000);
};

  return (
    <>
      {/* Trigger Button - Place this in your Sidebar or Header */}
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="gap-2 border-dashed border-zinc-700 hover:border-zinc-500"
      >
        <Landmark size={16} />
        Connect Bank
      </Button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div 
            className="w-full max-w-lg bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-8 shadow-2xl animate-in slide-in-from-bottom duration-300"
          >
            <div className="mx-auto w-12 h-1.5 bg-zinc-700 rounded-full mb-8" />
            
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 bg-blue-500/10 rounded-full text-blue-500 mb-2">
                <CreditCard size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">Connect your Bank</h2>
              <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                We use Tink to securely access your transaction data. Your credentials are never shared with us.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <ShieldCheck className="text-emerald-500" size={20} />
                <span className="text-xs text-zinc-300">Bank-grade 256-bit encryption</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Button 
                onClick={handleConnect} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-bold text-lg"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Continue to Bank"}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}