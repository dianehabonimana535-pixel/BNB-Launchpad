import { ContractFactory, type BrowserProvider, type JsonRpcSigner } from "ethers";
import { BEP20MEMETOKEN_ABI, BEP20MEMETOKEN_BYTECODE } from "./contract";

export interface CreateTokenParams {
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  metadataUri: string;
  recipient: string;
  revokeMint: boolean;
  revokeFreeze: boolean;
  revokeUpdate: boolean;
  onStep?: (step: MintStep) => void;
}

// These reflect the real, distinct asynchronous boundaries of the single
// on-chain transaction: building it, waiting on the wallet to sign it,
// having obtained the signature, broadcasting it, and confirming it. There
// is only one transaction (the contract deployment itself bundles the
// initial supply mint and any authority revocations into its
// constructor — no platform fee transfer), so these are the only points
// where we can honestly report progress. Nothing here is simulated.
export type MintStep =
  | "building"
  | "awaiting-signature"
  | "signed"
  | "sent"
  | "confirmed"
  | "complete";

export interface CreateTokenResult {
  tokenAddress: string;
  txHash: string;
}

export async function createToken(params: CreateTokenParams): Promise<CreateTokenResult> {
  const {
    signer,
    name,
    symbol,
    decimals,
    supply,
    metadataUri,
    recipient,
    revokeMint,
    revokeFreeze,
    revokeUpdate,
    onStep,
  } = params;

  const authority = await signer.getAddress();
  const totalSupplyBaseUnits = BigInt(Math.round(supply)) * 10n ** BigInt(decimals);

  onStep?.("building");

  const factory = new ContractFactory(BEP20MEMETOKEN_ABI, BEP20MEMETOKEN_BYTECODE, signer);

  // Step 1: ask the wallet (MetaMask, Trust Wallet, etc.) to sign the
  // deployment transaction. This is the ONLY moment the wallet's own
  // popup appears. Our own custom progress popup must not be shown
  // before this call resolves with a signed, broadcast transaction.
  onStep?.("awaiting-signature");

  const contract = await factory.deploy(
    name,
    symbol,
    decimals,
    totalSupplyBaseUnits,
    recipient,
    metadataUri,
    authority,
    revokeMint,
    revokeFreeze,
    revokeUpdate
  );

  const deployTx = contract.deploymentTransaction();
  if (!deployTx) {
    throw new Error("Wallet did not return a deployment transaction.");
  }

  // The wallet has returned a signed, broadcast transaction.
  onStep?.("signed");
  onStep?.("sent");

  // Step 2: wait for the network to mine and confirm it.
  const receipt = await deployTx.wait();
  if (!receipt || receipt.status !== 1) {
    throw new Error(
      "Transaction failed to confirm on-chain. Check BscScan with the transaction hash above for details."
    );
  }

  onStep?.("confirmed");
  onStep?.("complete");

  const tokenAddress = await contract.getAddress();

  return { tokenAddress, txHash: deployTx.hash };
}
