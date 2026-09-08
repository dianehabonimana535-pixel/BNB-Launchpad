import { NextResponse } from "next/server";
import { Contract, JsonRpcProvider, isAddress } from "ethers";
import { BEP20MEMETOKEN_ABI } from "@/lib/contract";
import { NETWORKS, dexscreenerUrl, explorerTokenUrl, type ChainKey } from "@/lib/network";

export const revalidate = 30;

const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY;
const HOLDER_FETCH_TIMEOUT_MS = 6000;

interface DexScreenerPair {
  priceUsd?: string;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { h24?: number };
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

async function fetchHolderCount(chain: ChainKey, address: string): Promise<number | null> {
  // Holder-count lookups currently only work for BSC (via BscScan's API).
  // Robinhood Chain uses a Blockscout explorer, which exposes a
  // holder-count endpoint too, but it isn't wired up here yet — the
  // dashboard just shows "Unavailable" for Robinhood Chain tokens for now.
  if (chain !== "bsc" || !BSCSCAN_API_KEY) return null;
  try {
    // BscScan's holder-count endpoint requires a paid "Pro" plan; the free
    // tier only returns a placeholder. This is a best-effort call — if it
    // fails or isn't available on the configured key's plan, the
    // dashboard simply shows "Unavailable", same as when no key is set.
    const url = `https://api.bscscan.com/api?module=token&action=tokenholdercount&contractaddress=${address}&apikey=${BSCSCAN_API_KEY}`;
    const res = await withTimeout(fetch(url), HOLDER_FETCH_TIMEOUT_MS, null as any);
    if (!res) return null;
    const json = await res.json();
    const count = Number(json?.result);
    return Number.isFinite(count) ? count : null;
  } catch {
    return null;
  }
}

async function fetchBestPair(chainSlug: string | null, address: string): Promise<DexScreenerPair | null> {
  if (!chainSlug) return null;
  try {
    const res = await fetch(`https://api.dexscreener.com/token-pairs/v1/${chainSlug}/${address}`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    const pairs: DexScreenerPair[] = await res.json();
    if (!pairs || pairs.length === 0) return null;
    return pairs.reduce((best, p) => ((p.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? p : best));
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const { searchParams } = new URL(req.url);
  const chainParam = (searchParams.get("chain") || "bsc") as ChainKey;
  const network = NETWORKS[chainParam];

  if (!network) {
    return NextResponse.json({ error: `Unknown chain "${chainParam}"` }, { status: 400 });
  }

  if (!isAddress(address)) {
    return NextResponse.json({ error: "Invalid token address" }, { status: 400 });
  }

  const provider = new JsonRpcProvider(network.rpcUrl);
  const contract = new Contract(address, BEP20MEMETOKEN_ABI, provider);

  try {
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

    const [
      name,
      symbol,
      decimals,
      totalSupply,
      metadataUri,
      mintAuthority,
      freezeAuthority,
      updateAuthority,
      pairData,
      holderCount,
    ] = await Promise.all([
      contract.name().catch(() => null),
      contract.symbol().catch(() => null),
      contract.decimals().catch(() => null),
      contract.totalSupply().catch(() => null),
      contract.metadataURI().catch(() => ""),
      contract.mintAuthority().catch(() => null),
      contract.freezeAuthority().catch(() => null),
      contract.updateAuthority().catch(() => null),
      fetchBestPair(network.dexscreenerChainSlug, address),
      fetchHolderCount(network.key, address),
    ]);

    if (name === null || totalSupply === null) {
      return NextResponse.json({ error: "Token contract not found on-chain" }, { status: 404 });
    }

    let offChainImage: string | null = null;
    let description: string | null = null;
    if (metadataUri) {
      try {
        const res = await fetch(metadataUri, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const json = await res.json();
          offChainImage = json.image ?? null;
          description = json.description ?? null;
        }
      } catch {
        // best effort
      }
    }

    const dsUrl = dexscreenerUrl(network, address);

    return NextResponse.json({
      chain: network.key,
      chainLabel: network.label,
      nativeSymbol: network.nativeSymbol,
      tokenAddress: address,
      name: name?.trim() || "Unknown Token",
      symbol: symbol?.trim() || "?",
      logoUri: offChainImage,
      description,
      supply: totalSupply.toString(),
      decimals: Number(decimals ?? 18),
      authorities: {
        mintRevoked: mintAuthority === ZERO_ADDRESS,
        freezeRevoked: freezeAuthority === ZERO_ADDRESS,
        updateRevoked: updateAuthority === ZERO_ADDRESS,
      },
      market: pairData
        ? {
            priceUsd: Number(pairData.priceUsd) || 0,
            volume24h: pairData.volume?.h24 || 0,
            tvl: pairData.liquidity?.usd || 0,
            // DexScreener's public API doesn't expose a genuine 24h
            // low/high — this derives an approximate band from the 24h %
            // change instead.
            priceMin24h:
              (Number(pairData.priceUsd) || 0) *
              (1 - Math.abs(pairData.priceChange?.h24 || 0) / 200),
            priceMax24h:
              (Number(pairData.priceUsd) || 0) *
              (1 + Math.abs(pairData.priceChange?.h24 || 0) / 200),
            dexscreenerUrl: dsUrl,
          }
        : null,
      holderCount,
      explorerName: network.explorerName,
      explorerUrl: explorerTokenUrl(network, address),
      addLiquidityUrl: network.addLiquidityUrl(address),
      dexName: network.dexName,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
