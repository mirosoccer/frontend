"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Tv2, Users } from "lucide-react";
import type { Match, MatchStatus } from "@/lib/types";
import { getMatches } from "@/lib/api";
import { cn, formatSOL } from "@/lib/utils";
import MatchCard from "./MatchCard";

const STATUS_TABS: { label: string; value: MatchStatus | "all" }[] = [
  { label: "All",      value: "all"      },
  { label: "Live",     value: "live"     },
  { label: "Upcoming", value: "upcoming" },
  { label: "Finished", value: "finished" },
];

const GROUP_OPTIONS = [
  "All Groups","Group A","Group B","Group C",
  "Group D","Group E","Group F","Group G","Group H",
] as const;

export default function MatchGrid() {
  const [matches, setMatches]       = useState<Match[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeStatus, setStatus]   = useState<MatchStatus | "all">("all");
  const [activeGroup, setGroup]     = useState<string>("All Groups");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const data = await getMatches();
      if (!cancelled) { setMatches(data); setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let r = [...matches];
    if (activeStatus !== "all")        r = r.filter(m => m.status === activeStatus);
    if (activeGroup !== "All Groups")  r = r.filter(m => m.group === activeGroup.replace("Group ", ""));
    return r;
  }, [matches, activeStatus, activeGroup]);

  const totalTvl  = useMemo(() => matches.reduce((s, m) => s + m.betPool.totalSol, 0), [matches]);
  const liveCount = useMemo(() => matches.filter(m => m.status === "live").length, [matches]);

  return (
    <section className="w-full">

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-wrap items-center gap-6 mb-6"
      >
        <span className="text-sm text-white/40">
          <span className="font-semibold text-white">{matches.length}</span> Matches
        </span>
        <span className="text-sm text-white/40">
          TVL: <span className="font-semibold text-white tabular-nums">{formatSOL(totalTvl)}</span> SOL
        </span>
        {liveCount > 0 && (
          <span className="flex items-center gap-1.5 text-sm text-white/40">
            <Activity className="h-3.5 w-3.5 text-white" />
            <span className="font-semibold text-white">{liveCount}</span> Live
          </span>
        )}
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatus(value)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeStatus === value
                  ? "bg-white text-black"
                  : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
              )}
            >
              {label}
              {value === "live" && liveCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-black text-[9px] font-bold">
                  {liveCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <select
          value={activeGroup}
          onChange={e => setGroup(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium text-white/60 focus:outline-none focus:ring-1 focus:ring-white/30 cursor-pointer"
        >
          {GROUP_OPTIONS.map(g => (
            <option key={g} value={g} className="bg-neutral-900">{g}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bw-card h-64 shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-white/20">
          {matches.length === 0 ? (
            <>
              <Tv2 className="h-10 w-10 mb-3" />
              <p className="text-sm font-medium text-white/40">No matches loaded yet</p>
              <p className="text-xs text-white/20 mt-1">Connect backend API to see matches</p>
            </>
          ) : (
            <>
              <Users className="h-10 w-10 mb-3" />
              <p className="text-sm font-medium text-white/40">No matches found</p>
              <p className="text-xs text-white/20 mt-1">Try changing your filters</p>
            </>
          )}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {filtered.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} />
          ))}
        </motion.div>
      )}
    </section>
  );
}
