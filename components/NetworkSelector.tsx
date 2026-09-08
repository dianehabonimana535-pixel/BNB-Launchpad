"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { NETWORKS, type ChainKey } from "@/lib/network";
import { useWallet } from "@/components/WalletContextProvider";
import { cn } from "@/lib/utils";

const ORDER: ChainKey[] = ["bsc", "robinhood", "robinhood-testnet"];

export default function NetworkSelector({ className }: { className?: string }) {
  const { targetNetworkKey, setTargetNetworkKey } = useWallet();
  const [open, setOpen] = useState(false);
  const current = NETWORKS[targetNetworkKey];

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-3 text-xs font-medium"
      >
        {current.shortLabel}
        {current.isTestnet && (
          <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
            TESTNET
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-50 w-56 rounded-md border border-border bg-card p-1 shadow-lg">
            {ORDER.map((key) => {
              const net = NETWORKS[key];
              return (
                <button
                  key={key}
                  onClick={() => {
                    setTargetNetworkKey(key);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-2 text-left text-xs hover:bg-secondary"
                >
                  <span className="flex items-center gap-1.5">
                    {net.label}
                    {net.isTestnet && (
                      <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                        TESTNET
                      </span>
                    )}
                  </span>
                  {key === targetNetworkKey && <Check className="h-3.5 w-3.5 text-accent" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
