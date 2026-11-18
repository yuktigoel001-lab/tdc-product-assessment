import type { CategoryKey } from "./categories";
import type { MatchmakerId } from "./matchmakers";

export type PreferenceType = "deal_breaker" | "soft_rule";
export type PreferenceStatus = "ai_suggested" | "confirmed" | "edited";

export type Preference = {
  id: string;
  category: CategoryKey;
  label: string; // short, plain words: "Vegetarian partner only"
  detail?: string; // optional extra context
  type: PreferenceType;
  sourceQuote: string; // exact words from the form
  status: PreferenceStatus;
};

export type FollowUp = {
  id: string;
  question: string; // what the matchmaker should ask the client
  reason: string; // why: which preferences clash, or what's vague
  relatedPreferenceIds: string[];
  status: "open" | "resolved";
  resolutionNote?: string;
};

export type LogKind =
  | "created"
  | "form_uploaded"
  | "ai_sorted"
  | "confirmed"
  | "confirmed_all"
  | "edited"
  | "moved"
  | "followup_resolved";

/** One line in the client log. Newest entries are shown first. */
export type LogEntry = {
  id: string;
  at: string; // ISO date-time
  actor: string; // "Matchmaker A", "AI"
  kind: LogKind;
  summary: string;
  before?: string;
  after?: string;
};

/** The client's original intake form, kept attached to the portfolio. */
export type OriginalForm = {
  fileName: string;
  uploadedAt: string;
  mimeType: "application/pdf" | "text/plain";
  /** Files shipped with the prototype live in /public and are opened by URL. */
  url?: string;
  /** Files uploaded in the browser are kept in IndexedDB under this key. */
  blobKey?: string;
  /** "tdc-intake-v1" when the file is TDC's standard intake form. */
  template?: string;
};

export type PortfolioStatus = "new" | "in_review" | "needs_follow_up" | "ready";

export type Portfolio = {
  id: string;
  clientName: string;
  age?: number;
  city?: string;
  profession?: string;
  matchmakerId: MatchmakerId;
  summary: string;
  preferences: Preference[];
  followUps: FollowUp[];
  log: LogEntry[];
  form: OriginalForm;
  /** Set when the uploaded file didn't look like the standard intake form. */
  formWarning?: string;
  createdAt: string;
  updatedAt: string;
};
