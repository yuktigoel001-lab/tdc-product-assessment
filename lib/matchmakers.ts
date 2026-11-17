export const MATCHMAKERS = [
  { id: "A", name: "Matchmaker A" },
  { id: "B", name: "Matchmaker B" },
] as const;

export type MatchmakerId = (typeof MATCHMAKERS)[number]["id"];

export function matchmakerName(id: MatchmakerId): string {
  return MATCHMAKERS.find((m) => m.id === id)?.name ?? id;
}
