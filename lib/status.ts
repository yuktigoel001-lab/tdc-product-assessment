import type { Portfolio, PortfolioStatus } from "./types";

/**
 * Status is never stored; it's worked out from the portfolio every time, so it can't go stale.
 *  - Needs follow-up: any follow-up question is still open.
 *  - Ready: every preference is confirmed or edited, and no follow-ups are open.
 *  - New: everything else (nothing confirmed yet, or review still in progress).
 */
export function portfolioStatus(p: Portfolio): PortfolioStatus {
  if (p.followUps.some((f) => f.status === "open")) return "needs_follow_up";
  const reviewed = p.preferences.length > 0 && p.preferences.every((pref) => pref.status !== "ai_suggested");
  return reviewed ? "ready" : "new";
}

export const STATUS_LABELS: Record<PortfolioStatus, string> = {
  new: "New",
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
