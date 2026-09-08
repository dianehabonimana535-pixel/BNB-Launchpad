import type { ChainKey } from "./network";

export interface TrendingCoin {
  chain: ChainKey;
  tokenAddress: string;
  pairAddress: string;
  name: string;
  symbol: string;
  logoUri: string;
  priceUsd: number;
  volume24h: number;
  tvl: number;
  ageHours: number;
  priceMin: number;
  priceMax: number;
  dexscreenerUrl: string;
  explorerUrl: string;
  explorerName: string;
}

/**
 * Fetches trending memecoins on the given chain, launched within the last
 * 48h, ranked by real 24h trading volume on that chain's DEX (PancakeSwap
 * for BNB Chain, Uniswap for Robinhood Chain). The heavy scanning happens
 * server-side (app/api/trending/route.ts) so the phone only downloads the
 * final, ready-to-display list.
 */
export async function fetchTrendingCoins(chain: ChainKey): Promise<TrendingCoin[]> {
  const res = await fetch(`/api/trending?chain=${chain}`);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Trending API error: ${res.status}`);
  }
  return res.json();
}
