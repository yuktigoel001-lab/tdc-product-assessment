/**
 * What each matchmaker action changes. Every action returns an updated portfolio
 * with a new client-log entry, so nothing can change without being recorded.
 */
import { categoryLabel, type CategoryKey } from "./categories";
import { CURRENT_MATCHMAKER, matchmakerName } from "./matchmakers";
import type { LogEntry, LogKind, Portfolio, Preference, PreferenceType } from "./types";

const TYPE_LABEL: Record<PreferenceType, string> = { deal_breaker: "Deal-breaker", soft_rule: "Soft rule" };
const SECTION_LABEL: Record<PreferenceType, string> = { deal_breaker: "deal-breakers", soft_rule: "soft rules" };

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function logEntry(kind: LogKind, summary: string, before?: string, after?: string): LogEntry {
  return {
    id: newId(),
    at: new Date().toISOString(),
    actor: matchmakerName(CURRENT_MATCHMAKER),
    kind,
    summary,
    ...(before !== undefined ? { before } : {}),
    ...(after !== undefined ? { after } : {}),
  };
}

function withPreference(p: Portfolio, id: string, change: (pref: Preference) => Preference): Portfolio {
  return { ...p, preferences: p.preferences.map((pref) => (pref.id === id ? change(pref) : pref)) };
}

function describe(pref: Pick<Preference, "label" | "detail">) {
  return pref.detail ? `${pref.label} (${pref.detail})` : pref.label;
}

/** Matchmaker agrees with the AI's suggestion. */
export function confirmPreference(p: Portfolio, prefId: string): Portfolio {
  const pref = p.preferences.find((x) => x.id === prefId);
  if (!pref || pref.status !== "ai_suggested") return p;
  const next = withPreference(p, prefId, (x) => ({ ...x, status: "confirmed" }));
  return { ...next, log: [...p.log, logEntry("confirmed", `Confirmed "${pref.label}"`)] };
}

/** Confirm every AI-suggested preference in one section. */
export function confirmAll(p: Portfolio, type: PreferenceType): Portfolio {
  const toConfirm = p.preferences.filter((x) => x.type === type && x.status === "ai_suggested");
  if (toConfirm.length === 0) return p;
  const ids = new Set(toConfirm.map((x) => x.id));
  return {
    ...p,
    preferences: p.preferences.map((x) => (ids.has(x.id) ? { ...x, status: "confirmed" } : x)),
    log: [...p.log, logEntry("confirmed_all", `Confirmed all ${SECTION_LABEL[type]} (${toConfirm.length})`)],
  };
}

export type PreferenceEdit = { label: string; detail?: string; category: CategoryKey };

/** Matchmaker rewrites a preference. Records before → after. */
export function editPreference(p: Portfolio, prefId: string, edit: PreferenceEdit): Portfolio {
  const pref = p.preferences.find((x) => x.id === prefId);
  if (!pref) return p;
  const label = edit.label.trim() || pref.label;
  const detail = edit.detail?.trim() || undefined;
  const unchanged = label === pref.label && detail === pref.detail && edit.category === pref.category;
  if (unchanged) return p;

  const entries: LogEntry[] = [];
  if (label !== pref.label || detail !== pref.detail) {
    entries.push(logEntry("edited", `Edited "${pref.label}"`, describe(pref), describe({ label, detail })));
  }
  if (edit.category !== pref.category) {
    entries.push(
      logEntry("edited", `Changed category of "${label}"`, categoryLabel(pref.category), categoryLabel(edit.category)),
    );
  }

  const next = withPreference(p, prefId, (x) => {
    const updated: Preference = { ...x, label, category: edit.category, status: "edited" };
    if (detail) updated.detail = detail;
    else delete updated.detail;
    return updated;
  });
  return { ...next, log: [...p.log, ...entries] };
}

/** Switch a preference between deal-breaker and soft rule. Counts as a matchmaker edit. */
export function movePreference(p: Portfolio, prefId: string): Portfolio {
  const pref = p.preferences.find((x) => x.id === prefId);
  if (!pref) return p;
  const to: PreferenceType = pref.type === "deal_breaker" ? "soft_rule" : "deal_breaker";
  const next = withPreference(p, prefId, (x) => ({ ...x, type: to, status: "edited" }));
  return {
    ...next,
    log: [
      ...p.log,
      logEntry("moved", `Moved "${pref.label}" to ${SECTION_LABEL[to]}`, TYPE_LABEL[pref.type], TYPE_LABEL[to]),
    ],
  };
}

/** Mark a follow-up question answered, with an optional note from the client conversation. */
export function resolveFollowUp(p: Portfolio, followUpId: string, note: string): Portfolio {
  const fu = p.followUps.find((f) => f.id === followUpId);
  if (!fu || fu.status === "resolved") return p;
  const trimmed = note.trim();
  return {
    ...p,
    followUps: p.followUps.map((f) =>
      f.id === followUpId
        ? { ...f, status: "resolved", ...(trimmed ? { resolutionNote: trimmed } : {}) }
        : f,
    ),
    log: [...p.log, logEntry("followup_resolved", `Resolved: "${fu.question}"`, undefined, trimmed || undefined)],
  };
}
