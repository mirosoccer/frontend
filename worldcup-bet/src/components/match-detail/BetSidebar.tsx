"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, ExternalLink, Check, Wallet } from "lucide-react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import type { MatchDetail, BetOutcome } from "@/lib/types";
import { placeBet } from "@/lib/api";
import { cn, formatSOL, truncateWallet, getSolscanUrl } from "@/lib/utils";

interface BetSidebarProps {
  match: MatchDetail;
}

const QUICK_AMOUNTS = [0.1, 0.5, 1.0, 5.0] as const;

interface TxResult {
  txSignature: string;
  outcome: BetOutcome;
  amount: number;
  timestamp: string;
}

export default function BetSidebar({ match }: BetSidebarProps) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [selectedOutcome, setSelectedOutcome] = useState<BetOutcome | null>(
    null
  );
  const [amount, setAmount] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<TxResult | null>(null);

  // Suppress unused var warnings — connection will be used in production
  void connection;

  const pool = match.betPool;
  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount >= 0.1;
  const canPlaceBet =
    connected && selectedOutcome !== null && isValidAmount && !isPlacing;
  const isFinished = match.status === "finished";

  const handlePlaceBet = useCallback(async () => {
    if (!canPlaceBet || !publicKey || !selectedOutcome) return;

    setIsPlacing(true);
    setError(null);

    try {
      const result = await placeBet(
        match.id,
        selectedOutcome,
        parsedAmount,
        publicKey.toBase58()
      );

      if (result.success) {
        const txData: TxResult = {
          txSignature: result.txSignature,
          outcome: selectedOutcome,
          amount: parsedAmount,
          timestamp: new Date().toISOString(),
        };
        setTxResult(txData);

        // Dispatch custom event for Ronaldo SIUU animation
        window.dispatchEvent(
          new CustomEvent("bet-success", {
            detail: txData,
          })
        );

        // Reset form
        setSelectedOutcome(null);
        setAmount("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bet");
    } finally {
      setIsPlacing(false);
    }
  }, [canPlaceBet, publicKey, selectedOutcome, parsedAmount, match.id]);

  const outcomeLabel = (outcome: BetOutcome) => {
    if (outcome === "teamA") return match.teamA.name;
    if (outcome === "teamB") return match.teamB.name;
    return "Draw";
  };

  const outcomePercent = (outcome: BetOutcome) => {
    if (outcome === "teamA") return pool.teamAPercent;
    if (outcome === "teamB") return pool.teamBPercent;
    return pool.drawPercent;
  };

  const outcomeSol = (outcome: BetOutcome) => {
    if (outcome === "teamA") return pool.teamASol;
    if (outcome === "teamB") return pool.teamBSol;
    return pool.drawSol;
  };

  return (
    <div className="space-y-4">
      {/* Pool Stats */}
      <div className="card-glow p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30">
          Betting Pool
        </h3>
        <p className="mt-1 text-2xl font-bold tabular-nums text-white">
          {formatSOL(pool.totalSol)} SOL
        </p>
        <p className="text-xs text-white/30">
          {pool.totalBets} bets placed
        </p>

        {/* Distribution bar */}
        <div className="mt-3 flex h-3 overflow-hidden rounded-full">
          <div
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${pool.teamAPercent}%` }}
          />
          <div
            className="bg-gray-500 transition-all duration-500"
            style={{ width: `${pool.drawPercent}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${pool.teamBPercent}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-white/30">
          <span className="text-blue-400">
            {match.teamA.code} {pool.teamAPercent}%
          </span>
          <span className="text-gray-400">Draw {pool.drawPercent}%</span>
          <span className="text-red-400">
            {match.teamB.code} {pool.teamBPercent}%
          </span>
        </div>
      </div>

      {/* Bet Selection — disabled if finished */}
      {isFinished ? (
        <div className="card-glow p-4 text-center">
          <p className="text-sm font-semibold text-white/30">
            Match Finished
          </p>
          <p className="mt-1 text-xs text-white/30">
            Betting is closed for this match.
          </p>
        </div>
      ) : (
        <>
          {/* Outcome buttons */}
          <div className="card-glow p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">
              Select Outcome
            </h3>
            <div className="space-y-2">
              {(["teamA", "draw", "teamB"] as BetOutcome[]).map((outcome) => {
                const isSelected = selectedOutcome === outcome;
                return (
                  <motion.button
                    key={outcome}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setSelectedOutcome(isSelected ? null : outcome)
                    }
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 text-left transition-all",
                      isSelected
                        ? "border-white/30 bg-white/10 shadow-[0_0_16px_rgba(255,255,255,0.08)]"
                        : "border-white/8 bg-[#1a1a1a] hover:border-white/16 hover:bg-[#222]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isSelected
                            ? "text-white"
                            : "text-white"
                        )}
                      >
                        {outcomeLabel(outcome)}
                      </span>
                      <div className="text-right">
                        <span
                          className={cn(
                            "text-sm font-bold tabular-nums",
                            isSelected
                              ? "text-white"
                              : "text-white/60"
                          )}
                        >
                          {outcomePercent(outcome)}%
                        </span>
                        <p className="text-[10px] tabular-nums text-white/30">
                          {formatSOL(outcomeSol(outcome))} SOL
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div className="card-glow p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">
              Bet Amount
            </h3>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="0.00"
                className="w-full rounded-lg border border-white/8 bg-[#1a1a1a] px-4 py-3 pr-16 text-sm font-semibold tabular-nums text-white placeholder-white/30 outline-none transition-colors focus:border-white/40 focus:ring-1 focus:ring-white/40"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/30">
                SOL
              </span>
            </div>

            {/* Quick amounts */}
            <div className="mt-2 flex gap-2">
              {QUICK_AMOUNTS.map((qa) => (
                <button
                  key={qa}
                  onClick={() => {
                    setAmount(qa.toString());
                    setError(null);
                  }}
                  className={cn(
                    "flex-1 rounded-md border py-1.5 text-xs font-semibold tabular-nums transition-all",
                    parseFloat(amount) === qa
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-white/8 bg-[#1a1a1a] text-white/60 hover:border-white/16 hover:text-white"
                  )}
                >
                  {qa}
                </button>
              ))}
              {connected && (
                <button
                  onClick={() => {
                    // In production, read wallet balance via connection.getBalance()
                    setAmount("10.0");
                    setError(null);
                  }}
                  className="flex-1 rounded-md border border-white/8 bg-[#1a1a1a] py-1.5 text-xs font-semibold text-white/50 transition-all hover:border-white/16 hover:text-white"
                >
                  Max
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="mt-2 text-xs font-medium text-red-400">{error}</p>
            )}
          </div>

          {/* Place Bet Button */}
          <motion.button
            whileTap={canPlaceBet ? { scale: 0.97 } : undefined}
            disabled={!canPlaceBet}
            onClick={handlePlaceBet}
            className={cn(
              "w-full rounded-xl py-4 text-sm font-bold uppercase tracking-wider transition-all",
              canPlaceBet
                ? "bg-white text-black shadow-lg shadow-white/10 hover:shadow-white/20"
                : "cursor-not-allowed bg-[#1a1a1a] text-white/30"
            )}
          >
            {isPlacing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing Bet...
              </span>
            ) : !connected ? (
              <span className="inline-flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet to Bet
              </span>
            ) : selectedOutcome === null ? (
              "Select an Outcome"
            ) : !isValidAmount ? (
              "Enter Amount (min 0.1 SOL)"
            ) : (
              `Place Bet — ${formatSOL(parsedAmount)} SOL`
            )}
          </motion.button>
        </>
      )}

      {/* Pool Momentum Placeholder */}
      <div className="card-glow p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30">
          Pool Momentum
        </h3>
        <div className="mt-3 flex h-24 items-center justify-center rounded-lg border border-dashed border-white/8 bg-[#1a1a1a]">
          <p className="text-xs text-white/30">
            Bet distribution over time (coming soon)
          </p>
        </div>
      </div>

      {/* Transaction Result */}
      {txResult && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glow border-green-500/30 p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-3.5 w-3.5 text-green-400" />
            </div>
            <h3 className="text-sm font-semibold text-green-400">
              Bet Placed Successfully
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/30">Amount</span>
              <span className="font-semibold tabular-nums text-white">
                {formatSOL(txResult.amount)} SOL
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/30">Outcome</span>
              <span className="font-semibold text-white">
                {outcomeLabel(txResult.outcome)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/30">TX</span>
              <a
                href={getSolscanUrl(txResult.txSignature)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-400 transition-colors hover:text-blue-300"
              >
                {truncateWallet(txResult.txSignature, 6)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-white/30">Time</span>
              <span className="tabular-nums text-white/60">
                {new Date(txResult.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
