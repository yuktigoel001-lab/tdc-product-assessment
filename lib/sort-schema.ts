/**
 * The exact shape the AI must return when it sorts an intake form.
 * Used to check the AI's answer (and the pre-sorted demo results) before anything is saved.
 */
import { z } from "zod";
import { CATEGORY_KEYS } from "./categories";

export const aiPreferenceSchema = z.object({
  category: z.enum(CATEGORY_KEYS),
  label: z.string().min(1),
  detail: z.string().optional(),
  type: z.enum(["deal_breaker", "soft_rule"]),
  sourceQuote: z.string().min(1),
});

export const aiFollowUpSchema = z.object({
  question: z.string().min(1),
  reason: z.string().min(1),
  /** Positions (starting at 0) of the related preferences in `preferences`. Empty if a category is missing. */
  relatedPreferenceIndexes: z.array(z.number().int().min(0)),
});

export const sortResultSchema = z.object({
  /** Did the file look like TDC's standard intake form (tdc-intake-v1)? */
  formCheck: z.object({
    isStandardForm: z.boolean(),
    note: z.string().optional(),
  }),
  summary: z.string().min(1),
  clientDetails: z.object({
    age: z.number().int().positive().nullish(),
    city: z.string().nullish(),
    profession: z.string().nullish(),
  }),
  preferences: z.array(aiPreferenceSchema).min(1),
  followUps: z.array(aiFollowUpSchema),
});

export type SortResult = z.infer<typeof sortResultSchema>;

/** What the server sends back to the browser. */
export type SortResponse =
  | { ok: true; mode: "demo" | "live"; result: SortResult }
  | { ok: false; code: "demo_mode_upload" | "bad_file" | "ai_failed"; message: string };
