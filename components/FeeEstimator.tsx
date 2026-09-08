"use client";

import { estimateFees } from "@/lib/fees";
import { useWallet } from "@/components/WalletContextProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function FeeEstimator({ authoritiesToRevokeCount }: { authoritiesToRevokeCount: number }) {
  const { targetNetwork } = useWallet();
  const fees = estimateFees(targetNetwork.key, authoritiesToRevokeCount);
  const symbol = targetNetwork.nativeSymbol;

  const rows = [
    { label: "Contract deployment gas", value: fees.deployGasNative },
    { label: "Authority revocation gas", value: fees.revokeGasNative },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Estimated cost</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="font-mono">
              {r.value.toFixed(6)} {symbol}
            </span>
          </div>
        ))}
        <div className="my-2 h-px bg-border" />
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Total</span>
          <span className="font-mono gradient-text">
            {fees.totalNative.toFixed(6)} {symbol}
          </span>
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          This is a rough estimate based on typical {targetNetwork.label} gas prices — BNBMint
          Launchpad charges no platform fee. Your wallet shows the exact final gas cost
          before you sign.
        </p>
      </CardContent>
    </Card>
  );
}
