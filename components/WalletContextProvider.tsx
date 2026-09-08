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

// --- EIP-6963: Multi Injected Provider Discovery ---
// With more than one wallet extension installed, a bare `window.ethereum`
// is unreliable: it's whichever extension won the injection race, which is
// why connecting could silently pick the "wrong"/random wallet. EIP-6963
// lets every installed wallet announce itself (with its own name + icon)
// instead of fighting over a single global, so we can show a real picker
// and use the exact wallet the user selects.
export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EthereumProvider;
}

interface EIP6963AnnounceEvent extends Event {
  detail: EIP6963ProviderDetail;
}

const WALLET_RDNS_KEY = "bnbmint.walletRdns";

function useEip6963Providers() {
  const [providers, setProviders] = useState<Map<string, EIP6963ProviderDetail>>(new Map());

  useEffect(() => {
    function onAnnounce(event: Event) {
      const detail = (event as EIP6963AnnounceEvent).detail;
      if (!detail?.info?.uuid) return;
      setProviders((prev) => {
        if (prev.has(detail.info.uuid)) return prev;
        const next = new Map(prev);
        next.set(detail.info.uuid, detail);
        return next;
      });
    }
    window.addEventListener("eip6963:announceProvider", onAnnounce);
    // Ask every installed wallet to (re-)announce itself.
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () => window.removeEventListener("eip6963:announceProvider", onAnnounce);
  }, []);

  return providers;
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
  /** All wallets detected via EIP-6963, each with its own name + icon. */
  availableWallets: EIP6963ProviderDetail[];
  /** Info (name + icon) for the wallet currently connected, if known. */
  selectedWallet: EIP6963ProviderInfo | null;
  connect: (rdns?: string) => Promise<void>;
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
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderInfo | null>(null);
  const [activeRawProvider, setActiveRawProvider] = useState<EthereumProvider | null>(null);

  const eip6963Providers = useEip6963Providers();
  const availableWallets = useMemo(() => Array.from(eip6963Providers.values()), [eip6963Providers]);

  const hasInjectedWallet =
    typeof window !== "undefined" && (Boolean(window.ethereum) || availableWallets.length > 0);

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

  // Resolve which raw EIP-1193 provider to talk to for a given wallet
  // choice: prefer the exact EIP-6963 provider the user picked (or
  // previously picked, by rdns), fall back to the sole detected wallet if
  // there's only one, and only fall back to the single global
  // `window.ethereum` for older wallets that don't support EIP-6963 yet.
  const resolveRawProvider = useCallback(
    (rdns?: string): { raw: EthereumProvider; info: EIP6963ProviderInfo | null } | null => {
      if (rdns) {
        const match = availableWallets.find((w) => w.info.rdns === rdns);
        if (match) return { raw: match.provider, info: match.info };
      }
      if (availableWallets.length === 1) {
        return { raw: availableWallets[0].provider, info: availableWallets[0].info };
      }
      if (availableWallets.length === 0 && window.ethereum) {
        return { raw: window.ethereum, info: null };
      }
      return null;
    },
    [availableWallets]
  );

  // Silently reconnect on load if the user connected before and didn't
  // disconnect — mirrors autoConnect on the Solana wallet adapter. Waits a
  // tick so EIP-6963 announcements have time to arrive, so autoconnect
  // reuses the exact same wallet (icon included) rather than guessing.
  useEffect(() => {
    if (window.localStorage.getItem(AUTOCONNECT_KEY) !== "true") return;
    const storedRdns = window.localStorage.getItem(WALLET_RDNS_KEY) || undefined;

    const timeout = setTimeout(() => {
      const resolved = resolveRawProvider(storedRdns);
      if (!resolved) return;
      const browserProvider = new BrowserProvider(resolved.raw);
      setProvider(browserProvider);
      setActiveRawProvider(resolved.raw);
      setSelectedWallet(resolved.info);
      refreshSigner(browserProvider);
    }, 150);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableWallets.length]);

  useEffect(() => {
    const ethereum = activeRawProvider;
    if (!ethereum) return;

    function handleAccountsChanged(...args: unknown[]) {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        setAddress(null);
        setSigner(null);
        setProvider(null);
        setActiveRawProvider(null);
        setSelectedWallet(null);
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
  }, [activeRawProvider, provider, refreshSigner]);

  // If `rdns` is omitted and more than one wallet is installed, the caller
  // (WalletButton) is expected to have shown a picker first and to call
  // connect() again with the chosen rdns -- this never silently guesses
  // between multiple installed wallets.
  const connect = useCallback(
    async (rdns?: string) => {
      const resolved = resolveRawProvider(rdns);
      if (!resolved) {
        if (availableWallets.length > 1) return; // let the picker handle it
        window.open("https://metamask.io/download", "_blank", "noopener,noreferrer");
        return;
      }
      setConnecting(true);
      try {
        const browserProvider = new BrowserProvider(resolved.raw);
        await browserProvider.send("eth_requestAccounts", []);
        setProvider(browserProvider);
        setActiveRawProvider(resolved.raw);
        setSelectedWallet(resolved.info);
        await refreshSigner(browserProvider);
        window.localStorage.setItem(AUTOCONNECT_KEY, "true");
        if (resolved.info) {
          window.localStorage.setItem(WALLET_RDNS_KEY, resolved.info.rdns);
        } else {
          window.localStorage.removeItem(WALLET_RDNS_KEY);
        }
      } finally {
        setConnecting(false);
      }
    },
    [availableWallets.length, refreshSigner, resolveRawProvider]
  );

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
    setActiveRawProvider(null);
    setSelectedWallet(null);
    window.localStorage.removeItem(AUTOCONNECT_KEY);
    window.localStorage.removeItem(WALLET_RDNS_KEY);
  }, []);

  const switchToTargetNetwork = useCallback(async () => {
    if (!activeRawProvider) return;
    const network = NETWORKS[targetNetworkKey];
    try {
      await activeRawProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.chainIdHex }],
      });
    } catch (err: any) {
      // 4902 = chain not added to the wallet yet
      if (err?.code === 4902) {
        await activeRawProvider.request({
          method: "wallet_addEthereumChain",
          params: [network.walletAddChainParams],
        });
      } else {
        throw err;
      }
    }
  }, [activeRawProvider, targetNetworkKey]);

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
      availableWallets,
      selectedWallet,
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
      availableWallets,
      selectedWallet,
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

