import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatBnb(wei: number): string {
  return (wei / 1_000_000_000_000_000_000).toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}
