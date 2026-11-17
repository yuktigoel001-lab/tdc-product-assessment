import type { Portfolio, PortfolioStatus } from "./types";

/**
 * Status is never stored; it's worked out from the portfolio every time, so it can't go stale.
 *  - Needs follow-up: any follow-up question is still open.
 *  - Ready: every preference is confirmed or edited, and no follow-ups are open.
 *  - In review: some preferences confirmed or edited (not all), and no follow-ups are open.
 *  - New: nothing confirmed yet, and no follow-ups are open.
 */
export function portfolioStatus(p: Portfolio): PortfolioStatus {
  if (p.followUps.some((f) => f.status === "open")) return "needs_follow_up";
  const reviewed = countReviewed(p);
  if (p.preferences.length > 0 && reviewed === p.preferences.length) return "ready";
  return reviewed > 0 ? "in_review" : "new";
}

export const STATUS_LABELS: Record<PortfolioStatus, string> = {
  new: "New",
  in_review: "In review",
  needs_follow_up: "Needs follow-up",
  ready: "Ready",
};

export function countDealBreakers(p: Portfolio) {
  return p.preferences.filter((pref) => pref.type === "deal_breaker").length;
}

export function countOpenFollowUps(p: Portfolio) {
  return p.followUps.filter((f) => f.status === "open").length;
}

export function countReviewed(p: Portfolio) {
  return p.preferences.filter((pref) => pref.status !== "ai_suggested").length;
}
