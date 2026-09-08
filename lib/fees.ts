import type { ChainKey } from "./network";

export interface FeeEstimate {
  deployGasNative: number;
  revokeGasNative: number;
  networkFeeNative: number;
  platformCreationFee: number;
  platformRevokeFee: number;
  totalNative: number;
}

// Rough gas-unit estimate for deploying BEP20MemeToken.sol (constructor
// mints the initial supply and can zero out up to 3 authorities, all in
// the same deployment transaction). This is the same contract, same gas
// cost in gas *units*, on every EVM chain it's deployed to -- what
// differs per chain below is only the typical price of each gas unit.
const DEPLOY_GAS_UNITS = 950_000;
const PER_REVOKED_AUTHORITY_GAS_UNITS = 5_000;

// Typical gas price per network, in gwei. These are stable ballparks for
// the pre-signature estimate shown in the UI -- the wallet's own popup
// always shows the exact, live gas price and final total before signing.
// Robinhood Chain is an Arbitrum Orbit L2, which typically prices gas far
// below BSC's L1-style pricing; adjust this if you observe otherwise once
// mainnet traffic is heavier.
const TYPICAL_GAS_PRICE_GWEI: Record<ChainKey, number> = {
  bsc: 1,
  robinhood: 0.05,
  "robinhood-testnet": 0.05,
};

const GWEI_TO_NATIVE = 1e-9;

export const PLATFORM_CREATION_FEE = 0;
export const PLATFORM_REVOKE_FEE = 0;

export function estimateFees(chain: ChainKey, authoritiesToRevokeCount: number): FeeEstimate {
  const gasPriceNativePerUnit = TYPICAL_GAS_PRICE_GWEI[chain] * GWEI_TO_NATIVE;

  const deployGasNative = DEPLOY_GAS_UNITS * gasPriceNativePerUnit;
  const revokeGasNative =
    authoritiesToRevokeCount * PER_REVOKED_AUTHORITY_GAS_UNITS * gasPriceNativePerUnit;

  const platformCreationFee = PLATFORM_CREATION_FEE;
  const platformRevokeFee = authoritiesToRevokeCount * PLATFORM_REVOKE_FEE;

  const totalNative = deployGasNative + revokeGasNative + platformCreationFee + platformRevokeFee;

  return {
    deployGasNative,
    revokeGasNative,
    networkFeeNative: deployGasNative + revokeGasNative,
    platformCreationFee,
    platformRevokeFee,
    totalNative,
  };
}
