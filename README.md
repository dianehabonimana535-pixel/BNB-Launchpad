# BNBMint Launchpad

Create meme coins on **BNB Smart Chain** or **Robinhood Chain** — no code
required. Non-custodial, wallet-signed. There is no platform fee: you only
pay that network's own gas for the single deployment transaction. A
network selector in the app lets the user pick which chain to deploy to
per token.

This started as a BNB Smart Chain port of the original SolMint Launchpad
(Solana), then grew multi-chain support for Robinhood Chain (mainnet +
testnet). The UI, page structure, and IPFS metadata flow are unchanged
across all of this; everything that talked to a specific chain's programs
or SDK has been replaced with a generic EVM-native equivalent, keyed off
`lib/network.ts`'s network registry — see "What changed from the Solana
version" below.

## Supported networks

| Network | Chain ID | Gas token | DEX | Explorer |
|---|---|---|---|---|
| BNB Smart Chain | 56 | BNB | PancakeSwap | BscScan |
| Robinhood Chain | 4663 | ETH | Uniswap (v2/v3/v4) | Blockscout |
| Robinhood Chain Testnet | 46630 | ETH | — (no real liquidity) | Blockscout |

Adding another EVM chain later is mostly a matter of adding one more entry
to `NETWORKS` in `lib/network.ts` — the wallet context, fee estimator,
contract deployment, and UI all read from that registry rather than
hardcoding a chain.

### Known rough edges on the Robinhood Chain side

- The Uniswap "add liquidity" deep link in `lib/network.ts` is a
  best-effort URL pattern (`app.uniswap.org/add/v2/...`) — Uniswap's app
  has changed its URL scheme before. Verify it still resolves correctly
  once you have a real pool, and adjust the `addLiquidityUrl` function for
  `robinhood`/`robinhood-testnet` if not.
- The DexScreener chain slug used for Robinhood Chain (`"robinhood"` in
  `dexscreenerChainSlug`) is an educated guess based on DexScreener's
  usual lowercase-chain-name convention, not something confirmed against
  their docs. If trending/dashboard data comes back empty for Robinhood
  Chain even though pools clearly exist, this slug is the first thing to
  check.
- Holder counts on the token dashboard only work for BNB Chain right now
  (via BscScan's API). Blockscout (used for Robinhood Chain) exposes a
  similar endpoint but it isn't wired up yet — Robinhood Chain tokens will
  show "Unavailable" for holder count regardless of `BSCSCAN_API_KEY`.

## What it does

- Connect a browser wallet (MetaMask, Trust Wallet, Binance Wallet, or any
  other injected EIP-1193 wallet — auto-detected)
- Fill in token details (name, symbol, description, decimals, supply, logo,
  socials)
- Logo + metadata JSON are uploaded to IPFS via Pinata
- The app deploys a fresh, self-contained BEP-20 contract; **your wallet
  signs the deployment locally** — the app never sees a private key or seed
  phrase. The initial supply mint and any authority revocations happen
  inside that same constructor call, so creating a token is a **single**
  wallet signature, exactly like the Solana version
- Optionally revoke mint authority, freeze authority, and/or metadata update
  authority — bundled into that same deployment transaction, not a second
  one
- Get the token address, transaction hash, and BscScan / PancakeSwap /
  DexScreener links; history is kept locally in your browser

## Tech stack

- Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS
- `ethers` v6 for all on-chain interaction (deploying the contract, reading
  contract state, connecting the wallet)
- A custom lightweight wallet context (`components/WalletContextProvider.tsx`)
  built directly on `window.ethereum` — no wagmi/RainbowKit dependency
- Pinata for IPFS pinning (proxied through a server API route so the API key
  never reaches the browser) — unchanged from the Solana version
- DexScreener's public API for trending coins and token market data (no key
  required)

## What changed from the Solana version

Solana has shared, already-deployed programs (SPL Token, Metaplex Token
Metadata) that every mint calls into. BNB Smart Chain has no equivalent
shared program — every BEP-20 token is its own contract. So instead of
calling an existing program, this app deploys a fresh instance of
[`contracts/BEP20MemeToken.sol`](contracts/BEP20MemeToken.sol) for every
token created. The compiled ABI + bytecode are embedded in `lib/contract.ts`
so the app needs no Solidity build step (Hardhat/Foundry) at runtime —
exactly like a Solana transaction is built and signed client-side.

The contract mirrors Solana's three authorities directly:

| Solana concept | BNB Chain equivalent (this contract) |
|---|---|
| Mint authority | `mintAuthority` — can call `mint()`; revoke sets it to the zero address |
| Freeze authority | `freezeAuthority` — can `freeze()`/`unfreeze()` any holder; revoke sets it to the zero address |
| Metadata update authority | `updateAuthority` — can call `updateMetadata()` to repoint the off-chain metadata URI; revoke sets it to the zero address |

All three, if revoked, are revoked **inside the constructor** based on
checkboxes in the UI — there is no separate revoke transaction, matching
the "one wallet signature" flow of the original.

| Solana version | This BNB Chain version |
|---|---|
| `@solana/web3.js`, `@solana/spl-token` | `ethers` v6 |
| `@metaplex-foundation/mpl-token-metadata` | `metadataURI` string in the contract itself |
| `@solana/wallet-adapter-*` (Phantom, Solflare, ...) | Custom context over `window.ethereum` (MetaMask, Trust Wallet, ...) |
| Raydium pool data | PancakeSwap pair data via DexScreener's public API |
| Solscan links | BscScan links |
| SOL / lamports | BNB / wei, 18 decimals by default |

## Getting started

```bash
npm install
cp .env.example .env.local
# edit .env.local — see below
npm run dev
```

Open http://localhost:3000.

### Required environment variables

| Variable | Required | Notes |
|---|---|---|
| `PINATA_JWT` | Yes | Server-only. Create a free Pinata account, generate a JWT with `pinFileToIPFS` + `pinJSONToIPFS` scopes. |
| `PINATA_GATEWAY` | No | Defaults to `gateway.pinata.cloud`. Use your own dedicated gateway if you have one. |
| `NEXT_PUBLIC_BSC_RPC_URL` | Recommended | Defaults to the public `bsc-dataseed.binance.org` endpoint, which is rate-limited under real traffic and **not ideal for production**. Get a free/paid endpoint from NodeReal, Ankr, QuickNode, or similar. |
| `BSCSCAN_API_KEY` | No | If set, the token dashboard shows an approximate holder count. Leave blank to show "Unavailable" instead. |

This app talks to **BNB Smart Chain mainnet only**. Every token created is
real and immediately tradable. Test with a small amount of BNB first.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the environment variables above in Project Settings → Environment
   Variables.
4. Deploy. No other configuration is needed — the app is a standard
   Next.js 15 App Router project. There is no separate contract deployment
   step for you to run: the contract bytecode is already compiled and
   embedded in `lib/contract.ts`, and each user's browser deploys their own
   token contract when they click "Create token".

## Project structure

```
app/
  page.tsx                    Landing page
  create/page.tsx              Token creator flow
  trending/page.tsx            Trending BSC memecoins (DexScreener data)
  token/[address]/page.tsx     Per-token dashboard
  history/page.tsx             Locally stored past mints
  api/upload/route.ts          Server-side Pinata proxy (keeps JWT secret)
  api/trending/route.ts        Server-side DexScreener aggregation
  api/token/[address]/route.ts On-chain contract read + market data
  layout.tsx, globals.css
components/
  Hero, Stats, FAQ, Footer, Navbar
  WalletContextProvider.tsx    Custom window.ethereum wallet context
  WalletButton.tsx             Connect/disconnect/switch-network button
  TokenCreatorForm.tsx         Main form + orchestration
  TokenPreviewCard, AuthorityOptions, ProgressSteps, FeeEstimator
  ui/                          Small local button/card/input/checkbox primitives
contracts/
  BEP20MemeToken.sol           Solidity source (reference/auditing — see lib/contract.ts)
lib/
  contract.ts    Compiled ABI + bytecode embedded as a TS constant
  mint.ts        Deployment orchestration via ethers ContractFactory
  ipfs.ts        Client helper that calls /api/upload (unchanged from Solana version)
  network.ts     RPC endpoint + BscScan/PancakeSwap/DexScreener URL helpers
  fees.ts        Transparent gas estimate shown before signing
  trending.ts    Client fetch wrapper for /api/trending
  history.ts     localStorage-backed history
  utils.ts       Small shared helpers
```

## Security notes

- The app never requests, stores, or transmits a seed phrase or private key.
- All signing happens inside the user's own wallet extension/app.
- The Pinata JWT lives only in server environment variables and is used
  from the `/api/upload` route — it is never sent to the client.
- Revoking an authority is irreversible; the UI says so before the user
  confirms. All three authorities default to revoked (checked) in the UI —
  the user can uncheck any of them before creating the token.
- `contracts/BEP20MemeToken.sol` is small and single-file by design so it's
  easy to read end-to-end before trusting it. If you change it, recompile
  with solc and paste the new ABI/bytecode into `lib/contract.ts` — see the
  comment at the top of that file.

## Disclaimer

Creating and distributing a token carries financial, legal, and regulatory
risk that varies by jurisdiction. This software is provided as a tool; it is
not financial, legal, or tax advice. Review your local regulations before
launching a token intended for public trading.
