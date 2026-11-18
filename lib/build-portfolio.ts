/** Turns the AI's sorted result into a new portfolio, ready for the matchmaker to review. */
import { INTAKE_FORM_VERSION } from "./intake-form";
import { matchmakerName, type MatchmakerId } from "./matchmakers";
import type { SortResult } from "./sort-schema";
import type { FollowUp, LogEntry, OriginalForm, Portfolio, Preference } from "./types";

export const NOT_STANDARD_WARNING =
  "This doesn't look like TDC's standard intake form. Results may be incomplete.";

function slug(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "client"
  );
}

export function newPortfolioId(clientName: string) {
  return `${slug(clientName)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildPortfolio(input: {
  id: string;
  clientName: string;
  matchmakerId: MatchmakerId;
  result: SortResult;
  form: OriginalForm;
  mode: "demo" | "live";
}): Portfolio {
  const { id, result } = input;
  const now = Date.now();
  const at = (offsetMs: number) => new Date(now + offsetMs).toISOString();
  const mm = matchmakerName(input.matchmakerId);

  const preferences: Preference[] = result.preferences.map((p, i) => ({
    id: `${id}-p${i + 1}`,
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
    relatedPreferenceIds: f.relatedPreferenceIndexes.filter((n) => n < preferences.length).map((n) => preferences[n].id),
    status: "open",
  }));

  const nP = preferences.length;
  const nF = followUps.length;
  const log: LogEntry[] = [
    { id: `${id}-l1`, at: at(0), actor: mm, kind: "created", summary: "Portfolio created" },
    { id: `${id}-l2`, at: at(1), actor: mm, kind: "form_uploaded", summary: `Intake form uploaded: ${input.form.fileName}` },
    {
      id: `${id}-l3`,
      at: at(2),
      actor: "AI",
      kind: "ai_sorted",
      summary: `AI sorted the form: ${nP} preference${nP === 1 ? "" : "s"}, ${nF} follow-up question${nF === 1 ? "" : "s"}${input.mode === "demo" ? " (demo: pre-sorted result)" : ""}`,
    },
  ];

  const isStandard = result.formCheck.isStandardForm;

  return {
    id,
    clientName: input.clientName.trim(),
    ...(result.clientDetails.age ? { age: result.clientDetails.age } : {}),
    ...(result.clientDetails.city ? { city: result.clientDetails.city } : {}),
    ...(result.clientDetails.profession ? { profession: result.clientDetails.profession } : {}),
    matchmakerId: input.matchmakerId,
    summary: result.summary,
    preferences,
    followUps,
    log,
    form: { ...input.form, ...(isStandard ? { template: INTAKE_FORM_VERSION } : {}) },
    ...(isStandard ? {} : { formWarning: NOT_STANDARD_WARNING }),
    createdAt: at(0),
    updatedAt: at(2),
  };
}
