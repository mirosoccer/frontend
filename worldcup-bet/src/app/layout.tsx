import type { Metadata } from "next";
import localFont from "next/font/local";
import dynamic from "next/dynamic";
import { SolanaWalletProvider } from "@/components/providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const RonaldoSIUU = dynamic(
  () => import("@/components/ronaldo/RonaldoSIUU"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "SIUUU | AI-Powered World Cup Predictions on Solana",
  description:
    "AI-powered FIFA World Cup 2026 prediction engine on Solana. Fast, transparent, on-chain betting with MiroFish simulation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "#080808", color: "#fff" }}
      >
        <SolanaWalletProvider>
          <div className="min-h-screen">{children}</div>
        </SolanaWalletProvider>
        <RonaldoSIUU />
      </body>
    </html>
  );
}
