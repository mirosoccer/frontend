"use client";

interface SOLIconProps {
  size?: number;
  className?: string;
}

/**
 * Solana logo mark — gradient circle with three diagonal bars,
 * matching the official brand geometry.
 */
export default function SOLIcon({ size = 20, className = "" }: SOLIconProps) {
  const id = "sol-gradient";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SOL"
      role="img"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="50%" stopColor="#7C5CFC" />
          <stop offset="100%" stopColor="#00D18C" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="16" cy="16" r="16" fill={`url(#${id})`} />

      {/* Three diagonal bars — Solana logomark geometry */}
      {/* Bottom bar */}
      <path
        d="M8 21.5h13.2a1 1 0 0 1 .7.3l1.8 1.8a.5.5 0 0 1-.35.85H10.1a1 1 0 0 1-.7-.3L7.6 22.35a.5.5 0 0 1 .4-.85Z"
        fill="white"
      />
      {/* Middle bar */}
      <path
        d="M8 14.5h13.2a1 1 0 0 1 .7.3l1.8 1.8a.5.5 0 0 1-.35.85H10.1a1 1 0 0 1-.7-.3L7.6 15.35a.5.5 0 0 1 .4-.85Z"
        fill="white"
      />
      {/* Top bar */}
      <path
        d="M23.4 9.15 21.6 7.3a1 1 0 0 0-.7-.3H8a.5.5 0 0 0-.4.85l1.8 1.8a1 1 0 0 0 .7.3h13.2c.3 0 .46-.36.25-.6Z"
        fill="white"
      />
    </svg>
  );
}
