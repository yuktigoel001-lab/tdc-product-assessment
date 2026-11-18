export const MATCHMAKERS = [
  { id: "A", name: "Matchmaker A" },
  { id: "B", name: "Matchmaker B" },
] as const;

export type MatchmakerId = (typeof MATCHMAKERS)[number]["id"];

export function matchmakerName(id: MatchmakerId): string {
  return MATCHMAKERS.find((m) => m.id === id)?.name ?? id;
}

/**
 * The matchmaker using this dashboard. Stands in for a real login: in production this would come
 * from the signed-in account. Matchmaker B's clients stay in the mock data but are never shown.
 */
export const CURRENT_MATCHMAKER: MatchmakerId = "A";
