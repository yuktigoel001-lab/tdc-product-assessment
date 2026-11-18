/**
 * Builds a sorted result the way the AI would for a standard form:
 *  1. Marked answers become preferences, typed by the client's own importance mark (derivePreferences).
 *  2. Free text becomes extra preferences, with exact source quotes (written per client, as the AI would).
 *  3. A summary and follow-up questions are added.
 * Used to produce the demo-mode results and the mock portfolios, so both follow the same rules.
 */
import type { CategoryKey } from "./categories";
import { aboutAnswers, derivePreferences, type FilledIntake } from "./intake-form";
import type { SortResult } from "./sort-schema";
import type { PreferenceType } from "./types";

export type FreeTextPreference = {
  key: string; // e.g. "x1"
  category: CategoryKey;
  label: string;
  type: PreferenceType;
  sourceQuote: string;
  detail?: string;
};

export type DemoFollowUp = {
  question: string;
  reason: string;
  /** Keys of related preferences: question ids (e.g. "smoking") or free-text keys (e.g. "x1"). */
  related: string[];
};

export type DemoSortInput = {
  intake?: FilledIntake; // missing for a file that isn't the standard form
  isStandardForm?: boolean;
  formNote?: string;
  summary: string;
  /** Read from section 0 of a standard form; give it directly for other files. */
  clientDetails?: { age?: number; city?: string; profession?: string };
  freeText?: FreeTextPreference[];
  /** Extra context the AI adds to a marked answer, keyed by question id. */
  details?: Record<string, string>;
  followUps: DemoFollowUp[];
};

export function buildDemoSortResult(input: DemoSortInput): { result: SortResult; keys: string[] } {
  const derived = input.intake ? derivePreferences(input.intake) : [];
  const all = [
    ...derived.map((d) => ({ ...d, detail: input.details?.[d.key] })),
    ...(input.freeText ?? []),
  ];
  const keys = all.map((p) => p.key);

  const unknown = input.followUps.flatMap((f) => f.related).filter((k) => !keys.includes(k));
  if (unknown.length) throw new Error(`Follow-up points at unknown preference(s): ${unknown.join(", ")}`);

  const result: SortResult = {
    formCheck: {
      isStandardForm: input.isStandardForm ?? true,
      ...(input.formNote ? { note: input.formNote } : {}),
    },
    summary: input.summary,
    clientDetails: input.clientDetails ?? clientDetailsFrom(input.intake),
    preferences: all.map((p) => ({
      category: p.category,
      label: p.label,
      ...(p.detail ? { detail: p.detail } : {}),
      type: p.type,
      sourceQuote: p.sourceQuote,
    })),
    followUps: input.followUps.map((f) => ({
      question: f.question,
      reason: f.reason,
      relatedPreferenceIndexes: f.related.map((k) => keys.indexOf(k)),
    })),
  };
  return { result, keys };
}

function clientDetailsFrom(intake?: FilledIntake) {
  if (!intake) return {};
  const { age, city, profession } = aboutAnswers(intake);
  const shortCity = city?.replace(/, India$/, "");
  return { ...(age ? { age } : {}), ...(shortCity ? { city: shortCity } : {}), ...(profession ? { profession } : {}) };
}
