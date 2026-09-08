import { NextResponse } from "next/server";
import { NETWORKS, explorerTokenUrl, type ChainKey } from "@/lib/network";

export const revalidate = 60;

interface DexScreenerTokenProfile {
  chainId: string;
  tokenAddress: string;
}

interface DexScreenerToken {
  address: string;
  name: string;
  symbol: string;
}

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: DexScreenerToken;
  quoteToken: DexScreenerToken;
  priceUsd?: string;
  pairCreatedAt?: number;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { h24?: number };
  info?: { imageUrl?: string };
}

// Native/wrapped/stable symbols to exclude per chain, so a WBNB/BUSD pair
// doesn't get reported as "the memecoin". Extend this per network as new
// wrapped/stable assets show up.
const EXCLUDED_SYMBOLS: Record<ChainKey, Set<string>> = {
  bsc: new Set(["BNB", "WBNB", "BUSD", "USDT", "USDC", "DAI", "CAKE", "ETH", "WETH", "BTCB", "BTC", "WBTC"]),
  robinhood: new Set(["ETH", "WETH", "USDT", "USDC", "DAI", "UNI"]),
  "robinhood-testnet": new Set(["ETH", "WETH", "USDT", "USDC", "DAI", "UNI"]),
};

const MIN_VOLUME_USD = 1000;
const MIN_LIQUIDITY_USD = 500;
const MAX_AGE_HOURS = 48;

function isMemecoinToken(chain: ChainKey, token: DexScreenerToken): boolean {
  const symbol = token.symbol.toUpperCase();
  const name = token.name.toLowerCase();
  if (EXCLUDED_SYMBOLS[chain].has(symbol)) return false;
  if (name.includes("wrapped")) return false;
  if (symbol.endsWith("USD")) return false;
  return true;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Gathers candidate token addresses for a given chain from DexScreener's discovery feeds. */
async function collectCandidateAddresses(dexscreenerChainSlug: string): Promise<string[]> {
  const [profiles, latestBoosts, topBoosts] = await Promise.all([
    fetchJson<DexScreenerTokenProfile[]>("https://api.dexscreener.com/token-profiles/latest/v1"),
    fetchJson<DexScreenerTokenProfile[]>("https://api.dexscreener.com/token-boosts/latest/v1"),
    fetchJson<DexScreenerTokenProfile[]>("https://api.dexscreener.com/token-boosts/top/v1"),
  ]);

  const all = [...(profiles || []), ...(latestBoosts || []), ...(topBoosts || [])];
  const seen = new Set<string>();
  const addresses: string[] = [];

  for (const item of all) {
    if (item.chainId !== dexscreenerChainSlug) continue;
    const addr = item.tokenAddress?.toLowerCase();
    if (!addr || seen.has(addr)) continue;
    seen.add(addr);
    addresses.push(item.tokenAddress);
  }

  return addresses;
}

async function fetchBestPairForToken(
  dexscreenerChainSlug: string,
  tokenAddress: string
): Promise<DexScreenerPair | null> {
  const pairs = await fetchJson<DexScreenerPair[]>(
    `https://api.dexscreener.com/token-pairs/v1/${dexscreenerChainSlug}/${tokenAddress}`
  );
  if (!pairs || pairs.length === 0) return null;
  return pairs.reduce((best, p) =>
    (p.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? p : best
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chainParam = (searchParams.get("chain") || "bsc") as ChainKey;
  const network = NETWORKS[chainParam];

  if (!network) {
    return NextResponse.json({ error: `Unknown chain "${chainParam}"` }, { status: 400 });
  }

  if (!network.dexscreenerChainSlug) {
    // Testnets have no real trading activity for DexScreener to index.
    return NextResponse.json([]);
  }

  try {
    const nowMs = Date.now();
    const cutoffMs = nowMs - MAX_AGE_HOURS * 3600 * 1000;

    const candidateAddresses = await collectCandidateAddresses(network.dexscreenerChainSlug);
    const pairs = await Promise.all(
      candidateAddresses.map((addr) => fetchBestPairForToken(network.dexscreenerChainSlug as string, addr))
    );

    const coins = [];

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      if (!pair) continue;
      if (!pair.pairCreatedAt || pair.pairCreatedAt < cutoffMs) continue;

      const volume24h = pair.volume?.h24 || 0;
      const tvl = pair.liquidity?.usd || 0;
      if (volume24h < MIN_VOLUME_USD) continue;
      if (tvl < MIN_LIQUIDITY_USD) continue;

      const isBaseEstablished = EXCLUDED_SYMBOLS[network.key].has(pair.baseToken.symbol.toUpperCase());
      const token = isBaseEstablished ? pair.quoteToken : pair.baseToken;
      if (!isMemecoinToken(network.key, token)) continue;

      const priceUsd = Number(pair.priceUsd) || 0;
      const ageHours = (nowMs - pair.pairCreatedAt) / 3_600_000;
      // DexScreener's public API doesn't expose a real 24h price min/max
      // the way Raydium's pool list did — this derives a rough band from
      // the 24h % change instead, which is an approximation, not a
      // genuine intraday low/high.

      coins.push({
        chain: network.key,
        tokenAddress: token.address,
        pairAddress: pair.pairAddress,
        name: token.name,
        symbol: token.symbol,
        logoUri: pair.info?.imageUrl || "",
        priceUsd,
        volume24h,
        tvl,
        ageHours,
        priceMin: priceUsd * (1 - Math.abs(pair.priceChange?.h24 || 0) / 200),
        priceMax: priceUsd * (1 + Math.abs(pair.priceChange?.h24 || 0) / 200),
        dexscreenerUrl: `https://dexscreener.com/${network.dexscreenerChainSlug}/${pair.pairAddress}`,
        explorerUrl: explorerTokenUrl(network, token.address),
        explorerName: network.explorerName,
      });
    }

    coins.sort((a, b) => b.volume24h - a.volume24h);
    return NextResponse.json(coins.slice(0, 50));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
