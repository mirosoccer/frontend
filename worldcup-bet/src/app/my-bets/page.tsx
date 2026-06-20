"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, Trophy, ExternalLink } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Navbar, Footer } from "@/components/layout";
import { getUserBets } from "@/lib/api";
import { cn, formatSOL, getSolscanUrl, getOutcomeLabel } from "@/lib/utils";
import type { UserBet } from "@/lib/types";

type FilterTab = "all" | "pending" | "won" | "lost";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

function StatusBadge({ status }: { status: UserBet["status"] }) {
  const config = {
    pending: {
      bg: "bg-yellow-500/15",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
      label: "Pending",
    },
    won: {
      bg: "bg-green-500/15",
      text: "text-green-400",
      border: "border-green-500/30",
      label: "Won",
    },
    lost: {
      bg: "bg-red-500/15",
      text: "text-red-400",
      border: "border-red-500/30",
      label: "Lost",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.bg,
        config.text,
        config.border
      )}
    >
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          status === "pending" && "bg-yellow-400 animate-pulse",
          status === "won" && "bg-green-400",
          status === "lost" && "bg-red-400"
        )}
      />
      {config.label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyBetsPage() {
  const { publicKey, connected } = useWallet();
  const [bets, setBets] = useState<UserBet[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  useEffect(() => {
    if (!connected || !publicKey) return;
    setLoading(true);
    getUserBets(publicKey.toBase58())
      .then(setBets)
      .finally(() => setLoading(false));
  }, [connected, publicKey]);

  const filteredBets = useMemo(() => {
    if (activeFilter === "all") return bets;
    return bets.filter((b) => b.status === activeFilter);
  }, [bets, activeFilter]);

  // Stats
  const stats = useMemo(() => {
    const totalWagered = bets.reduce((sum, b) => sum + b.amount, 0);
    const totalWon = bets
      .filter((b) => b.status === "won")
      .reduce((sum, b) => sum + (b.payout ?? 0), 0);
    const profitLoss = totalWon - totalWagered;
    const wonCount = bets.filter((b) => b.status === "won").length;
    const settledCount = bets.filter(
      (b) => b.status === "won" || b.status === "lost"
    ).length;
    const winRate = settledCount > 0 ? wonCount / settledCount : 0;
    return { totalWagered, totalWon, profitLoss, winRate, settledCount };
  }, [bets]);

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            My Bets
          </h1>
          <p className="mt-1 text-sm text-white/30">
            Track your SIUUU predictions
          </p>
        </motion.div>

        {/* ── Not connected ── */}
        {!connected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 py-20"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 border border-white/10">
              <Wallet className="h-9 w-9 text-white/60" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-white">
                Connect Wallet to view your bets
              </p>
              <p className="mt-1 text-sm text-white/30">
                Your bet history will appear here
              </p>
            </div>
            <div className="wallet-adapter-override">
              <WalletMultiButton />
            </div>
          </motion.div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        ) : (
          <>
            {/* ── Stats Summary ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {[
                {
                  label: "Total Wagered",
                  value: `${formatSOL(stats.totalWagered)} SOL`,
                  icon: TrendingUp,
                  color: "text-white",
                },
                {
                  label: "Total Won",
                  value: `${formatSOL(stats.totalWon)} SOL`,
                  icon: Trophy,
                  color: "text-green-400",
                },
                {
                  label: "Profit / Loss",
                  value: `${stats.profitLoss >= 0 ? "+" : ""}${formatSOL(stats.profitLoss)} SOL`,
                  icon: stats.profitLoss >= 0 ? TrendingUp : TrendingDown,
                  color: stats.profitLoss >= 0 ? "text-green-400" : "text-red-400",
                },
                {
                  label: "Win Rate",
                  value:
                    stats.settledCount > 0
                      ? `${(stats.winRate * 100).toFixed(1)}%`
                      : "N/A",
                  icon: Trophy,
                  color: "text-white/60",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="card-glow rounded-xl px-4 py-3.5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                    <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                  <p className={cn("text-lg font-bold tabular-nums", stat.color)}>
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* ── Filter Tabs ── */}
            <div className="mb-6 flex gap-1 rounded-lg bg-elevated p-1 w-fit">
              {FILTER_TABS.map((tab) => {
                const count =
                  tab.key === "all"
                    ? bets.length
                    : bets.filter((b) => b.status === tab.key).length;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={cn(
                      "relative rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                      activeFilter === tab.key
                        ? "bg-white/10 text-white"
                        : "text-white/30 hover:text-white/60"
                    )}
                  >
                    {tab.label}
                    <span className="ml-1.5 text-xs opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* ── Bet Cards ── */}
            {filteredBets.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-white/30">
                <Trophy className="h-10 w-10 opacity-30" />
                <p className="text-sm">No bets found for this filter</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredBets.map((bet, i) => {
                  const outcomeLabel = getOutcomeLabel(
                    bet.outcome,
                    bet.teamA.name,
                    bet.teamB.name
                  );

                  return (
                    <motion.div
                      key={bet.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: i * 0.06,
                        ease: "easeOut",
                      }}
                      whileHover={{ scale: 1.005 }}
                      className="card-glow overflow-hidden rounded-xl"
                    >
                      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Left: match info */}
                        <div className="flex items-center gap-4">
                          {/* Teams */}
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{bet.teamA.flag}</span>
                            <span className="text-xs font-medium text-white/30">
                              vs
                            </span>
                            <span className="text-2xl">{bet.teamB.flag}</span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">
                              {bet.teamA.name} vs {bet.teamB.name}
                            </span>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "text-xs font-semibold",
                                  bet.outcome === "draw"
                                    ? "text-white/50"
                                    : "text-white"
                                )}
                              >
                                {outcomeLabel}
                              </span>
                              <span className="text-[10px] text-white/10">|</span>
                              <span className="text-xs text-white/40 tabular-nums">
                                {formatSOL(bet.amount)} SOL
                              </span>
                              <span className="text-[10px] text-white/10">|</span>
                              <span className="text-[11px] text-white/30">
                                {formatDate(bet.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: status + links */}
                        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                          <StatusBadge status={bet.status} />

                          {bet.status === "won" && bet.payout != null && (
                            <span className="text-xs font-bold text-green-400 tabular-nums">
                              +{formatSOL(bet.payout)} SOL
                            </span>
                          )}

                          <div className="flex items-center gap-2">
                            <a
                              href={getSolscanUrl(bet.txSignature)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-white/60 transition-colors"
                            >
                              TX
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                            {bet.payoutTxSignature && (
                              <a
                                href={getSolscanUrl(bet.payoutTxSignature)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-green-400 hover:text-green-300 transition-colors"
                              >
                                Payout TX
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Wallet adapter style overrides (same as Navbar) */}
      <style jsx global>{`
        .wallet-adapter-override .wallet-adapter-button {
          background: #fff !important;
          color: #000 !important;
          border-radius: 8px !important;
          font-size: 13px !important;
          height: 36px !important;
          padding: 0 16px !important;
          font-weight: 600 !important;
          transition: opacity 0.2s ease !important;
        }
        .wallet-adapter-override .wallet-adapter-button:hover {
          opacity: 0.85 !important;
        }
      `}</style>
    </>
  );
}
