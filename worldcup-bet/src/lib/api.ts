// ============================================================================
// SIUUU — API Layer
// FIFA World Cup 2026 Betting dApp on Solana
//
// Currently returns MOCK data so you can see the UI working.
// Each function has a TODO block for your backend team to wire up real APIs.
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

// ============================================================================
// MOCK DATA — inline so the UI works out of the box
// ============================================================================

const sim = (matchId: string, tA: number, dr: number, tB: number): MiroFishSimulation => ({
  matchId,
  updatedAt: new Date().toISOString(),
  probabilities: { teamA: tA, draw: dr, teamB: tB },
  predictedScore: { teamA: Math.round(tA * 3), teamB: Math.round(tB * 3) },
  xG: { teamA: +(tA * 2.5).toFixed(1), teamB: +(tB * 2.5).toFixed(1) },
  confidenceScore: 72,
  volatility: "medium",
  keyFactors: ["Home advantage", "Key player fitness", "Recent form", "Head-to-head record"],
  h2hRecord: { teamAWins: 5, draws: 3, teamBWins: 4, totalMatches: 12 },
  formStreak: { teamA: "WWDLW", teamB: "WDWWL" },
  restDays: { teamA: 4, teamB: 3 },
  weather: { temp: 24, condition: "Clear", humidity: 55 },
  venueAltitude: 0,
  knowledgeGraph: {
    nodes: [
      { id: "n1", label: "Team Form", type: "stat", value: 85 },
      { id: "n2", label: "Injury Report", type: "injury", value: 60 },
      { id: "n3", label: "Tactics", type: "tactic", value: 70 },
      { id: "n4", label: "Weather", type: "weather", value: 30 },
      { id: "n5", label: "Key Player", type: "player", value: 90 },
      { id: "n6", label: "H2H Record", type: "stat", value: 65 },
    ],
    edges: [
      { source: "n1", target: "n5", weight: 0.9, label: "impacts" },
      { source: "n2", target: "n5", weight: 0.8, label: "affects" },
      { source: "n3", target: "n1", weight: 0.6, label: "shapes" },
      { source: "n4", target: "n3", weight: 0.3, label: "influences" },
      { source: "n6", target: "n1", weight: 0.5, label: "informs" },
    ],
  },
});

const pool = (total: number, aPct: number, dPct: number): BetPool => ({
  totalSol: total,
  teamASol: +(total * aPct).toFixed(2),
  drawSol: +(total * dPct).toFixed(2),
  teamBSol: +(total * (1 - aPct - dPct)).toFixed(2),
  teamAPercent: Math.round(aPct * 100),
  drawPercent: Math.round(dPct * 100),
  teamBPercent: Math.round((1 - aPct - dPct) * 100),
  totalBets: Math.floor(total * 8),
});

const t = (id: string, name: string, code: string, flag: string, group: string, rank: number) =>
  ({ id, name, code, flag, group, fifaRanking: rank });

const MOCK_MATCHES: Match[] = [
  // ── LIVE matches ──
  {
    id: "m1",
    teamA: t("arg", "Argentina", "ARG", "\u{1F1E6}\u{1F1F7}", "A", 1),
    teamB: t("usa", "United States", "USA", "\u{1F1FA}\u{1F1F8}", "A", 11),
    date: new Date().toISOString(), time: "20:00",
    venue: "MetLife Stadium", city: "New Jersey", group: "A", stage: "group", status: "live",
    liveScore: {
      teamAScore: 2, teamBScore: 1, minute: 67, half: "2nd",
      events: [
        { id: "e1", type: "goal", minute: 12, team: "teamA", playerName: "L. Messi" },
        { id: "e2", type: "goal", minute: 34, team: "teamB", playerName: "C. Pulisic" },
        { id: "e3", type: "yellow_card", minute: 41, team: "teamB", playerName: "W. McKennie" },
        { id: "e4", type: "goal", minute: 55, team: "teamA", playerName: "J. Alvarez" },
      ],
    },
    betPool: pool(342.5, 0.55, 0.2), simulation: sim("m1", 0.55, 0.2, 0.25),
  },
  {
    id: "m5",
    teamA: t("ned", "Netherlands", "NED", "\u{1F1F3}\u{1F1F1}", "E", 7),
    teamB: t("mex", "Mexico", "MEX", "\u{1F1F2}\u{1F1FD}", "E", 14),
    date: new Date().toISOString(), time: "18:00",
    venue: "Estadio Azteca", city: "Mexico City", group: "E", stage: "group", status: "live",
    liveScore: {
      teamAScore: 0, teamBScore: 0, minute: 28, half: "1st",
      events: [
        { id: "e10", type: "yellow_card", minute: 15, team: "teamB", playerName: "E. Alvarez" },
      ],
    },
    betPool: pool(178.2, 0.45, 0.28), simulation: sim("m5", 0.45, 0.28, 0.27),
  },

  // ── UPCOMING matches ──
  {
    id: "m2",
    teamA: t("bra", "Brazil", "BRA", "\u{1F1E7}\u{1F1F7}", "B", 3),
    teamB: t("ger", "Germany", "GER", "\u{1F1E9}\u{1F1EA}", "B", 12),
    date: new Date(Date.now() + 86400000).toISOString(), time: "18:00",
    venue: "SoFi Stadium", city: "Los Angeles", group: "B", stage: "group", status: "upcoming",
    betPool: pool(128.3, 0.48, 0.24), simulation: sim("m2", 0.48, 0.24, 0.28),
  },
  {
    id: "m3",
    teamA: t("fra", "France", "FRA", "\u{1F1EB}\u{1F1F7}", "C", 2),
    teamB: t("eng", "England", "ENG", "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", "C", 4),
    date: new Date(Date.now() + 172800000).toISOString(), time: "21:00",
    venue: "AT&T Stadium", city: "Dallas", group: "C", stage: "group", status: "upcoming",
    betPool: pool(89.7, 0.42, 0.28), simulation: sim("m3", 0.42, 0.28, 0.30),
  },
  {
    id: "m6",
    teamA: t("por", "Portugal", "POR", "\u{1F1F5}\u{1F1F9}", "F", 6),
    teamB: t("uru", "Uruguay", "URU", "\u{1F1FA}\u{1F1FE}", "F", 16),
    date: new Date(Date.now() + 259200000).toISOString(), time: "15:00",
    venue: "BC Place", city: "Vancouver", group: "F", stage: "group", status: "upcoming",
    betPool: pool(64.8, 0.50, 0.25), simulation: sim("m6", 0.50, 0.25, 0.25),
  },
  {
    id: "m7",
    teamA: t("ita", "Italy", "ITA", "\u{1F1EE}\u{1F1F9}", "G", 8),
    teamB: t("kor", "South Korea", "KOR", "\u{1F1F0}\u{1F1F7}", "G", 22),
    date: new Date(Date.now() + 345600000).toISOString(), time: "12:00",
    venue: "BMO Field", city: "Toronto", group: "G", stage: "group", status: "upcoming",
    betPool: pool(42.1, 0.55, 0.22), simulation: sim("m7", 0.55, 0.22, 0.23),
  },
  {
    id: "m8",
    teamA: t("bel", "Belgium", "BEL", "\u{1F1E7}\u{1F1EA}", "H", 10),
    teamB: t("can", "Canada", "CAN", "\u{1F1E8}\u{1F1E6}", "H", 43),
    date: new Date(Date.now() + 432000000).toISOString(), time: "19:00",
    venue: "Mercedes-Benz Stadium", city: "Atlanta", group: "H", stage: "group", status: "upcoming",
    betPool: pool(31.5, 0.58, 0.22), simulation: sim("m8", 0.58, 0.22, 0.20),
  },

  // ── FINISHED matches ──
  {
    id: "m4",
    teamA: t("esp", "Spain", "ESP", "\u{1F1EA}\u{1F1F8}", "D", 5),
    teamB: t("jpn", "Japan", "JPN", "\u{1F1EF}\u{1F1F5}", "D", 15),
    date: new Date(Date.now() - 86400000).toISOString(), time: "15:00",
    venue: "Estadio Azteca", city: "Mexico City", group: "D", stage: "group", status: "finished",
    liveScore: {
      teamAScore: 1, teamBScore: 1, minute: 90, half: "FT",
      events: [
        { id: "e5", type: "goal", minute: 22, team: "teamA", playerName: "L. Yamal" },
        { id: "e6", type: "goal", minute: 78, team: "teamB", playerName: "T. Kubo" },
      ],
    },
    betPool: pool(215.0, 0.52, 0.22), simulation: sim("m4", 0.52, 0.22, 0.26),
  },
  {
    id: "m9",
    teamA: t("col", "Colombia", "COL", "\u{1F1E8}\u{1F1F4}", "A", 9),
    teamB: t("sen", "Senegal", "SEN", "\u{1F1F8}\u{1F1F3}", "A", 17),
    date: new Date(Date.now() - 172800000).toISOString(), time: "18:00",
    venue: "Rose Bowl", city: "Pasadena", group: "A", stage: "group", status: "finished",
    liveScore: {
      teamAScore: 3, teamBScore: 0, minute: 90, half: "FT",
      events: [
        { id: "e7", type: "goal", minute: 11, team: "teamA", playerName: "L. Diaz" },
        { id: "e8", type: "goal", minute: 44, team: "teamA", playerName: "J. Arias" },
        { id: "e9", type: "red_card", minute: 52, team: "teamB", playerName: "K. Koulibaly" },
        { id: "e11", type: "goal", minute: 71, team: "teamA", playerName: "R. Falcao" },
      ],
    },
    betPool: pool(156.0, 0.46, 0.26), simulation: sim("m9", 0.46, 0.26, 0.28),
  },
  {
    id: "m10",
    teamA: t("cro", "Croatia", "CRO", "\u{1F1ED}\u{1F1F7}", "B", 13),
    teamB: t("mar", "Morocco", "MAR", "\u{1F1F2}\u{1F1E6}", "B", 18),
    date: new Date(Date.now() - 259200000).toISOString(), time: "21:00",
    venue: "Hard Rock Stadium", city: "Miami", group: "B", stage: "group", status: "finished",
    liveScore: {
      teamAScore: 0, teamBScore: 2, minute: 90, half: "FT",
      events: [
        { id: "e12", type: "goal", minute: 38, team: "teamB", playerName: "A. Hakimi" },
        { id: "e13", type: "yellow_card", minute: 56, team: "teamA", playerName: "L. Modric" },
        { id: "e14", type: "goal", minute: 82, team: "teamB", playerName: "Y. En-Nesyri" },
      ],
    },
    betPool: pool(98.5, 0.40, 0.30), simulation: sim("m10", 0.40, 0.30, 0.30),
  },
];

const mkPlayers = (teamId: string, names: string[]): Player[] =>
  names.map((name, i) => ({
    id: `${teamId}-p${i}`,
    name,
    position: (["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD", "FWD"] as const)[i] ?? "MID",
    number: i + 1,
    age: 22 + Math.floor(Math.random() * 12),
    club: "Club TBD",
    goals: Math.floor(Math.random() * 5),
    assists: Math.floor(Math.random() * 4),
    yellowCards: Math.floor(Math.random() * 2),
    redCards: 0,
    injured: i === 3,
    injuryDetail: i === 3 ? "Hamstring strain — doubtful" : undefined,
    news: [],
  }));

const mkCoach = (teamId: string, name: string): Coach => ({
  id: `coach-${teamId}`,
  name,
  nationality: "",
  formation: "4-3-3",
  news: [],
});

const MOCK_DETAILS: Record<string, MatchDetail> = {};
for (const m of MOCK_MATCHES) {
  const allPlayers: Record<string, string[]> = {
    arg: ["E. Martinez", "N. Molina", "C. Romero", "L. Martinez", "N. Tagliafico", "R. De Paul", "E. Fernandez", "A. Mac Allister", "L. Messi", "J. Alvarez", "N. Gonzalez"],
    usa: ["M. Turner", "S. Dest", "C. Richards", "T. Ream", "A. Robinson", "T. Adams", "W. McKennie", "G. Reyna", "C. Pulisic", "T. Weah", "R. Pepi"],
    bra: ["Alisson", "Danilo", "Marquinhos", "G. Magalhaes", "Wendell", "Bruno G.", "Casemiro", "Lucas Paqueta", "Raphinha", "Vinicius Jr", "Rodrygo"],
    ger: ["M. Neuer", "J. Kimmich", "A. Rudiger", "J. Tah", "D. Raum", "R. Andrich", "T. Kroos", "J. Musiala", "F. Wirtz", "L. Sane", "K. Havertz"],
    fra: ["M. Maignan", "J. Kounde", "D. Upamecano", "W. Saliba", "T. Hernandez", "A. Tchouameni", "E. Camavinga", "A. Griezmann", "K. Mbappe", "O. Dembele", "M. Thuram"],
    eng: ["J. Pickford", "K. Walker", "J. Stones", "M. Guehi", "L. Shaw", "D. Rice", "J. Bellingham", "P. Foden", "B. Saka", "H. Kane", "C. Palmer"],
    esp: ["Unai Simon", "D. Carvajal", "R. Le Normand", "A. Laporte", "M. Cucurella", "Rodri", "Pedri", "D. Olmo", "L. Yamal", "A. Morata", "N. Williams"],
    jpn: ["S. Suzuki", "T. Sakai", "M. Yoshida", "K. Itakura", "Y. Nagatomo", "W. Endo", "H. Morita", "D. Kamada", "T. Kubo", "K. Mitoma", "A. Ueda"],
    ned: ["B. Verbruggen", "D. Dumfries", "V. van Dijk", "N. Ake", "I. Timber", "F. de Jong", "T. Reijnders", "D. Klaassen", "C. Gakpo", "M. Depay", "X. Simons"],
    mex: ["G. Ochoa", "J. Sanchez", "C. Montes", "J. Vasquez", "G. Arteaga", "E. Alvarez", "L. Romo", "O. Pineda", "H. Lozano", "R. Jimenez", "S. Gimenez"],
    por: ["D. Costa", "J. Cancelo", "R. Dias", "A. Silva", "N. Mendes", "V. Vitinha", "B. Fernandes", "B. Silva", "C. Ronaldo", "R. Leao", "D. Jota"],
    uru: ["S. Rochet", "N. Nandez", "R. Araujo", "J. Gimenez", "M. Olivera", "F. Valverde", "R. Bentancur", "M. Vecino", "F. Pellistri", "D. Nunez", "L. Suarez"],
    ita: ["G. Donnarumma", "G. Di Lorenzo", "A. Bastoni", "R. Calafiori", "F. Dimarco", "N. Barella", "J. Jorginho", "L. Pellegrini", "F. Chiesa", "G. Scamacca", "M. Retegui"],
    kor: ["Kim S.", "Kim M.", "Kim Y.", "Kim J.", "Lee K.", "Hwang I.", "Lee J.", "Hwang H.", "Son H.", "Lee C.", "Cho G."],
    bel: ["T. Courtois", "T. Meunier", "J. Vertonghen", "W. Faes", "A. Theate", "K. De Bruyne", "A. Onana", "Y. Tielemans", "J. Doku", "R. Lukaku", "L. Trossard"],
    can: ["M. Crepeau", "A. Johnston", "K. Miller", "S. Vitoria", "A. Davies", "S. Eustaquio", "I. Kone", "J. Osorio", "T. Buchanan", "C. Larin", "J. David"],
    col: ["D. Ospina", "S. Arias", "D. Sanchez", "Y. Mina", "J. Mojica", "J. Arias", "M. Uribe", "J. Cuadrado", "J. Rodriguez", "L. Diaz", "R. Falcao"],
    sen: ["E. Mendy", "B. Sarr", "K. Koulibaly", "A. Diallo", "I. Jakobs", "N. Mendy", "I. Gueye", "P. Gueye", "I. Sarr", "S. Mane", "B. Dia"],
    cro: ["D. Livakovic", "J. Juranovic", "J. Gvardiol", "J. Sutalo", "B. Sosa", "L. Modric", "M. Brozovic", "M. Kovacic", "I. Perisic", "A. Kramaric", "B. Petkovic"],
    mar: ["Y. Bounou", "A. Hakimi", "N. Aguerd", "R. Saiss", "N. Mazraoui", "A. Ounahi", "S. Amrabat", "H. Ziyech", "Y. En-Nesyri", "S. Amallah", "A. Harit"],
  };
  const allCoaches: Record<string, string> = {
    arg: "L. Scaloni", usa: "M. Pochettino", bra: "Dorival Junior", ger: "J. Nagelsmann",
    fra: "D. Deschamps", eng: "T. Tuchel", esp: "L. de la Fuente", jpn: "H. Moriyasu",
    ned: "R. Koeman", mex: "J. Lozano", por: "R. Martinez", uru: "M. Bielsa",
    ita: "L. Spalletti", kor: "H. Kim", bel: "D. Bentley", can: "J. Herdman",
    col: "N. Lorenzo", sen: "A. Cisse", cro: "Z. Dalic", mar: "W. Regragui",
  };

  const fallback = Array.from({ length: 11 }, (_, i) => `Player ${i + 1}`);
  MOCK_DETAILS[m.id] = {
    ...m,
    teamAPlayers: mkPlayers(m.teamA.id, allPlayers[m.teamA.id] ?? fallback),
    teamBPlayers: mkPlayers(m.teamB.id, allPlayers[m.teamB.id] ?? fallback),
    teamACoach: mkCoach(m.teamA.id, allCoaches[m.teamA.id] ?? "Head Coach"),
    teamBCoach: mkCoach(m.teamB.id, allCoaches[m.teamB.id] ?? "Head Coach"),
  };
}

const MOCK_BETS: UserBet[] = [
  {
    id: "b1", matchId: "m1",
    teamA: MOCK_MATCHES[0].teamA, teamB: MOCK_MATCHES[0].teamB,
    outcome: "teamA", amount: 1.5, txSignature: "4xK9rNq7Wvz8mT2PfYgHnD3bLcJ6sXwR5uAeQ1kM8pV",
    timestamp: new Date(Date.now() - 3600000).toISOString(), status: "pending", matchStatus: "live",
  },
  {
    id: "b2", matchId: "m4",
    teamA: MOCK_MATCHES[3].teamA, teamB: MOCK_MATCHES[3].teamB,
    outcome: "draw", amount: 0.5, txSignature: "7yB2cRt5Kw9XmN1pQfLhJ4dG8sVzE6uA3rDiO0jW7nU",
    timestamp: new Date(Date.now() - 86400000).toISOString(), status: "won", payout: 1.2,
    payoutTxSignature: "9zC4dTv7Mw1YoP3rSgNiK6fH0uXbE8wA5tFjQ2lW9pV", matchStatus: "finished",
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, wallet: "7xK9rNq7Wvz8mT2PfYgHnD3bLcJ6sXwR5uAeQ1kM8pV", totalBets: 42, totalWagered: 156.5, totalWon: 234.2, profit: 77.7, winRate: 62, biggestWin: 24.5 },
  { rank: 2, wallet: "3yB2cRt5Kw9XmN1pQfLhJ4dG8sVzE6uA3rDiO0jW7nU", totalBets: 38, totalWagered: 120.0, totalWon: 168.0, profit: 48.0, winRate: 58, biggestWin: 18.0 },
  { rank: 3, wallet: "9zC4dTv7Mw1YoP3rSgNiK6fH0uXbE8wA5tFjQ2lW9pV", totalBets: 55, totalWagered: 200.0, totalWon: 240.0, profit: 40.0, winRate: 55, biggestWin: 15.0 },
  { rank: 4, wallet: "5aD6eFg8Hi0JkLmNoPqRsTuVwXyZ1234567890AbCd", totalBets: 29, totalWagered: 85.0, totalWon: 110.0, profit: 25.0, winRate: 52, biggestWin: 12.0 },
  { rank: 5, wallet: "2bE7fGh9Ij1KlMnOpQrStUvWxYz0987654321EfGh", totalBets: 61, totalWagered: 310.0, totalWon: 290.0, profit: -20.0, winRate: 44, biggestWin: 22.0 },
];

// ============================================================================
// API FUNCTIONS — returning mock data, swap for real endpoints
// ============================================================================

/** TODO: GET ${API_BASE}/api/matches */
export async function getMatches(filters?: {
  status?: MatchStatus;
  group?: string;
  stage?: Match["stage"];
}): Promise<Match[]> {
  await delay();
  let r = [...MOCK_MATCHES];
  if (filters?.status) r = r.filter((m) => m.status === filters.status);
  if (filters?.group)  r = r.filter((m) => m.group === filters.group);
  if (filters?.stage)  r = r.filter((m) => m.stage === filters.stage);
  return r;
}

/** TODO: GET ${API_BASE}/api/matches/:matchId */
export async function getMatchById(matchId: string): Promise<MatchDetail | null> {
  await delay(300);
  return MOCK_DETAILS[matchId] ?? null;
}

/** TODO: GET ${API_BASE}/api/simulations/:matchId */
export async function getSimulation(matchId: string): Promise<MiroFishSimulation | null> {
  await delay(150);
  const m = MOCK_MATCHES.find((x) => x.id === matchId);
  return m?.simulation ?? null;
}

/** TODO: GET ${API_BASE}/api/teams/:teamId/players */
export async function getTeamPlayers(teamId: string): Promise<Player[]> {
  await delay(150);
  for (const d of Object.values(MOCK_DETAILS)) {
    if (d.teamA.id === teamId) return d.teamAPlayers;
    if (d.teamB.id === teamId) return d.teamBPlayers;
  }
  return [];
}

/** TODO: GET ${API_BASE}/api/players/:playerId */
export async function getPlayerById(playerId: string): Promise<Player | null> {
  await delay(100);
  for (const d of Object.values(MOCK_DETAILS)) {
    const p = [...d.teamAPlayers, ...d.teamBPlayers].find((x) => x.id === playerId);
    if (p) return p;
  }
  return null;
}

/** TODO: GET ${API_BASE}/api/coaches/:coachId */
export async function getCoachById(coachId: string): Promise<Coach | null> {
  await delay(100);
  for (const d of Object.values(MOCK_DETAILS)) {
    if (d.teamACoach.id === coachId) return d.teamACoach;
    if (d.teamBCoach.id === coachId) return d.teamBCoach;
  }
  return null;
}

/** TODO: GET ${API_BASE}/api/bets?wallet=... */
export async function getUserBets(wallet: string): Promise<UserBet[]> {
  await delay(250);
  void wallet;
  return [...MOCK_BETS].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/** TODO: GET ${API_BASE}/api/leaderboard */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  await delay(200);
  return MOCK_LEADERBOARD;
}

/** TODO: Read from on-chain pool PDA */
export async function getPoolBalance(matchId: string): Promise<BetPool | null> {
  await delay(100);
  const m = MOCK_MATCHES.find((x) => x.id === matchId);
  return m?.betPool ?? null;
}

/** TODO: Replace with real Solana transaction (see types for Anchor pseudocode) */
export async function placeBet(
  matchId: string,
  outcome: BetOutcome,
  amount: number,
  wallet: string
): Promise<{ success: boolean; txSignature: string; betId: string }> {
  if (amount < 0.1) throw new Error("Minimum bet is 0.1 SOL");
  await delay(1200);
  void matchId; void outcome; void wallet;

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
