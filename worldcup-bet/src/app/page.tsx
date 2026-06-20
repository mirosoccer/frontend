"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Navbar, Footer } from "@/components/layout";
import { MatchGrid } from "@/components/matches";

const ZepGraph = dynamic(
  () => import("@/components/zep-graph/ZepGraph"),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative z-10">

        {/* Hero */}
        <section className="flex flex-col items-center text-center px-4 pt-14 pb-6 sm:pt-20 sm:pb-10">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[0.15em] text-white mb-2 uppercase"
          >
            SIUUU
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-sm text-white/30 max-w-md leading-relaxed mb-8"
          >
            AI-Powered Predictions &bull; On-Chain Betting &bull; Solana
          </motion.p>
        </section>

        {/* Zep Knowledge Graph */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <ZepGraph />
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="divider-gold w-full mb-10" />
        </div>

        {/* Match grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
          <MatchGrid />
        </section>

      </main>
      <Footer />
    </>
  );
}
