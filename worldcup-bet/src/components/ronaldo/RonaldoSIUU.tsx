"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "./Confetti";
import { getSolscanUrl, formatSOL } from "@/lib/utils";

// ─── Ronaldo SIUU pixel art (16×20 grid, scaled) ────────────────────────────
// Each row is an array of color codes.
// _  = transparent
// H  = hair (dark brown/black)
// S  = skin (tan)
// J  = jersey (white/green Portugal)
// G  = green jersey accent
// W  = white shorts
// SH = shoe (dark)
// SK = skin (legs)

const _ = "transparent";
const H = "#1a1a1a"; // dark hair
const S = "#c8956c"; // skin tone
const J = "#e8e8e8"; // white jersey
const G = "#2d6a4f"; // green accent
const W = "#f0f0f0"; // white shorts
const SH = "#222222"; // shoes
const SK = "#c8956c"; // skin (legs)

// 20 rows x 16 cols — SIUU celebration pose:
// Arms spread wide, leaning back, chest out, one leg kicked up
const PIXEL_GRID: string[][] = [
  // Row 0-1: Hair / head top
  [_, _, _, _, _, _, _, H, H, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, H, H, H, H, _, _, _, _, _, _],
  // Row 2-3: Face
  [_, _, _, _, _, _, H, S, S, H, _, _, _, _, _, _],
  [_, _, _, _, _, _, S, S, S, S, _, _, _, _, _, _],
  // Row 4: Neck
  [_, _, _, _, _, _, _, S, S, _, _, _, _, _, _, _],
  // Row 5-6: Shoulders & arms spread wide (SIUU pose)
  [_, _, G, J, J, J, J, J, J, J, J, J, J, G, _, _],
  [_, G, J, _, _, _, J, J, J, J, _, _, _, J, G, _],
  // Row 7-8: Arms fully extended, torso
  [S, S, _, _, _, _, J, G, G, J, _, _, _, _, S, S],
  [S, _, _, _, _, _, J, J, J, J, _, _, _, _, _, S],
  // Row 9: Lower torso
  [_, _, _, _, _, _, J, J, J, J, _, _, _, _, _, _],
  // Row 10: Waist
  [_, _, _, _, _, _, G, G, G, G, _, _, _, _, _, _],
  // Row 11-12: Shorts
  [_, _, _, _, _, _, W, W, W, W, _, _, _, _, _, _],
  [_, _, _, _, _, _, W, W, W, W, _, _, _, _, _, _],
  // Row 13-14: Legs — one leg down, one kicked back (SIUU)
  [_, _, _, _, _, _, SK, _, _, SK, _, _, _, _, _, _],
  [_, _, _, _, _, _, SK, _, _, _, SK, _, _, _, _, _],
  // Row 15-16: Lower legs
  [_, _, _, _, _, _, SK, _, _, _, _, SK, _, _, _, _],
  [_, _, _, _, _, _, SK, _, _, _, _, _, SK, _, _, _],
  // Row 17: Socks
  [_, _, _, _, _, _, J, _, _, _, _, _, J, _, _, _],
  // Row 18-19: Shoes
  [_, _, _, _, _, SH, SH, _, _, _, _, _, SH, SH, _, _],
  [_, _, _, _, _, SH, SH, _, _, _, _, SH, SH, SH, _, _],
];

const PIXEL_SIZE = 4; // each cell = 4x4 px => 64x80 total, scaled up with CSS
const GRID_COLS = 16;
const GRID_ROWS = 20;

interface BetSuccessDetail {
  amount?: number;
  txSignature?: string;
}

const FIRST_VISIT_KEY = "worldcup-bet-siuu-shown";

export default function RonaldoSIUU() {
  const [visible, setVisible] = useState(false);
  const [betDetail, setBetDetail] = useState<BetSuccessDetail | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((detail?: BetSuccessDetail) => {
    setBetDetail(detail ?? null);
    setVisible(true);

    // Try playing audio
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } catch {
      // audio may not be available
    }

    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, 4000);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Listen for "bet-success" custom event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<BetSuccessDetail>).detail;
      show(detail);
    };

    window.addEventListener("bet-success", handler);
    return () => window.removeEventListener("bet-success", handler);
  }, [show]);

  // First-visit trigger
  useEffect(() => {
    if (typeof window === "undefined") return;
    const shown = sessionStorage.getItem(FIRST_VISIT_KEY);
    if (!shown) {
      sessionStorage.setItem(FIRST_VISIT_KEY, "1");
      const t = setTimeout(() => show(), 500);
      return () => clearTimeout(t);
    }
  }, [show]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/sounds/siuu.mp3" preload="none" />

      <AnimatePresence>
        {visible && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismiss}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Confetti */}
            <Confetti count={35} />

            {/* Content */}
            <motion.div
              className="relative z-10 flex flex-col items-center gap-4"
              initial={{ y: 200, opacity: 0, scale: 0.7 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 15,
                mass: 0.8,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* SIUUUUUU text */}
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 12,
                  delay: 0.2,
                }}
                className="relative"
              >
                <h2
                  className="text-5xl sm:text-7xl font-black tracking-wider text-center select-none"
                  style={{
                    fontFamily: "monospace",
                    color: "#ffd700",
                    textShadow:
                      "0 0 20px rgba(255,215,0,0.6), 0 0 40px rgba(255,215,0,0.3), 2px 2px 0 #a8882c",
                    imageRendering: "pixelated",
                  }}
                >
                  SIUUUUUU!
                </h2>
              </motion.div>

              {/* Pixel art Ronaldo */}
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 14,
                  delay: 0.1,
                }}
                className="relative"
                style={{
                  width: GRID_COLS * PIXEL_SIZE * 3,
                  height: GRID_ROWS * PIXEL_SIZE * 3,
                  imageRendering: "pixelated",
                }}
              >
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${GRID_COLS}, ${PIXEL_SIZE * 3}px)`,
                    gridTemplateRows: `repeat(${GRID_ROWS}, ${PIXEL_SIZE * 3}px)`,
                    filter: "drop-shadow(0 0 12px rgba(212,175,55,0.4))",
                  }}
                >
                  {PIXEL_GRID.flat().map((color, i) => (
                    <div
                      key={i}
                      style={{
                        width: PIXEL_SIZE * 3,
                        height: PIXEL_SIZE * 3,
                        backgroundColor: color,
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Bet detail (after successful bet) */}
              {betDetail && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center gap-2 rounded-xl border border-yellow-500/30 bg-gray-950/80 px-6 py-3 backdrop-blur-md"
                >
                  {betDetail.amount != null && (
                    <p className="text-sm text-gray-300">
                      Bet placed:{" "}
                      <span className="font-bold text-yellow-400">
                        {formatSOL(betDetail.amount)} SOL
                      </span>
                    </p>
                  )}
                  {betDetail.txSignature && (
                    <a
                      href={getSolscanUrl(betDetail.txSignature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View on Solscan
                    </a>
                  )}
                </motion.div>
              )}

              {/* Dismiss hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1.5 }}
                className="text-xs text-gray-400 select-none"
              >
                Click anywhere to dismiss
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
