"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  MapPin,
  TrendingUp,
  Activity,
  Brain,
  Cloud,
  Mountain,
  Calendar,
} from "lucide-react";
import type { MatchDetail as MatchDetailType } from "@/lib/types";
import { getMatchById } from "@/lib/api";
import { cn, getTimeUntilMatch } from "@/lib/utils";
import BetSidebar from "./BetSidebar";
import PlayerCard from "./PlayerCard";
import CoachCard from "./CoachCard";
import MiroFishGraph from "./MiroFishGraph";

interface MatchDetailProps {
  matchId: string;
}

// ── Event icons ────────────────────────────────────────────────────────
function EventIcon({ type }: { type: string }) {
  switch (type) {
    case "goal":
      return <span className="text-sm">&#9917;</span>;
    case "yellow_card":
      return (
        <span className="inline-block h-3.5 w-2.5 rounded-[1px] bg-yellow-400" />
      );
    case "red_card":
      return (
        <span className="inline-block h-3.5 w-2.5 rounded-[1px] bg-red-500" />
      );
    case "substitution":
      return <span className="text-sm text-green-400">&#8644;</span>;
    case "var":
      return (
        <span className="text-[10px] font-bold text-blue-400">VAR</span>
      );
    default:
      return null;
  }
}

// ── Form streak circles ────────────────────────────────────────────────
function FormStreak({ streak, label }: { streak: string; label: string }) {
  const colors: Record<string, string> = {
    W: "bg-green-500",
    D: "bg-gray-500",
    L: "bg-red-500",
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-semibold text-white/30 uppercase w-10">
        {label}
      </span>
      {streak.split("").map((r, i) => (
        <div
          key={i}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white",
            colors[r] ?? "bg-gray-600"
          )}
          title={
            r === "W" ? "Win" : r === "D" ? "Draw" : r === "L" ? "Loss" : r
          }
        >
          {r}
        </div>
      ))}
    </div>
  );
}

// ── Countdown hook ─────────────────────────────────────────────────────
function useCountdown(dateStr: string) {
  const [text, setText] = useState(() => getTimeUntilMatch(dateStr));
  useEffect(() => {
    const id = setInterval(() => setText(getTimeUntilMatch(dateStr)), 30_000);
    return () => clearInterval(id);
  }, [dateStr]);
  return text;
}

export default function MatchDetail({ matchId }: MatchDetailProps) {
  const [match, setMatch] = useState<MatchDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTeamTab, setActiveTeamTab] = useState<"teamA" | "teamB">(
    "teamA"
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMatchById(matchId).then((data) => {
      if (!cancelled) {
        setMatch(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  const countdown = useCountdown(match?.date ?? "");

  const sim = match?.simulation;

  // Memoize stage label
  const stageLabel = useMemo(() => {
    if (!match) return "";
    const map: Record<string, string> = {
      group: `Group ${match.group}`,
      round16: "Round of 16",
      quarter: "Quarter-final",
      semi: "Semi-final",
      third: "Third Place",
      final: "Final",
    };
    return map[match.stage] ?? match.stage;
  }, [match]);

  // ── Loading state ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <p className="text-sm text-white/30">
            Loading match details...
          </p>
        </div>
      </div>
    );
  }

  // ── Not found state ────────────────────────────────────────────────
  if (!match) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-white/60">
          Match not found
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to matches
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back link */}
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/30 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to matches
      </Link>

      {/* Two-column layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ════════════════════════════════════════════════════════════
            MAIN CONTENT (~70%)
        ════════════════════════════════════════════════════════════ */}
        <div className="min-w-0 flex-1 space-y-6 lg:max-w-[70%]">
          {/* ── A) Live Score Header ──────────────────────────────── */}
          <div className="card-glow overflow-hidden">
            {/* Stage + venue bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 bg-[#1a1a1a] px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                {stageLabel}
              </span>
              <div className="flex items-center gap-3 text-[11px] text-white/30">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {match.venue}, {match.city}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {match.time}
                </span>
              </div>
            </div>

            {/* Score display */}
            <div className="px-4 py-6 sm:px-8">
              <div className="flex items-center justify-center gap-4 sm:gap-8">
                {/* Team A */}
                <div className="flex flex-col items-center gap-1 min-w-0">
                  <span className="text-3xl sm:text-4xl">{match.teamA.flag}</span>
                  <span className="text-sm font-bold text-white text-center">
                    {match.teamA.name}
                  </span>
                  <span className="text-[10px] text-white/30">
                    FIFA #{match.teamA.fifaRanking}
                  </span>
                </div>

                {/* Score / Status */}
                <div className="flex flex-col items-center gap-1">
                  {match.status === "live" && match.liveScore ? (
                    <>
                      <div className="flex items-center gap-3 sm:gap-5">
                        <span className="text-4xl sm:text-5xl font-black tabular-nums text-white">
                          {match.liveScore.teamAScore}
                        </span>
                        <span className="text-xl text-white/30">
                          -
                        </span>
                        <span className="text-4xl sm:text-5xl font-black tabular-nums text-white">
                          {match.liveScore.teamBScore}
                        </span>
                      </div>
                      <div className="badge-live">
                        {match.liveScore.minute}&apos;
                      </div>
                    </>
                  ) : match.status === "finished" && match.liveScore ? (
                    <>
                      <div className="flex items-center gap-3 sm:gap-5">
                        <span className="text-4xl sm:text-5xl font-black tabular-nums text-white">
                          {match.liveScore.teamAScore}
                        </span>
                        <span className="text-xl text-white/30">
                          -
                        </span>
                        <span className="text-4xl sm:text-5xl font-black tabular-nums text-white">
                          {match.liveScore.teamBScore}
                        </span>
                      </div>
                      <span className="rounded-full bg-[#1a1a1a] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
                        Full Time
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl sm:text-3xl font-bold text-white/30">
                        vs
                      </span>
                      <div className="flex items-center gap-1 text-xs text-white">
                        <Clock className="h-3 w-3" />
                        {countdown}
                      </div>
                    </>
                  )}
                </div>

                {/* Team B */}
                <div className="flex flex-col items-center gap-1 min-w-0">
                  <span className="text-3xl sm:text-4xl">{match.teamB.flag}</span>
                  <span className="text-sm font-bold text-white text-center">
                    {match.teamB.name}
                  </span>
                  <span className="text-[10px] text-white/30">
                    FIFA #{match.teamB.fifaRanking}
                  </span>
                </div>
              </div>

              {/* Events timeline */}
              {match.liveScore &&
                match.liveScore.events.length > 0 &&
                (match.status === "live" || match.status === "finished") && (
                  <div className="mt-5 space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Match Events
                    </p>
                    <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                      {match.liveScore.events.map((ev) => (
                        <div
                          key={ev.id}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs",
                            ev.team === "teamA"
                              ? "bg-blue-500/5"
                              : "bg-red-500/5"
                          )}
                        >
                          <span className="w-8 shrink-0 text-right tabular-nums font-semibold text-white/30">
                            {ev.minute}&apos;
                          </span>
                          <EventIcon type={ev.type} />
                          <span className="font-medium text-white">
                            {ev.playerName}
                          </span>
                          {ev.detail && (
                            <span className="truncate text-white/30">
                              &mdash; {ev.detail}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* ── B) MiroFish AI Prediction ────────────────────────── */}
          {sim && (
            <div className="card-glow overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/8 bg-[#1a1a1a] px-4 py-2.5">
                <Brain className="h-4 w-4 text-white" />
                <h2 className="text-sm font-bold text-white">
                  MiroFish AI Prediction
                </h2>
              </div>

              <div className="space-y-5 p-4">
                {/* Probability bars */}
                <div className="space-y-2">
                  {(
                    [
                      {
                        label: match.teamA.name,
                        value: sim.probabilities.teamA,
                        color: "bg-blue-500",
                      },
                      {
                        label: "Draw",
                        value: sim.probabilities.draw,
                        color: "bg-gray-500",
                      },
                      {
                        label: match.teamB.name,
                        value: sim.probabilities.teamB,
                        color: "bg-red-500",
                      },
                    ] as const
                  ).map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-white/60">
                          {item.label}
                        </span>
                        <span className="font-bold tabular-nums text-white">
                          {(item.value * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#1a1a1a]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value * 100}%` }}
                          transition={{
                            duration: 1,
                            delay: 0.2,
                            ease: "easeOut",
                          }}
                          className={cn("h-full rounded-full", item.color)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key stats grid */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatCard
                    icon={<TrendingUp className="h-3.5 w-3.5" />}
                    label="Predicted Score"
                    value={`${sim.predictedScore.teamA} - ${sim.predictedScore.teamB}`}
                  />
                  <StatCard
                    icon={<Activity className="h-3.5 w-3.5" />}
                    label="xG"
                    value={`${sim.xG.teamA.toFixed(1)} - ${sim.xG.teamB.toFixed(1)}`}
                  />
                  <StatCard
                    icon={<Brain className="h-3.5 w-3.5" />}
                    label="Confidence"
                    value={`${(sim.confidenceScore * 100).toFixed(0)}%`}
                  />
                  <StatCard
                    icon={<Activity className="h-3.5 w-3.5" />}
                    label="Volatility"
                    value={sim.volatility}
                    valueClass={
                      sim.volatility === "high"
                        ? "text-red-400"
                        : sim.volatility === "medium"
                          ? "text-white/50"
                          : "text-green-400"
                    }
                  />
                </div>

                {/* Form streak */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                    Recent Form
                  </p>
                  <FormStreak
                    streak={sim.formStreak.teamA}
                    label={match.teamA.code}
                  />
                  <FormStreak
                    streak={sim.formStreak.teamB}
                    label={match.teamB.code}
                  />
                </div>

                {/* H2H Record */}
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                    Head-to-Head ({sim.h2hRecord.totalMatches} matches)
                  </p>
                  <div className="flex h-4 overflow-hidden rounded-full">
                    <div
                      className="bg-blue-500 transition-all"
                      style={{
                        width: `${(sim.h2hRecord.teamAWins / sim.h2hRecord.totalMatches) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-gray-500 transition-all"
                      style={{
                        width: `${(sim.h2hRecord.draws / sim.h2hRecord.totalMatches) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-red-500 transition-all"
                      style={{
                        width: `${(sim.h2hRecord.teamBWins / sim.h2hRecord.totalMatches) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] tabular-nums text-white/30">
                    <span className="text-blue-400">
                      {match.teamA.code} {sim.h2hRecord.teamAWins}W
                    </span>
                    <span className="text-gray-400">
                      {sim.h2hRecord.draws}D
                    </span>
                    <span className="text-red-400">
                      {match.teamB.code} {sim.h2hRecord.teamBWins}W
                    </span>
                  </div>
                </div>

                {/* Context row: Rest days, Weather, Altitude */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-[#1a1a1a] p-2.5">
                    <div className="flex items-center gap-1 text-white/30">
                      <Calendar className="h-3 w-3" />
                      <span className="text-[10px] font-semibold uppercase">
                        Rest Days
                      </span>
                    </div>
                    <p className="mt-1 text-xs tabular-nums">
                      <span className="text-blue-400">
                        {match.teamA.code}: {sim.restDays.teamA}d
                      </span>
                      {" / "}
                      <span className="text-red-400">
                        {match.teamB.code}: {sim.restDays.teamB}d
                      </span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#1a1a1a] p-2.5">
                    <div className="flex items-center gap-1 text-white/30">
                      <Cloud className="h-3 w-3" />
                      <span className="text-[10px] font-semibold uppercase">
                        Weather
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white">
                      {sim.weather.temp}&deg;C {sim.weather.condition}
                    </p>
                    <p className="text-[10px] text-white/30">
                      {sim.weather.humidity}% humidity
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#1a1a1a] p-2.5">
                    <div className="flex items-center gap-1 text-white/30">
                      <Mountain className="h-3 w-3" />
                      <span className="text-[10px] font-semibold uppercase">
                        Altitude
                      </span>
                    </div>
                    <p className="mt-1 text-xs tabular-nums text-white">
                      {sim.venueAltitude.toLocaleString()}m
                    </p>
                  </div>
                </div>

                {/* Key factors */}
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                    Key Factors
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sim.keyFactors.map((f, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-white/16 bg-[#1a1a1a] px-2.5 py-1 text-[11px] text-white/60"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Update note */}
                <p className="text-[10px] text-white/30">
                  Simulation updates every 5-10 minutes &middot; Last updated{" "}
                  {new Date(sim.updatedAt).toLocaleTimeString()}
                </p>

                {/* Knowledge Graph */}
                <MiroFishGraph
                  nodes={sim.knowledgeGraph.nodes}
                  edges={sim.knowledgeGraph.edges}
                />
              </div>
            </div>
          )}

          {/* ── C) Team Panels ───────────────────────────────────── */}
          <div className="card-glow overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/8">
              {(["teamA", "teamB"] as const).map((tab) => {
                const team = tab === "teamA" ? match.teamA : match.teamB;
                const isActive = activeTeamTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTeamTab(tab)}
                    className={cn(
                      "relative flex-1 px-4 py-3 text-sm font-semibold transition-colors",
                      isActive
                        ? "text-white"
                        : "text-white/30 hover:text-white/60"
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="text-lg">{team.flag}</span>
                      {team.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="team-tab-underline"
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-white"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active team content */}
            <div className="p-4">
              {(() => {
                const team =
                  activeTeamTab === "teamA" ? match.teamA : match.teamB;
                const players =
                  activeTeamTab === "teamA"
                    ? match.teamAPlayers
                    : match.teamBPlayers;
                const coach =
                  activeTeamTab === "teamA"
                    ? match.teamACoach
                    : match.teamBCoach;

                return (
                  <div className="space-y-4">
                    {/* Team info */}
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{team.flag}</span>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {team.name}
                        </h3>
                        <p className="text-xs text-white/30">
                          FIFA Ranking: #{team.fifaRanking} &middot; Group{" "}
                          {team.group}
                        </p>
                      </div>
                    </div>

                    {/* Coach card */}
                    <div>
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                        Coach
                      </p>
                      <CoachCard coach={coach} />
                    </div>

                    {/* Player roster */}
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                        Squad ({players.length} players)
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {players.map((player) => (
                          <PlayerCard key={player.id} player={player} />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            BET SIDEBAR (~30%)
        ════════════════════════════════════════════════════════════ */}
        <div className="w-full shrink-0 lg:w-[30%] lg:max-w-sm">
          <div className="lg:sticky lg:top-24">
            <BetSidebar match={match} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Small stat card helper ─────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg bg-[#1a1a1a] p-2.5">
      <div className="flex items-center gap-1 text-white/30">
        {icon}
        <span className="text-[10px] font-semibold uppercase">{label}</span>
      </div>
      <p
        className={cn(
          "mt-1 text-sm font-bold tabular-nums",
          valueClass ?? "text-white"
        )}
      >
        {value}
      </p>
    </div>
  );
}
