"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Clock, MapPin, Users } from "lucide-react";
import type { Match } from "@/lib/types";
import { cn, formatSOL, getTimeUntilMatch } from "@/lib/utils";

const STAGE_LABELS: Record<Match["stage"], string> = {
  group: "Group Stage",
  round16: "Round of 16",
  quarter: "Quarter-Final",
  semi: "Semi-Final",
  third: "3rd Place",
  final: "Final",
};

function getStageBadge(match: Match): string {
  if (match.stage === "group" && match.group !== "N/A") return `Group ${match.group}`;
  return STAGE_LABELS[match.stage];
}

function formatMatchDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface MatchCardProps {
  match: Match;
  index?: number;
}

export default function MatchCard({ match, index = 0 }: MatchCardProps) {
  const { teamA, teamB, status, liveScore, betPool, simulation } = match;
  const isLive = status === "live";
  const isFinished = status === "finished";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      {/* 
        FIX: Use Link as the outer wrapper — no nested clickable divs.
        motion.div only handles visual hover (y offset), pointer events flow through.
      */}
      <Link href={`/match/${match.id}`} className="block h-full group">
        <div className="bw-card h-full flex flex-col overflow-hidden">

          {/* ── Top Bar ── */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 bg-white/5 px-2.5 py-1 rounded-md">
              {getStageBadge(match)}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-white/30">
                <MapPin className="h-3 w-3" />
                {match.city}
              </span>
              {isLive ? (
                <span className="badge-live">Live</span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-white/30">
                  <Clock className="h-3 w-3" />
                  {formatMatchDate(match.date)}
                </span>
              )}
            </div>
          </div>

          {/* ── Teams + Score ── */}
          <div className="px-4 py-5 flex-1">
            <div className="flex items-center justify-between">
              {/* Team A */}
              <div className="flex flex-col items-center gap-1.5 w-[35%]">
                <span className="text-3xl">{teamA.flag}</span>
                <span className="text-sm font-bold text-white text-center leading-tight">
                  {teamA.name}
                </span>
                <span className="text-[10px] text-white/30 font-mono">{teamA.code}</span>
              </div>

              {/* Score / VS */}
              <div className="flex flex-col items-center gap-1 w-[30%]">
                {(isLive || isFinished) && liveScore ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-white tabular-nums">
                        {liveScore.teamAScore}
                      </span>
                      <span className="text-lg font-bold text-white/20">—</span>
                      <span className="text-3xl font-black text-white tabular-nums">
                        {liveScore.teamBScore}
                      </span>
                    </div>
                    {isLive && (
                      <span className="text-xs font-bold tabular-nums text-white/60">
                        {liveScore.minute}&apos;
                        {liveScore.half === "HT" ? " HT" : ""}
                      </span>
                    )}
                    {isFinished && (
                      <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                        Full Time
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-xl font-black text-white/20">VS</span>
                    <span className="text-xs font-mono text-white/50 tabular-nums">
                      {getTimeUntilMatch(match.date)}
                    </span>
                  </>
                )}
              </div>

              {/* Team B */}
              <div className="flex flex-col items-center gap-1.5 w-[35%]">
                <span className="text-3xl">{teamB.flag}</span>
                <span className="text-sm font-bold text-white text-center leading-tight">
                  {teamB.name}
                </span>
                <span className="text-[10px] text-white/30 font-mono">{teamB.code}</span>
              </div>
            </div>
          </div>

          {/* ── MiroFish Bar ── */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Brain className="h-3 w-3 text-white/40" />
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                MiroFish AI
              </span>
            </div>
            <div className="flex h-4 rounded overflow-hidden bg-white/5">
              <motion.div
                className="flex items-center justify-center bg-white/80"
                initial={{ width: 0 }}
                animate={{ width: `${simulation.probabilities.teamA * 100}%` }}
                transition={{ duration: 0.7, delay: index * 0.06 + 0.25, ease: "easeOut" }}
              >
                <span className="text-[9px] font-bold text-black">
                  {Math.round(simulation.probabilities.teamA * 100)}%
                </span>
              </motion.div>
              <motion.div
                className="flex items-center justify-center bg-white/30"
                initial={{ width: 0 }}
                animate={{ width: `${simulation.probabilities.draw * 100}%` }}
                transition={{ duration: 0.7, delay: index * 0.06 + 0.35, ease: "easeOut" }}
              >
                <span className="text-[9px] font-bold text-black">
                  {Math.round(simulation.probabilities.draw * 100)}%
                </span>
              </motion.div>
              <motion.div
                className="flex items-center justify-center bg-white/60"
                initial={{ width: 0 }}
                animate={{ width: `${simulation.probabilities.teamB * 100}%` }}
                transition={{ duration: 0.7, delay: index * 0.06 + 0.45, ease: "easeOut" }}
              >
                <span className="text-[9px] font-bold text-black">
                  {Math.round(simulation.probabilities.teamB * 100)}%
                </span>
              </motion.div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-white/30">{teamA.code}</span>
              <span className="text-[9px] text-white/30">Draw</span>
              <span className="text-[9px] text-white/30">{teamB.code}</span>
            </div>
          </div>

          {/* ── Footer: TVL + CTA ── */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-[7px] font-black text-white">◎</span>
                </div>
                <span className="text-xs font-semibold text-white tabular-nums">
                  {formatSOL(betPool.totalSol)}
                </span>
                <span className="text-[10px] text-white/30">SOL</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-white/20" />
                <span className="text-xs text-white/40 tabular-nums">{betPool.totalBets}</span>
              </div>
            </div>

            <span className={cn(
              "px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all",
              isFinished
                ? "bg-white/5 text-white/30"
                : "bg-white text-black group-hover:bg-white/90"
            )}>
              {isFinished ? "View" : "Bet Now"}
            </span>
          </div>

        </div>
      </Link>
    </motion.div>
  );
}
