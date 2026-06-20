"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Matches",     href: "/"           },
  { label: "My Bets",     href: "/my-bets"    },
  { label: "Leaderboard", href: "/leaderboard" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sticky top-0 z-50"
    >
      <nav
        className="h-16 border-b bg-[#080808]/90 backdrop-blur-xl"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-black tracking-[0.2em] text-white uppercase">
              SIUUU
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium transition-colors rounded-md",
                      active ? "text-white" : "text-white/40 hover:text-white/80 hover:bg-white/5"
                    )}
                  >
                    {label}
                    {active && (
                      <motion.span
                        layoutId="nav-line"
                        className="absolute inset-x-3 -bottom-[1px] h-[1px] bg-white"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right */}
          <div className="flex items-center gap-2">
            <div className="wallet-bw hidden sm:block">
              <WalletMultiButton />
            </div>
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              className="inline-flex md:hidden items-center justify-center rounded-md p-2 text-white/40 hover:text-white hover:bg-white/5"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-[#080808]/95 backdrop-blur-xl md:hidden"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <ul className="flex flex-col gap-0.5 px-4 py-3">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        pathname === href
                          ? "bg-white/8 text-white"
                          : "text-white/40 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="wallet-bw px-4 pb-4 sm:hidden">
                <WalletMultiButton />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Wallet adapter overrides */}
      <style jsx global>{`
        .wallet-bw .wallet-adapter-button {
          background: #fff !important;
          color: #000 !important;
          border-radius: 6px !important;
          font-size: 13px !important;
          height: 34px !important;
          padding: 0 14px !important;
          font-weight: 700 !important;
          transition: opacity 0.15s ease !important;
        }
        .wallet-bw .wallet-adapter-button:hover {
          background: rgba(255,255,255,0.85) !important;
        }
        .wallet-bw .wallet-adapter-button-start-icon svg {
          fill: #000 !important;
        }
      `}</style>
    </motion.header>
  );
}
