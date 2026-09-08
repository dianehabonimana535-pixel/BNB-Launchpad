"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Does BNBMint Launchpad charge a fee?",
    a: "No. BNBMint Launchpad is free to use — there is no platform fee for creating a token or for revoking an authority. You only pay BNB Smart Chain's own gas fee for the single deployment transaction. The exact total is always shown by your wallet before you sign.",
  },
  {
    q: "Do you ever ask for my seed phrase or private key?",
    a: "Never. BNBMint Launchpad only connects through your browser wallet extension (MetaMask, Trust Wallet, Binance Wallet, or any other injected wallet). Every transaction is built here, then signed locally inside your own wallet. We never see, store, or request your keys.",
  },
  {
    q: "What does revoking mint authority do?",
    a: "It permanently removes the ability for anyone — including you — to mint additional supply. Total supply becomes fixed forever, which is often a signal of trust for holders.",
  },
  {
    q: "What does revoking freeze authority do?",
    a: "It removes the ability to freeze any holder's balance in the token contract, guaranteeing no one can ever lock a holder out of their tokens.",
  },
  {
    q: "What does revoking update authority do?",
    a: "It makes your token's off-chain metadata pointer (logo, description, links) permanently immutable — it can never be repointed again by anyone.",
  },
  {
    q: "Which network does this run on?",
    a: "BNB Smart Chain mainnet. Tokens you create here are real, live BEP-20 contracts immediately tradable by anyone holding BNB, and can be paired on PancakeSwap right after creation.",
  },
  {
    q: "Can I undo a revoked authority?",
    a: "No. Revoking an authority is permanent and irreversible by design — that's what makes the guarantee meaningful to holders. Review your choices carefully before confirming.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="container py-24">
      <div className="mx-auto mb-12 max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Frequently asked</h2>
        <p className="mt-3 text-muted-foreground">
          Everything you need to know before you strike your first coin.
        </p>
      </div>

      <div className="mx-auto max-w-2xl divide-y divide-border/60 rounded-2xl border border-border/60">
        {faqs.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium sm:text-base"
              aria-expanded={open === i}
            >
              {item.q}
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  open === i && "rotate-180"
                )}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-muted-foreground">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
