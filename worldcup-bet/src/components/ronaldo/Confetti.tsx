"use client";

import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  swayAmount: number;
  rotation: number;
}

const GOLD_COLORS = [
  "#d4af37",
  "#f0d060",
  "#a8882c",
  "#ffd700",
  "#e6c200",
  "#ffec8b",
  "#daa520",
  "#f5c842",
];

export default function Confetti({ count = 30 }: { count?: number }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const generated: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 6,
      color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
      swayAmount: -30 + Math.random() * 60,
      rotation: Math.random() * 360,
    }));
    setPieces(generated);
  }, [count]);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
        {pieces.map((p) => (
          <div
            key={p.id}
            className="confetti-piece absolute"
            style={
              {
                left: `${p.left}%`,
                top: "-10px",
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                "--sway": `${p.swayAmount}px`,
                "--rotation": `${p.rotation}deg`,
                borderRadius: Math.random() > 0.5 ? "50%" : "1px",
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) translateX(var(--sway)) rotate(calc(var(--rotation) * 0.5));
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) translateX(calc(var(--sway) * -0.7)) rotate(var(--rotation));
            opacity: 0.9;
          }
          75% {
            transform: translateY(75vh) translateX(calc(var(--sway) * 0.5)) rotate(calc(var(--rotation) * 1.5));
            opacity: 0.6;
          }
          100% {
            transform: translateY(105vh) translateX(var(--sway)) rotate(calc(var(--rotation) * 2));
            opacity: 0;
          }
        }

        .confetti-piece {
          animation: confetti-fall var(--duration, 3s) ease-in forwards;
          animation-delay: var(--delay, 0s);
          box-shadow: 0 0 3px rgba(212, 175, 55, 0.4);
        }
      `}</style>
    </>
  );
}
