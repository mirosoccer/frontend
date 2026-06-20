"use client";

import Link from "next/link";

const SOCIAL_LINKS = [
  { label: "Twitter", href: "#" },
  { label: "Discord", href: "#" },
  { label: "GitHub",  href: "#" },
] as const;

export default function Footer() {
  return (
    <footer
      className="bg-[#080808]"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-sm font-black tracking-[0.15em] text-white/60 uppercase">SIUUU</span>
          </Link>

          <ul className="flex items-center gap-5">
            {SOCIAL_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-medium text-white/30 hover:text-white transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="my-6 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between">
          <p className="text-[11px] text-white/20">
            Powered by MiroFish AI &middot; Solana Testnet
          </p>
          <p className="text-[11px] text-white/20">
            &copy; {new Date().getFullYear()} SIUUU
          </p>
        </div>
      </div>
    </footer>
  );
}
