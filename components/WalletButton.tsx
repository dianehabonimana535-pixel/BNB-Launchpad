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
    availableWallets,
    selectedWallet,
    connect,
    disconnect,
    switchToTargetNetwork,
  } = useWallet();
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // More than one wallet extension installed (MetaMask, Trust Wallet,
  // Coinbase Wallet, etc.) -- ask the user which one to use instead of
  // silently connecting to whichever one happened to load first.
  function handleConnectClick() {
    if (availableWallets.length > 1) {
      setPickerOpen(true);
      return;
    }
    connect();
  }

  if (!connected) {
    return (
      <div className="relative">
        <button
          onClick={handleConnectClick}
          disabled={connecting}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-60",
            className
          )}
        >
          <Wallet className="h-3.5 w-3.5" />
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
        {pickerOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setPickerOpen(false)} />
            <div className="absolute right-0 top-9 z-50 w-56 rounded-md border border-border bg-card p-1 shadow-lg">
              <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Select a wallet
              </div>
              {availableWallets.map((w) => (
                <button
                  key={w.info.uuid}
                  onClick={() => {
                    setPickerOpen(false);
                    connect(w.info.rdns);
                  }}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-xs text-foreground hover:bg-secondary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.info.icon} alt="" className="h-5 w-5 rounded-sm" />
                  {w.info.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
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
        {selectedWallet?.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selectedWallet.icon} alt="" className="h-3.5 w-3.5 rounded-sm" />
        ) : (
          <Wallet className="h-3.5 w-3.5" />
        )}
        {shortenAddress(address as string)}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 w-40 rounded-md border border-border bg-card p-1 shadow-lg">
          {selectedWallet?.name && (
            <div className="flex items-center gap-1.5 border-b border-border px-2 py-1.5 text-[10px] text-muted-foreground">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedWallet.icon} alt="" className="h-3.5 w-3.5 rounded-sm" />
              {selectedWallet.name}
            </div>
          )}
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

