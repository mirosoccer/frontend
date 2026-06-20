"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User } from "lucide-react";
import type { Coach } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CoachCardProps {
  coach: Coach;
}

export default function CoachCard({ coach }: CoachCardProps) {
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
        {/* Avatar placeholder */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a]">
          <User className="h-5 w-5 text-white/30" />
        </div>

        {/* Name + formation */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {coach.name}
          </p>
          <span className="inline-block mt-0.5 rounded-md border border-white/16 bg-[#1a1a1a] px-1.5 py-0.5 text-[10px] font-bold tabular-nums tracking-wider text-white">
            {coach.formation}
          </span>
        </div>

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
              {/* Nationality */}
              <div className="rounded-md bg-[#1a1a1a] p-2">
                <span className="text-[10px] text-white/30">
                  Nationality
                </span>
                <p className="text-xs font-semibold text-white">
                  {coach.nationality}
                </p>
              </div>

              {/* News */}
              {coach.news.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                    Coach News
                  </p>
                  {coach.news.map((item) => (
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
                      <p className="mt-0.5 text-[11px] text-white/60">
                        {item.summary}
                      </p>
                      <p className="mt-0.5 text-[10px] text-white/30">
                        {item.source} &middot; {item.date}
                      </p>
                    </a>
                  ))}
                </div>
              )}

              {coach.news.length === 0 && (
                <p className="mt-2 text-xs text-white/30">
                  No recent news for this coach.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
