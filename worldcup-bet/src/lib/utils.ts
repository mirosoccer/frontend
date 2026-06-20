// ============================================================================
// WorldCup Bet — Utility Functions
// FIFA World Cup 2026 Betting dApp on Solana
// ============================================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateWallet(wallet: string, chars = 4): string {
  return `${wallet.slice(0, chars)}...${wallet.slice(-chars)}`;
}

export function formatSOL(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function getSolscanUrl(
  txSignature: string,
  cluster: "testnet" | "devnet" | "mainnet" = "testnet"
): string {
  const base = "https://solscan.io/tx";
  return cluster === "mainnet"
    ? `${base}/${txSignature}`
    : `${base}/${txSignature}?cluster=${cluster}`;
}

export function getTimeUntilMatch(dateStr: string): string {
  // returns "2h 30m" or "Live" or "Finished"
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Started";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes}m`;
}

export function getOutcomeLabel(
  outcome: string,
  teamA: string,
  teamB: string
): string {
  if (outcome === "teamA") return teamA;
  if (outcome === "teamB") return teamB;
  return "Draw";
}
