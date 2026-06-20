"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  ChevronUp,
  ChevronDown,
  Users,
  Coins,
  Award,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Navbar, Footer } from "@/components/layout";
import { getLeaderboard } from "@/lib/api";
import { cn, formatSOL, truncateWallet } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";

type SortKey = keyof Pick<
  LeaderboardEntry,
  "rank" | "totalBets" | "totalWagered" | "totalWon" | "profit" | "winRate" | "biggestWin"
>;

function AnimatedNumber({
  value,
  decimals = 1,
  prefix = "",
  suffix = "",
  duration = 1200,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0; // eslint-disable-line prefer-const
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (value - start) * eased;
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="flex items-center gap-1 text-white font-black">
        <span className="text-lg">👑</span> 1
      </span>
    );
  if (rank === 2)
    return (
      <span className="flex items-center gap-1 text-white/70 font-bold">
        <span className="text-base">🥈</span> 2
      </span>
    );
  if (rank === 3)
    return (
      <span className="flex items-center gap-1 text-white/50 font-bold">
        <span className="text-base">🥉</span> 3
      </span>
    );
  return <span className="text-white/30 font-medium">{rank}</span>;
}

export default function LeaderboardPage() {
  const { publicKey } = useWallet();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortAsc((v) => !v);
      } else {
        setSortKey(key);
        setSortAsc(key === "rank");
      }
    },
    [sortKey]
  );

  const sorted = useMemo(() => {
    const copy = [...entries];
    copy.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const diff = (aVal as number) - (bVal as number);
      return sortAsc ? diff : -diff;
    });
    return copy;
  }, [entries, sortKey, sortAsc]);

  // Aggregate stats
  const aggStats = useMemo(() => {
    const totalBettors = entries.length;
    const totalWagered = entries.reduce((s, e) => s + e.totalWagered, 0);
    const biggestWin = entries.reduce(
      (max, e) => Math.max(max, e.biggestWin),
      0
    );
    return { totalBettors, totalWagered, biggestWin };
  }, [entries]);

  const userWallet = publicKey?.toBase58();

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-40" />;
    return sortAsc ? (
      <ChevronUp className="h-3 w-3 text-white" />
    ) : (
      <ChevronDown className="h-3 w-3 text-white" />
    );
  };

  return (
    <>
      <Navbar />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 10, -10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          >
            <Trophy className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Leaderboard
            </h1>
            <p className="mt-0.5 text-sm text-white/30">
              Top bettors on SIUUU
            </p>
          </div>
        </motion.div>

        {/* ── Top Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {[
            {
              label: "Total Bettors",
              value: aggStats.totalBettors,
              decimals: 0,
              suffix: "",
              icon: Users,
              color: "text-white/60",
            },
            {
              label: "Total SOL Wagered",
              value: aggStats.totalWagered,
              decimals: 1,
              suffix: " SOL",
              icon: Coins,
              color: "text-white",
            },
            {
              label: "Biggest Single Win",
              value: aggStats.biggestWin,
              decimals: 1,
              suffix: " SOL",
              icon: Award,
              color: "text-green-400",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className="card-glow rounded-xl px-5 py-4"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <stat.icon className={cn("h-4 w-4", stat.color)} />
                <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className={cn("text-2xl font-bold", stat.color)}>
                <AnimatedNumber
                  value={stat.value}
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                />
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Leaderboard Table ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="overflow-x-auto rounded-xl border border-white/5"
          >
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-elevated/60">
                  {(
                    [
                      { key: "rank" as SortKey, label: "#", width: "w-14", sortable: true as boolean },
                      { key: "rank" as SortKey, label: "Wallet", width: "w-40", sortable: false as boolean },
                      { key: "totalBets" as SortKey, label: "Bets", width: "w-16", sortable: true as boolean },
                      { key: "totalWagered" as SortKey, label: "Wagered", width: "", sortable: true as boolean },
                      { key: "totalWon" as SortKey, label: "Won", width: "", sortable: true as boolean },
                      { key: "profit" as SortKey, label: "Profit", width: "", sortable: true as boolean },
                      { key: "winRate" as SortKey, label: "Win Rate", width: "", sortable: true as boolean },
                      { key: "biggestWin" as SortKey, label: "Best Win", width: "", sortable: true as boolean },
                    ] as { key: SortKey; label: string; width: string; sortable: boolean }[]
                  ).map((col, ci) => (
                    <th
                      key={ci}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      className={cn(
                        "group px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/30",
                        col.width,
                        col.sortable !== false && "cursor-pointer select-none hover:text-white/60"
                      )}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.sortable !== false && <SortIcon col={col.key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {sorted.map((entry, i) => {
                  const isUser = userWallet === entry.wallet;
                  const isTop3 = entry.rank <= 3;

                  return (
                    <motion.tr
                      key={entry.wallet}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.25 + i * 0.04,
                        ease: "easeOut",
                      }}
                      className={cn(
                        "border-b border-white/[0.03] transition-colors",
                        isUser && "bg-white/[0.06]",
                        entry.rank === 1 && "bg-white/[0.05]",
                        entry.rank === 2 && "bg-white/[0.04]",
                        entry.rank === 3 && "bg-white/[0.03]",
                        !isTop3 && !isUser && "hover:bg-white/[0.02]"
                      )}
                    >
                      {/* Rank */}
                      <td className="px-3 py-3 text-center">
                        <RankBadge rank={entry.rank} />
                      </td>

                      {/* Wallet */}
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "font-mono text-xs",
                            isUser
                              ? "text-white font-semibold"
                              : "text-white/40"
                          )}
                        >
                          {truncateWallet(entry.wallet, 6)}
                          {isUser && (
                            <span className="ml-1.5 text-[10px] text-white/60 font-semibold">
                              (You)
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Total Bets */}
                      <td className="px-3 py-3 tabular-nums text-white/60">
                        {entry.totalBets}
                      </td>

                      {/* Wagered */}
                      <td className="px-3 py-3 tabular-nums text-white/60">
                        {formatSOL(entry.totalWagered)}
                      </td>

                      {/* Won */}
                      <td className="px-3 py-3 tabular-nums text-white/60">
                        {formatSOL(entry.totalWon)}
                      </td>

                      {/* Profit */}
                      <td
                        className={cn(
                          "px-3 py-3 tabular-nums font-semibold",
                          entry.profit >= 0 ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {entry.profit >= 0 ? "+" : ""}
                        {formatSOL(entry.profit)}
                      </td>

                      {/* Win Rate */}
                      <td className="px-3 py-3 tabular-nums text-white/60">
                        {(entry.winRate * 100).toFixed(1)}%
                      </td>

                      {/* Biggest Win */}
                      <td className="px-3 py-3 tabular-nums text-white font-semibold">
                        {formatSOL(entry.biggestWin)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </main>

      <Footer />
    </>
  );
}
