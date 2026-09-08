"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BrowserProvider, type JsonRpcSigner } from "ethers";
import { NETWORKS, DEFAULT_NETWORK, networkByChainId, type ChainKey, type NetworkConfig } from "@/lib/network";

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface WalletContextValue {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  chainId: number | null;
  targetNetworkKey: ChainKey;
  targetNetwork: NetworkConfig;
  setTargetNetworkKey: (key: ChainKey) => void;
  isWrongNetwork: boolean;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  hasInjectedWallet: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToTargetNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const AUTOCONNECT_KEY = "bnbmint.autoconnect";
const TARGET_NETWORK_KEY = "bnbmint.targetNetwork";

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [targetNetworkKey, setTargetNetworkKeyState] = useState<ChainKey>(DEFAULT_NETWORK);

  const hasInjectedWallet = typeof window !== "undefined" && Boolean(window.ethereum);

  // Restore the last network the user picked (e.g. Robinhood vs BSC)
  // across visits, same as autoconnect below.
  useEffect(() => {
    const stored = window.localStorage.getItem(TARGET_NETWORK_KEY) as ChainKey | null;
    if (stored && NETWORKS[stored]) {
      setTargetNetworkKeyState(stored);
    }
  }, []);

  const setTargetNetworkKey = useCallback((key: ChainKey) => {
    setTargetNetworkKeyState(key);
    window.localStorage.setItem(TARGET_NETWORK_KEY, key);
  }, []);

  const refreshSigner = useCallback(async (browserProvider: BrowserProvider) => {
    try {
      const accounts = await browserProvider.listAccounts();
      if (accounts.length === 0) {
        setAddress(null);
        setSigner(null);
        return;
      }
      const nextSigner = await browserProvider.getSigner();
      setSigner(nextSigner);
      setAddress(await nextSigner.getAddress());
      const network = await browserProvider.getNetwork();
      setChainId(Number(network.chainId));
    } catch {
      setAddress(null);
      setSigner(null);
    }
  }, []);

  // Silently reconnect on load if the user connected before and didn't
  // disconnect — mirrors autoConnect on the Solana wallet adapter.
  useEffect(() => {
    if (!window.ethereum) return;
    if (window.localStorage.getItem(AUTOCONNECT_KEY) !== "true") return;

    const browserProvider = new BrowserProvider(window.ethereum);
    setProvider(browserProvider);
    refreshSigner(browserProvider);
  }, [refreshSigner]);

  useEffect(() => {
    if (!window.ethereum) return;
    const ethereum = window.ethereum;

    function handleAccountsChanged(...args: unknown[]) {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        setAddress(null);
        setSigner(null);
        setProvider(null);
        window.localStorage.removeItem(AUTOCONNECT_KEY);
      } else if (provider) {
        refreshSigner(provider);
      }
    }

    function handleChainChanged() {
      window.location.reload();
    }

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [provider, refreshSigner]);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      window.open("https://metamask.io/download", "_blank", "noopener,noreferrer");
      return;
    }
    setConnecting(true);
    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);
      setProvider(browserProvider);
      await refreshSigner(browserProvider);
      window.localStorage.setItem(AUTOCONNECT_KEY, "true");
    } finally {
      setConnecting(false);
    }
  }, [refreshSigner]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
    window.localStorage.removeItem(AUTOCONNECT_KEY);
  }, []);

  const switchToTargetNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    const network = NETWORKS[targetNetworkKey];
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.chainIdHex }],
      });
    } catch (err: any) {
      // 4902 = chain not added to the wallet yet
      if (err?.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [network.walletAddChainParams],
        });
      } else {
        throw err;
      }
    }
  }, [targetNetworkKey]);

  const targetNetwork = NETWORKS[targetNetworkKey];

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      connected: Boolean(address),
      connecting,
      chainId,
      targetNetworkKey,
      targetNetwork,
      setTargetNetworkKey,
      isWrongNetwork: chainId !== null && chainId !== targetNetwork.chainId,
      provider,
      signer,
      hasInjectedWallet,
      connect,
      disconnect,
      switchToTargetNetwork,
    }),
    [
      address,
      connecting,
      chainId,
      targetNetworkKey,
      targetNetwork,
      setTargetNetworkKey,
      provider,
      signer,
      hasInjectedWallet,
      connect,
      disconnect,
      switchToTargetNetwork,
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletContextProvider");
  }
  return ctx;
}

export { networkByChainId };
