// ============================================================================
// WorldCup Bet — TypeScript Type Definitions
// FIFA World Cup 2026 Betting dApp on Solana
// ============================================================================

// Match status
export type MatchStatus = "upcoming" | "live" | "finished";
export type BetOutcome = "teamA" | "teamB" | "draw";

export interface Team {
  id: string;
  name: string;
  code: string; // 3-letter country code e.g. "BRA"
  flag: string; // emoji flag or URL
  group: string;
  fifaRanking: number;
}

export interface Player {
  id: string;
  name: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  number: number;
  age: number;
  club: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  injured: boolean;
  injuryDetail?: string;
  news: NewsItem[];
  imageUrl?: string;
}

export interface Coach {
  id: string;
  name: string;
  nationality: string;
  formation: string; // e.g. "4-3-3"
  news: NewsItem[];
  imageUrl?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  url: string;
}

export interface LiveScore {
  teamAScore: number;
  teamBScore: number;
  minute: number;
  half: "1st" | "2nd" | "HT" | "ET1" | "ET2" | "PEN" | "FT";
  events: MatchEvent[];
}

export interface MatchEvent {
  id: string;
  type: "goal" | "yellow_card" | "red_card" | "substitution" | "var";
  minute: number;
  team: "teamA" | "teamB";
  playerName: string;
  detail?: string;
}

export interface BetPool {
  totalSol: number;
  teamASol: number;
  drawSol: number;
  teamBSol: number;
  teamAPercent: number;
  drawPercent: number;
  teamBPercent: number;
  totalBets: number;
}

export interface MiroFishSimulation {
  matchId: string;
  updatedAt: string;
  probabilities: {
    teamA: number;
    draw: number;
    teamB: number;
  };
  predictedScore: { teamA: number; teamB: number };
  xG: { teamA: number; teamB: number };
  confidenceScore: number;
  volatility: "low" | "medium" | "high";
  keyFactors: string[];
  h2hRecord: {
    teamAWins: number;
    draws: number;
    teamBWins: number;
    totalMatches: number;
  };
  formStreak: { teamA: string; teamB: string };
  restDays: { teamA: number; teamB: number };
  weather: { temp: number; condition: string; humidity: number };
  venueAltitude: number;
  knowledgeGraph: {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
  };
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type:
    | "team"
    | "player"
    | "factor"
    | "stat"
    | "injury"
    | "weather"
    | "tactic";
  value: number; // importance 0-100
  color?: string;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  weight: number;
  label: string;
}

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  date: string;
  time: string;
  venue: string;
  city: string;
  group: string;
  stage: "group" | "round16" | "quarter" | "semi" | "third" | "final";
  status: MatchStatus;
  liveScore?: LiveScore;
  betPool: BetPool;
  simulation: MiroFishSimulation;
}

export interface MatchDetail extends Match {
  teamAPlayers: Player[];
  teamBPlayers: Player[];
  teamACoach: Coach;
  teamBCoach: Coach;
}

export interface UserBet {
  id: string;
  matchId: string;
  teamA: Team;
  teamB: Team;
  outcome: BetOutcome;
  amount: number; // SOL
  txSignature: string;
  timestamp: string;
  status: "pending" | "won" | "lost";
  payout?: number;
  payoutTxSignature?: string;
  matchStatus: MatchStatus;
}

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  profit: number;
  winRate: number;
  biggestWin: number;
}
