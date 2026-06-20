// ============================================================================
// WorldCup Bet — API Layer
// FIFA World Cup 2026 Betting dApp on Solana
//
// All functions currently return empty data / null.
// Each one has a clear TODO block for your backend team to wire up.
// ============================================================================

import type {
  Match,
  MatchDetail,
  MiroFishSimulation,
  Player,
  Coach,
  UserBet,
  LeaderboardEntry,
  BetPool,
  BetOutcome,
  MatchStatus,
} from "./types";

// ── Base URL ─────────────────────────────────────────────────────────────────
// TODO: Set this from your environment variable — used in all real fetch() calls below
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Simulated network delay (remove in production) ───────────────────────────
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ============================================================================
// getMatches — Fetch all matches, optionally filtered
// ============================================================================
/**
 * TODO: REPLACE WITH REAL API CALL
 *
 * Expected endpoint:
 *   GET ${API_BASE}/api/matches?status=upcoming&group=A&stage=group
 *
 * Query params (all optional):
 *   - status: "upcoming" | "live" | "finished"
 *   - group:  string (e.g. "A", "B")
 *   - stage:  "group" | "round16" | "quarter" | "semi" | "third" | "final"
 *
 * Expected response shape:
 *   { matches: Match[] }
 *
 * Replace body with:
 *   const params = new URLSearchParams();
 *   if (filters?.status) params.set("status", filters.status);
 *   if (filters?.group)  params.set("group",  filters.group);
 *   if (filters?.stage)  params.set("stage",  filters.stage);
 *   const res = await fetch(`${API_BASE}/api/matches?${params}`);
 *   const json = await res.json();
 *   return json.matches;
 */
export async function getMatches(filters?: {
  status?: MatchStatus;
  group?: string;
  stage?: Match["stage"];
}): Promise<Match[]> {
  await delay();
  void filters;
  // TODO: replace with real fetch — see comment above
  return [];
}

// ============================================================================
// getMatchById — Fetch a single match with full detail (players, coaches)
// ============================================================================
/**
 * TODO: REPLACE WITH REAL API CALL
 *
 * Expected endpoint:
 *   GET ${API_BASE}/api/matches/:matchId
 *
 * Expected response shape:
 *   MatchDetail (extends Match with teamAPlayers, teamBPlayers, teamACoach, teamBCoach)
 *
 * Replace body with:
 *   const res = await fetch(`${API_BASE}/api/matches/${matchId}`);
 *   if (!res.ok) return null;
 *   return res.json();
 */
export async function getMatchById(matchId: string): Promise<MatchDetail | null> {
  await delay(400);
  void matchId;
  // TODO: replace with real fetch — see comment above
  return null;
}

// ============================================================================
// getSimulation — Fetch the latest MiroFish simulation for a match
// ============================================================================
/**
 * TODO: REPLACE WITH REAL API CALL
 *
 * Expected endpoint:
 *   GET ${API_BASE}/api/simulations/:matchId
 *
 * Expected response shape:
 *   MiroFishSimulation
 *
 * Note: This should be polled every 5-10 minutes to get fresh simulation data.
 *
 * Replace body with:
 *   const res = await fetch(`${API_BASE}/api/simulations/${matchId}`);
 *   if (!res.ok) return null;
 *   return res.json();
 */
export async function getSimulation(matchId: string): Promise<MiroFishSimulation | null> {
  await delay(200);
  void matchId;
  // TODO: replace with real fetch — see comment above
  return null;
}

// ============================================================================
// getTeamPlayers — Fetch the squad list for a team
// ============================================================================
/**
 * TODO: REPLACE WITH REAL API CALL
 *
 * Expected endpoint:
 *   GET ${API_BASE}/api/teams/:teamId/players
 *
 * Expected response shape:
 *   { players: Player[] }
 *
 * Replace body with:
 *   const res = await fetch(`${API_BASE}/api/teams/${teamId}/players`);
 *   const json = await res.json();
 *   return json.players;
 */
export async function getTeamPlayers(teamId: string): Promise<Player[]> {
  await delay(200);
  void teamId;
  // TODO: replace with real fetch — see comment above
  return [];
}

// ============================================================================
// getPlayerById — Fetch detailed info for a single player
// ============================================================================
/**
 * TODO: REPLACE WITH REAL API CALL
 *
 * Expected endpoint:
 *   GET ${API_BASE}/api/players/:playerId
 *
 * Expected response shape:
 *   Player
 *
 * Replace body with:
 *   const res = await fetch(`${API_BASE}/api/players/${playerId}`);
 *   if (!res.ok) return null;
 *   return res.json();
 */
export async function getPlayerById(playerId: string): Promise<Player | null> {
  await delay(150);
  void playerId;
  // TODO: replace with real fetch — see comment above
  return null;
}

// ============================================================================
// getCoachById — Fetch detailed info for a coach
// ============================================================================
/**
 * TODO: REPLACE WITH REAL API CALL
 *
 * Expected endpoint:
 *   GET ${API_BASE}/api/coaches/:coachId
 *
 * Expected response shape:
 *   Coach
 *
 * Replace body with:
 *   const res = await fetch(`${API_BASE}/api/coaches/${coachId}`);
 *   if (!res.ok) return null;
 *   return res.json();
 */
export async function getCoachById(coachId: string): Promise<Coach | null> {
  await delay(150);
  void coachId;
  // TODO: replace with real fetch — see comment above
  return null;
}

// ============================================================================
// getUserBets — Fetch bet history for a connected wallet
// ============================================================================
/**
 * TODO: REPLACE WITH REAL API CALL
 *
 * Expected endpoint:
 *   GET ${API_BASE}/api/bets?wallet=<walletAddress>
 *
 * Expected response shape:
 *   { bets: UserBet[] }  — sorted by timestamp descending
 *
 * Replace body with:
 *   const res = await fetch(`${API_BASE}/api/bets?wallet=${wallet}`);
 *   const json = await res.json();
 *   return json.bets;
 */
export async function getUserBets(wallet: string): Promise<UserBet[]> {
  await delay(350);
  void wallet;
  // TODO: replace with real fetch — see comment above
  return [];
}

// ============================================================================
// getLeaderboard — Fetch the global betting leaderboard
// ============================================================================
/**
 * TODO: REPLACE WITH REAL API CALL
 *
 * Expected endpoint:
 *   GET ${API_BASE}/api/leaderboard?limit=50&sortBy=profit
 *
 * Expected response shape:
 *   { entries: LeaderboardEntry[] }
 *
 * Replace body with:
 *   const res = await fetch(`${API_BASE}/api/leaderboard`);
 *   const json = await res.json();
 *   return json.entries;
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  await delay(300);
  // TODO: replace with real fetch — see comment above
  return [];
}

// ============================================================================
// getPoolBalance — Fetch the on-chain pool balance for a match
// ============================================================================
/**
 * TODO: REPLACE WITH REAL API CALL
 *
 * Option A — via backend:
 *   GET ${API_BASE}/api/pools/:matchId/balance
 *
 * Option B — read directly from Solana (preferred for decentralisation):
 *   const [poolPda] = PublicKey.findProgramAddressSync(
 *     [Buffer.from("pool"), Buffer.from(matchId)],
 *     PROGRAM_ID
 *   );
 *   const accountInfo = await connection.getAccountInfo(poolPda);
 *   const poolData = POOL_LAYOUT.decode(accountInfo.data);
 *
 * Expected response shape:
 *   BetPool
 */
export async function getPoolBalance(matchId: string): Promise<BetPool | null> {
  await delay(200);
  void matchId;
  // TODO: replace with real fetch — see comment above
  return null;
}

// ============================================================================
// placeBet — Sign & send a bet transaction on Solana
// ============================================================================
/**
 * TODO: REPLACE WITH REAL SOLANA TRANSACTION
 *
 * Production flow:
 *   1. Build the Anchor instruction:
 *        const tx = await program.methods
 *          .placeBet(matchId, { [outcome]: {} }, new BN(amount * LAMPORTS_PER_SOL))
 *          .accounts({
 *            bettor:        wallet.publicKey,
 *            pool:          poolPda,
 *            betRecord:     betRecordPda,
 *            systemProgram: SystemProgram.programId,
 *          })
 *          .transaction();
 *
 *   2. Have the user sign:
 *        const signed = await wallet.signTransaction(tx);
 *
 *   3. Send & confirm:
 *        const sig = await connection.sendRawTransaction(signed.serialize());
 *        await connection.confirmTransaction(sig, "confirmed");
 *        return { success: true, txSignature: sig, betId: ... };
 *
 * PDAs:
 *   - pool:      [b"pool", matchId]
 *   - betRecord: [b"bet",  matchId, wallet.publicKey]
 */
export async function placeBet(
  matchId: string,
  outcome: BetOutcome,
  amount: number,
  wallet: string
): Promise<{ success: boolean; txSignature: string; betId: string }> {
  // Validate
  if (amount < 0.1) throw new Error("Minimum bet is 0.1 SOL");

  // TODO: replace with real Solana transaction — see comment above
  await delay(1200); // simulate signing + confirmation time

  void matchId; void outcome; void wallet;

  // Mock tx signature until real program is wired up
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const mockTxSig = Array.from({ length: 64 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");

  return {
    success: true,
    txSignature: mockTxSig,
    betId: `bet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
}
