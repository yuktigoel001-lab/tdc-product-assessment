/**
 * Eight made-up clients with full portfolios. No real people.
 *
 * Each portfolio is built from the client's filled standard form in data/intakes.ts, exactly the way
 * a new upload is sorted (marked answers typed by the client's importance mark, plus free text),
 * then a review history is applied: what the matchmaker has confirmed, edited or resolved so far.
 */
import { buildDemoSortResult } from "@/lib/demo-sorting";
import { INTAKE_FORM_VERSION } from "@/lib/intake-form";
import { matchmakerName, type MatchmakerId } from "@/lib/matchmakers";
import type { FollowUp, LogEntry, LogKind, Portfolio, Preference, PreferenceType } from "@/lib/types";
import { MOCK_INTAKES, type MockClientId } from "./intakes";

type Review = {
  /** Preference keys (question ids like "smoking", or free-text keys like "x1"), or "all". */
  confirmed?: string[] | "all";
  edited?: Record<string, { label?: string; detail?: string; type?: PreferenceType }>;
  /** Follow-up position → the matchmaker's resolution note. */
  resolved?: Record<number, string>;
  /** When the review happened (the log entries are spread out from here). */
  at?: string;
};

const TYPE_LABEL: Record<PreferenceType, string> = { deal_breaker: "Deal-breaker", soft_rule: "Soft rule" };

function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function build(id: MockClientId, matchmakerId: MatchmakerId, createdAt: string, review: Review = {}): Portfolio {
  const client = MOCK_INTAKES[id];
  const { result, keys } = buildDemoSortResult({ ...client.sort, intake: client.intake });
  const mm = matchmakerName(matchmakerId);
  const fileName = `${id}-intake-form.txt`;

  // 1. The portfolio exactly as the AI sorted it.
  const prefId = (key: string) => `${id}-${key}`;
  let preferences: Preference[] = result.preferences.map((p, i) => ({
    id: prefId(keys[i]),
    category: p.category,
    label: p.label,
    ...(p.detail ? { detail: p.detail } : {}),
    type: p.type,
    sourceQuote: p.sourceQuote,
    status: "ai_suggested",
  }));
  const followUps: FollowUp[] = result.followUps.map((f, i) => ({
    id: `${id}-f${i + 1}`,
    question: f.question,
    reason: f.reason,
    relatedPreferenceIds: f.relatedPreferenceIndexes.map((n) => preferences[n].id),
    status: "open",
  }));
  const nP = preferences.length;
  const nF = followUps.length;
  const log: LogEntry[] = [
    { id: `${id}-l1`, at: createdAt, actor: mm, kind: "created", summary: "Portfolio created" },
    { id: `${id}-l2`, at: addMinutes(createdAt, 1), actor: mm, kind: "form_uploaded", summary: `Intake form uploaded: ${fileName}` },
    {
      id: `${id}-l3`,
      at: addMinutes(createdAt, 2),
      actor: "AI",
      kind: "ai_sorted",
      summary: `AI sorted the form: ${nP} preference${nP === 1 ? "" : "s"}, ${nF} follow-up question${nF === 1 ? "" : "s"}`,
    },
  ];

  // 2. The matchmaker's review so far, each step recorded in the log.
  let minute = 0;
  const at = review.at ?? addMinutes(createdAt, 24 * 60);
  const record = (kind: LogKind, summary: string, before?: string, after?: string) =>
    log.push({
      id: `${id}-l${log.length + 1}`,
      at: addMinutes(at, minute++),
      actor: mm,
      kind,
      summary,
      ...(before ? { before } : {}),
      ...(after ? { after } : {}),
    });
  const byKey = (key: string) => {
    const p = preferences.find((x) => x.id === prefId(key));
    if (!p) throw new Error(`${id}: no preference "${key}"`);
    return p;
  };

  for (const [index, note] of Object.entries(review.resolved ?? {})) {
    const f = followUps[Number(index)];
    f.status = "resolved";
    f.resolutionNote = note;
    record("followup_resolved", `Resolved: "${f.question}"`, undefined, note);
  }

  for (const [key, change] of Object.entries(review.edited ?? {})) {
    const p = byKey(key);
    if (change.type && change.type !== p.type) {
      record("moved", `Moved "${p.label}" to ${change.type === "deal_breaker" ? "deal-breakers" : "soft rules"}`, TYPE_LABEL[p.type], TYPE_LABEL[change.type]);
    }
    if (change.label || change.detail) {
      const before = p.detail ? `${p.label} (${p.detail})` : p.label;
      const label = change.label ?? p.label;
      const detail = change.detail ?? p.detail;
      record("edited", `Edited "${p.label}"`, before, detail ? `${label} (${detail})` : label);
    }
    preferences = preferences.map((x) =>
      x.id === p.id
        ? { ...x, ...(change.label ? { label: change.label } : {}), ...(change.detail ? { detail: change.detail } : {}), ...(change.type ? { type: change.type } : {}), status: "edited" }
        : x,
    );
  }

  if (review.confirmed === "all") {
    const toConfirm = preferences.filter((p) => p.status === "ai_suggested");
    preferences = preferences.map((p) => (p.status === "ai_suggested" ? { ...p, status: "confirmed" } : p));
    record("confirmed_all", `Confirmed all remaining preferences (${toConfirm.length})`);
  } else {
    for (const key of review.confirmed ?? []) {
      const p = byKey(key);
      preferences = preferences.map((x) => (x.id === p.id ? { ...x, status: "confirmed" } : x));
      record("confirmed", `Confirmed "${p.label}"`);
    }
  }

  const updatedAt = log.reduce((latest, e) => (e.at > latest ? e.at : latest), createdAt);
  const d = result.clientDetails;
  return {
    id,
    clientName: client.clientName,
    ...(d.age ? { age: d.age } : {}),
    ...(d.city ? { city: d.city } : {}),
    ...(d.profession ? { profession: d.profession } : {}),
    matchmakerId,
    summary: result.summary,
    preferences,
    followUps,
    log,
    form: {
      fileName,
      uploadedAt: addMinutes(createdAt, 1),
      mimeType: "text/plain",
      url: `/mock-forms/${id}.txt`,
      template: INTAKE_FORM_VERSION,
    },
    createdAt,
    updatedAt,
  };
}

export const MOCK_PORTFOLIOS: Portfolio[] = [
  // ---------- Matchmaker A ----------
  // READY: follow-up resolved, everything confirmed.
  build("ananya-iyer", "A", "2026-10-21T10:15:00.000Z", {
    at: "2026-10-23T09:10:00.000Z",
    resolved: { 0: "Confirmed on call: Bangalore is a must. Chennai is only for weekend visits." },
    edited: { x1: { detail: "Loves books and travel." } },
    confirmed: "all",
  }),
  // NEEDS FOLLOW-UP: community contradiction and a vague "good family".
  build("rohan-mehta", "A", "2026-11-10T07:40:00.000Z", {
    at: "2026-11-12T11:05:00.000Z",
    confirmed: ["partner_location", "smoking", "x4"],
  }),
  // NEW: just sorted, nothing reviewed, nothing to follow up.
  build("kavya-reddy", "A", "2026-11-17T12:20:00.000Z"),
  // IN REVIEW: both follow-ups resolved and acted on, review half done.
  build("arjun-malhotra", "A", "2026-11-05T15:00:00.000Z", {
    at: "2026-11-13T17:20:00.000Z",
    resolved: {
      0: "Yes, he'd like children, ideally in 2 to 4 years.",
      1: "No visa needed upfront. Arjun will sponsor a spouse visa.",
    },
    edited: {
      wants_children: { label: "Wants children" },
      children_when: { label: "Children in 2 to 4 years" },
      partner_work: { detail: "No UK visa needed upfront; he'll sponsor a spouse visa." },
    },
    confirmed: ["partner_location", "partner_languages", "smoking", "age_range", "height_range"],
  }),

  // ---------- Matchmaker B (not shown on Matchmaker A's dashboard) ----------
  build("ishaan-kapoor", "B", "2026-11-16T06:30:00.000Z"),
  build("meera-joshi", "B", "2026-10-28T09:00:00.000Z", {
    at: "2026-11-01T12:30:00.000Z",
    resolved: {
      0: "Yes, fully open to interfaith. Respect for her faith is what matters.",
      1: "Open to one child or adoption. Not a must.",
    },
    edited: {
      partner_religion: { detail: "Open to interfaith; respect for her faith is key." },
      wants_children: { label: "Open to one child or adoption" },
    },
    confirmed: "all",
  }),
  build("priya-sharma", "B", "2026-11-11T08:10:00.000Z", {
    at: "2026-11-15T10:05:00.000Z",
    resolved: { 2: "Within 3 to 5 years of marriage." },
    edited: { children_when: { label: "Children within 3 to 5 years" } },
    confirmed: ["x2", "age_range", "partner_languages"],
  }),
  build("siddharth-nair", "B", "2026-11-18T04:45:00.000Z"),
];
