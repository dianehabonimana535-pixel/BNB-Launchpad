export type ChainKey = "bsc" | "robinhood" | "robinhood-testnet";

export interface NetworkConfig {
  key: ChainKey;
  chainId: number;
  chainIdHex: string;
  label: string;
  shortLabel: string;
  nativeSymbol: string;
  isTestnet: boolean;
  rpcUrl: string;
  explorerBaseUrl: string;
  explorerName: string;
  dexName: string;
  /**
   * DexScreener's URL chain-slug for this network, or null if DexScreener
   * coverage isn't confirmed (e.g. testnets are never indexed by
   * DexScreener since there's no real trading activity). Robinhood Chain's
   * exact slug is a best-effort guess based on DexScreener's usual
   * lowercase-chain-name convention -- verify it resolves once you have a
   * live pool, and adjust here if it doesn't.
   */
  dexscreenerChainSlug: string | null;
  addLiquidityUrl: (tokenAddress: string) => string;
  /** Params for wallet_addEthereumChain, in case the wallet doesn't have this network configured yet. */
  walletAddChainParams: {
    chainId: string;
    chainName: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  };
}

const BSC_RPC =
  process.env.NEXT_PUBLIC_BSC_RPC_URL && process.env.NEXT_PUBLIC_BSC_RPC_URL.length > 0
    ? process.env.NEXT_PUBLIC_BSC_RPC_URL
    : "https://bsc-dataseed.binance.org";

const ROBINHOOD_MAINNET_RPC =
  process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL && process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL.length > 0
    ? process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL
    : "https://rpc.mainnet.chain.robinhood.com";

const ROBINHOOD_TESTNET_RPC =
  process.env.NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL &&
  process.env.NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL.length > 0
    ? process.env.NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC_URL
    : "https://rpc.testnet.chain.robinhood.com";

export const NETWORKS: Record<ChainKey, NetworkConfig> = {
  bsc: {
    key: "bsc",
    chainId: 56,
    chainIdHex: "0x38",
    label: "BNB Smart Chain",
    shortLabel: "BNB Chain",
    nativeSymbol: "BNB",
    isTestnet: false,
    rpcUrl: BSC_RPC,
    explorerBaseUrl: "https://bscscan.com",
    explorerName: "BscScan",
    dexName: "PancakeSwap",
    dexscreenerChainSlug: "bsc",
    addLiquidityUrl: (tokenAddress) => `https://pancakeswap.finance/add/BNB/${tokenAddress}`,
    walletAddChainParams: {
      chainId: "0x38",
      chainName: "BNB Smart Chain",
      nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      rpcUrls: [BSC_RPC],
      blockExplorerUrls: ["https://bscscan.com"],
    },
  },
  robinhood: {
    key: "robinhood",
    chainId: 4663,
    chainIdHex: "0x1237",
    label: "Robinhood Chain",
    shortLabel: "Robinhood",
    nativeSymbol: "ETH",
    isTestnet: false,
    rpcUrl: ROBINHOOD_MAINNET_RPC,
    explorerBaseUrl: "https://robinhoodchain.blockscout.com",
    explorerName: "Blockscout",
    dexName: "Uniswap",
    // Best-effort guess -- verify this resolves once you have a live pool.
    dexscreenerChainSlug: "robinhood",
    addLiquidityUrl: (tokenAddress) =>
      `https://app.uniswap.org/add/v2/ETH/${tokenAddress}?chain=robinhood`,
    walletAddChainParams: {
      chainId: "0x1237",
      chainName: "Robinhood Chain",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: [ROBINHOOD_MAINNET_RPC],
      blockExplorerUrls: ["https://robinhoodchain.blockscout.com"],
    },
  },
  "robinhood-testnet": {
    key: "robinhood-testnet",
    chainId: 46630,
    chainIdHex: "0xb626",
    label: "Robinhood Chain Testnet",
    shortLabel: "Robinhood Testnet",
    nativeSymbol: "ETH",
    isTestnet: true,
    rpcUrl: ROBINHOOD_TESTNET_RPC,
    explorerBaseUrl: "https://explorer.testnet.chain.robinhood.com",
    explorerName: "Blockscout",
    dexName: "Uniswap",
    // Testnets have no real trading activity, so DexScreener never indexes them.
    dexscreenerChainSlug: null,
    addLiquidityUrl: (tokenAddress) =>
      `https://app.uniswap.org/add/v2/ETH/${tokenAddress}?chain=robinhood_testnet`,
    walletAddChainParams: {
      chainId: "0xb626",
      chainName: "Robinhood Chain Testnet",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: [ROBINHOOD_TESTNET_RPC],
      blockExplorerUrls: ["https://explorer.testnet.chain.robinhood.com"],
    },
  },
};

export const DEFAULT_NETWORK: ChainKey = "bsc";

export function getNetwork(key: ChainKey): NetworkConfig {
  return NETWORKS[key];
}

export function networkByChainId(chainId: number): NetworkConfig | null {
  return Object.values(NETWORKS).find((n) => n.chainId === chainId) || null;
}

export function explorerAddressUrl(network: NetworkConfig, address: string): string {
  return `${network.explorerBaseUrl}/address/${address}`;
}

export function explorerTxUrl(network: NetworkConfig, txHash: string): string {
  return `${network.explorerBaseUrl}/tx/${txHash}`;
}

export function explorerTokenUrl(network: NetworkConfig, address: string): string {
  return `${network.explorerBaseUrl}/token/${address}`;
}

export function dexscreenerUrl(network: NetworkConfig, tokenAddress: string): string | null {
  if (!network.dexscreenerChainSlug) return null;
  return `https://dexscreener.com/${network.dexscreenerChainSlug}/${tokenAddress}`;
}

export const SITE_URL = "https://bnbmint-launchpad.vercel.app";

/**
 * Builds a pre-filled "Share on X" intent URL for a created token. Used
 * both right after deployment and from the History page for past tokens.
 */
export function buildShareOnXUrl(
  network: NetworkConfig,
  name: string,
  symbol: string,
  tokenAddress: string,
  revokedCount?: number
): string {
  const trustLine =
    revokedCount === 3
      ? "All authorities revoked, zero rug pull risk."
      : typeof revokedCount === "number" && revokedCount > 0
      ? `${revokedCount}/3 authorities revoked.`
      : "";

  const text = `🚀 ${name} ($${symbol}) just launched on ${network.label}! ${trustLine}\n\nCA: ${tokenAddress}\n${explorerTokenUrl(
    network,
    tokenAddress
  )}\n${SITE_URL}`;

  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
}
