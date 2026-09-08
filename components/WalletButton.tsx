"use client";

import { useState } from "react";
import { Wallet, LogOut, AlertTriangle, ChevronDown } from "lucide-react";
import { useWallet } from "@/components/WalletContextProvider";
import { shortenAddress, cn } from "@/lib/utils";

export default function WalletButton({ className }: { className?: string }) {
  const {
    address,
    connected,
    connecting,
    isWrongNetwork,
    targetNetwork,
    connect,
    disconnect,
    switchToTargetNetwork,
  } = useWallet();
  const [open, setOpen] = useState(false);

  if (!connected) {
    return (
      <button
        onClick={connect}
        disabled={connecting}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-60",
          className
        )}
      >
        <Wallet className="h-3.5 w-3.5" />
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  if (isWrongNetwork) {
    return (
      <button
        onClick={switchToTargetNetwork}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-md bg-destructive px-3 text-xs font-medium text-destructive-foreground",
          className
        )}
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        Switch to {targetNetwork.shortLabel}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground",
          className
        )}
      >
        {shortenAddress(address as string)}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 w-40 rounded-md border border-border bg-card p-1 shadow-lg">
          <button
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
            className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
