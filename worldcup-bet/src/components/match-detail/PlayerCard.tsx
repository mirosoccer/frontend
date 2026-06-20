"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertTriangle } from "lucide-react";
import type { Player } from "@/lib/types";
import { cn } from "@/lib/utils";

const POSITION_COLORS: Record<Player["position"], string> = {
  GK: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  DEF: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  MID: "bg-green-500/20 text-green-400 border-green-500/30",
  FWD: "bg-red-500/20 text-red-400 border-red-500/30",
};

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      className={cn(
        "card-glow cursor-pointer overflow-hidden",
        expanded && "border-white/16"
      )}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Collapsed view */}
      <div className="flex items-center gap-3 p-3">
        {/* Number */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a] text-sm font-bold tabular-nums text-white/60">
          {player.number}
        </div>

        {/* Name + position */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {player.name}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className={cn(
                "inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                POSITION_COLORS[player.position]
              )}
            >
              {player.position}
            </span>
            {(player.goals > 0 || player.assists > 0) && (
              <span className="text-[11px] tabular-nums text-white/30">
                {player.goals > 0 && `${player.goals}G`}
                {player.goals > 0 && player.assists > 0 && " "}
                {player.assists > 0 && `${player.assists}A`}
              </span>
            )}
          </div>
        </div>

        {/* Injury badge */}
        {player.injured && (
          <div className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5">
            <AlertTriangle className="h-3 w-3 text-red-400" />
            <span className="text-[10px] font-semibold text-red-400">INJ</span>
          </div>
        )}

        {/* Expand chevron */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-white/30" />
        </motion.div>
      </div>

      {/* Expanded view */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/8 px-3 pb-3 pt-3">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-[#1a1a1a] p-2">
                  <span className="text-white/30">Age</span>
                  <p className="font-semibold text-white">
                    {player.age}
                  </p>
                </div>
                <div className="rounded-md bg-[#1a1a1a] p-2">
                  <span className="text-white/30">Club</span>
                  <p className="truncate font-semibold text-white">
                    {player.club}
                  </p>
                </div>
                <div className="rounded-md bg-[#1a1a1a] p-2">
                  <span className="text-white/30">Goals</span>
                  <p className="font-semibold text-white">
                    {player.goals}
                  </p>
                </div>
                <div className="rounded-md bg-[#1a1a1a] p-2">
                  <span className="text-white/30">Assists</span>
                  <p className="font-semibold text-white">
                    {player.assists}
                  </p>
                </div>
                <div className="rounded-md bg-[#1a1a1a] p-2">
                  <span className="text-white/30">
                    Yellow Cards
                  </span>
                  <p className="font-semibold text-yellow-400">
                    {player.yellowCards}
                  </p>
                </div>
                <div className="rounded-md bg-[#1a1a1a] p-2">
                  <span className="text-white/30">
                    Red Cards
                  </span>
                  <p className="font-semibold text-red-400">
                    {player.redCards}
                  </p>
                </div>
              </div>

              {/* Injury detail */}
              {player.injured && player.injuryDetail && (
                <div className="mt-2 flex items-start gap-2 rounded-md bg-red-500/10 p-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                  <p className="text-xs text-red-300">{player.injuryDetail}</p>
                </div>
              )}

              {/* News */}
              {player.news.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                    Latest News
                  </p>
                  {player.news.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="block rounded-md bg-[#1a1a1a] p-2 transition-colors hover:bg-[#222]"
                    >
                      <p className="text-xs font-medium text-white">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-white/30">
                        {item.source} &middot; {item.date}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
