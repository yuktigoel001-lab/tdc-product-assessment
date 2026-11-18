/**
 * TDC's STANDARD client intake form, version "tdc-intake-v1". The single source of truth.
 *
 * Every client answers the same questions in the same order, so every matchmaker captures the
 * same details. Sections 1–12 map one-to-one to the 12 preference categories.
 *
 * How a filled form becomes preferences (what the AI does, and what the demo data follows):
 *  - Questions with an importance mark: the CLIENT decides.
 *      Deal-breaker → deal-breaker · Nice to have → soft rule · Doesn't matter → not added.
 *  - "Is there anything that's a definite no?" → deal-breakers.
 *  - "Describe the person…", "Anything else…" and section notes → soft rules.
 *    If their wording sounds firm, the AI raises a follow-up instead of changing the type.
 *  - The AI never overrides the client's mark. If the mark and the wording disagree, it asks.
 */
import type { CategoryKey } from "./categories";
import type { PreferenceType } from "./types";

export const INTAKE_FORM_VERSION = "tdc-intake-v1";
export const INTAKE_FORM_NAME = "TDC standard intake form";

export const IMPORTANCE = ["Deal-breaker", "Nice to have", "Doesn't matter"] as const;
export type Importance = (typeof IMPORTANCE)[number];

export type AnswerType =
  | "Short text"
  | "Number"
  | "Range"
  | "Single choice"
  | "Multiple choice"
  | "Free text";

export type IntakeQuestion = {
  id: string;
  text: string;
  answerType: AnswerType;
  options?: string[];
  /** True when the client marks how important this preference is. */
  importance: boolean;
  /** Free-text questions whose answers are always deal-breakers or soft rules. */
  freeTextType?: PreferenceType;
  /** Turns an answer into a short preference label. */
  label?: (answer: string) => string;
};

export type IntakeSection = {
  number: number;
  key: CategoryKey | "about";
  title: string;
  questions: IntakeQuestion[];
  /** Ends with an optional "Anything to add?" note. */
  note: boolean;
};

const stripPrefix = (a: string, prefix: string) => (a.startsWith(prefix) ? a.slice(prefix.length).trim() : a);

export const INTAKE_SECTIONS: IntakeSection[] = [
  {
    number: 0,
    key: "about",
    title: "About you",
    note: false,
    questions: [
      { id: "name", text: "Full name", answerType: "Short text", importance: false },
      { id: "age", text: "Age", answerType: "Number", importance: false },
      { id: "city", text: "City and country", answerType: "Short text", importance: false },
      { id: "profession", text: "Profession", answerType: "Short text", importance: false },
      {
        id: "education",
        text: "Highest education",
        answerType: "Single choice",
        options: ["Graduate", "Postgraduate", "Doctorate", "Professional degree (CA, MBBS, LLB…)", "Other"],
        importance: false,
      },
      {
        id: "own_marital",
        text: "Your marital status",
        answerType: "Single choice",
        options: ["Never married", "Divorced", "Widowed", "Separated"],
        importance: false,
      },
      { id: "own_religion", text: "Your religion and community", answerType: "Short text", importance: false },
      { id: "own_tongue", text: "Your mother tongue", answerType: "Short text", importance: false },
    ],
  },
  {
    number: 1,
    key: "age_height",
    title: "Age and height",
    note: true,
    questions: [
      {
        id: "age_range",
        text: "Partner's age range",
        answerType: "Range",
        options: ["From __ to __"],
        importance: true,
        label: (a) => `Age ${a}`,
      },
      {
        id: "height_range",
        text: "Partner's height range",
        answerType: "Range",
        options: ["From __ to __ (ft/in)", "No preference"],
        importance: true,
        label: (a) => (a === "No preference" ? "No height preference" : `Height ${a}`),
      },
    ],
  },
  {
    number: 2,
    key: "marital_status",
    title: "Marital status",
    note: true,
    questions: [
      {
        id: "marital_open",
        text: "Open to a partner who is",
        answerType: "Multiple choice",
        options: ["Never married", "Divorced", "Widowed", "Separated"],
        importance: true,
        label: (a) => (a.includes(",") ? `Open to: ${a.toLowerCase()}` : `${a} only`),
      },
    ],
  },
  {
    number: 3,
    key: "location",
    title: "Location",
    note: true,
    questions: [
      {
        id: "partner_location",
        text: "Where should your partner live?",
        answerType: "Multiple choice",
        options: ["My city", "These cities: __", "Anywhere in India", "Abroad (NRI)"],
        importance: true,
        label: (a) => {
          const v = stripPrefix(a, "These cities:");
          if (v === "Anywhere in India") return "Anywhere in India";
          if (v === "Abroad (NRI)") return "Open to NRI (abroad)";
          return `Lives in ${v.replace(/^My city/, "the same city")}`;
        },
      },
      {
        id: "relocate",
        text: "Would you move for the right person?",
        answerType: "Single choice",
        options: ["No", "Yes, within India", "Yes, abroad too"],
        importance: false,
      },
    ],
  },
  {
    number: 4,
    key: "religion_community",
    title: "Religion and community",
    note: true,
    questions: [
      {
        id: "partner_religion",
        text: "Partner's religion",
        answerType: "Multiple choice",
        options: ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Parsi", "Any"],
        importance: true,
        label: (a) => (a === "Any" ? "Any religion" : a),
      },
      {
        id: "partner_community",
        text: "Partner's community",
        answerType: "Single choice",
        options: ["Same as mine", "Specific: __", "Any"],
        importance: true,
        label: (a) =>
          a === "Same as mine" ? "Same community" : a === "Any" ? "Any community" : `${stripPrefix(a, "Specific:")} community`,
      },
      {
        id: "religiousness",
        text: "How religious should your partner be?",
        answerType: "Single choice",
        options: ["Very", "Moderately", "Not very", "Not at all"],
        importance: true,
        label: (a) => `${a} religious`,
      },
    ],
  },
  {
    number: 5,
    key: "language",
    title: "Language",
    note: true,
    questions: [
      {
        id: "partner_languages",
        text: "Languages your partner should speak",
        answerType: "Multiple choice",
        options: ["English", "Hindi", "Other: __"],
        importance: true,
        label: (a) => `Speaks ${a}`,
      },
      {
        id: "partner_tongue",
        text: "Partner's mother tongue",
        answerType: "Single choice",
        options: ["Same as mine", "Specific: __", "Any"],
        importance: true,
        label: (a) =>
          a === "Same as mine"
            ? "Same mother tongue"
            : a === "Any"
              ? "Any mother tongue"
              : `${stripPrefix(a, "Specific:")} mother tongue`,
      },
    ],
  },
  {
    number: 6,
    key: "education",
    title: "Education",
    note: true,
    questions: [
      {
        id: "min_education",
        text: "Minimum education",
        answerType: "Single choice",
        options: ["Graduate", "Postgraduate", "Doctorate", "Professional degree"],
        importance: true,
        label: (a) => `${a} or above`,
      },
      {
        id: "education_fields",
        text: "Preferred fields",
        answerType: "Short text",
        importance: true,
        label: (a) => `Field: ${a}`,
      },
    ],
  },
  {
    number: 7,
    key: "profession_income",
    title: "Profession and income",
    note: true,
    questions: [
      {
        id: "partner_work",
        text: "Partner's work",
        answerType: "Single choice",
        options: ["Working full-time", "Working or planning to work", "Homemaker is fine"],
        importance: true,
        label: (a) => a,
      },
      {
        id: "min_income",
        text: "Minimum annual income",
        answerType: "Single choice",
        options: ["Any", "10 LPA+", "25 LPA+", "50 LPA+", "1 Cr+"],
        importance: true,
        label: (a) => (a === "Any" ? "Any income" : `Earns ${a}`),
      },
    ],
  },
  {
    number: 8,
    key: "family",
    title: "Family",
    note: true,
    questions: [
      {
        id: "living_arrangement",
        text: "Living arrangement after marriage",
        answerType: "Single choice",
        options: ["With my parents", "With partner's parents", "On our own, near family", "On our own"],
        importance: true,
        label: (a) => (a.startsWith("With") ? `Lives ${a.toLowerCase()}` : `Live ${a.toLowerCase()}`),
      },
      {
        id: "family_values",
        text: "Family values",
        answerType: "Single choice",
        options: ["Traditional", "Moderate", "Liberal"],
        importance: true,
        label: (a) => `${a} family values`,
      },
    ],
  },
  {
    number: 9,
    key: "lifestyle",
    title: "Lifestyle",
    note: true,
    questions: [
      {
        id: "diet",
        text: "Diet",
        answerType: "Single choice",
        options: ["Vegetarian only", "Vegetarian or eggetarian", "Non-vegetarian is fine", "Vegan"],
        importance: true,
        label: (a) =>
          ({ "Vegetarian only": "Vegetarian partner only", "Vegetarian or eggetarian": "Vegetarian or eggetarian", Vegan: "Vegan partner" })[a] ?? a,
      },
      {
        id: "smoking",
        text: "Smoking",
        answerType: "Single choice",
        options: ["Never", "Occasionally is okay", "Fine"],
        importance: true,
        label: (a) => ({ Never: "Non-smoker", "Occasionally is okay": "Occasional smoking is okay", Fine: "Smoking is fine" })[a] ?? a,
      },
      {
        id: "drinking",
        text: "Drinking",
        answerType: "Single choice",
        options: ["Never", "Occasionally", "Socially", "Fine"],
        importance: true,
        label: (a) =>
          ({ Never: "Doesn't drink", Occasionally: "Occasional drinking only", Socially: "Social drinking is fine", Fine: "Drinking is fine" })[a] ?? a,
      },
      {
        id: "fitness",
        text: "Fitness",
        answerType: "Single choice",
        options: ["Very active", "Moderately active", "Not important"],
        importance: true,
        label: (a) => (a === "Not important" ? "Fitness not important" : a),
      },
    ],
  },
  {
    number: 10,
    key: "children",
    title: "Children",
    note: true,
    questions: [
      {
        id: "wants_children",
        text: "Do you want children?",
        answerType: "Single choice",
        options: ["Yes", "No", "Not sure"],
        importance: true,
        label: (a) => ({ Yes: "Wants children", No: "Doesn't want children", "Not sure": "Not sure about children" })[a] ?? a,
      },
      {
        id: "children_when",
        text: "When?",
        answerType: "Single choice",
        options: ["Within 2 years", "2–4 years", "5+ years", "Not sure"],
        importance: true,
        label: (a) => (a === "Not sure" ? "Timeline for children not decided" : `Children ${a.replace(/^Within/, "within").replace(/^(\d)/, "in $1")}`),
      },
      {
        id: "partner_has_children",
        text: "Open to a partner who already has children?",
        answerType: "Single choice",
        options: ["Yes", "No", "Depends"],
        importance: true,
        label: (a) =>
          ({ Yes: "Open to a partner with children", No: "Partner without children", Depends: "Partner with children: depends" })[a] ?? a,
      },
    ],
  },
  {
    number: 11,
    key: "values_personality",
    title: "Values and personality",
    note: false,
    questions: [
      { id: "describe", text: "Describe the person you'd like to meet", answerType: "Free text", importance: false, freeTextType: "soft_rule" },
      { id: "definite_no", text: "Is there anything that's a definite no?", answerType: "Free text", importance: false, freeTextType: "deal_breaker" },
    ],
  },
  {
    number: 12,
    key: "other",
    title: "Other",
    note: false,
    questions: [
      { id: "other", text: "Anything else your matchmaker should know?", answerType: "Free text", importance: false, freeTextType: "soft_rule" },
    ],
  },
];

export const NOTE_TEXT = "Anything to add?";

// ---------- filled forms ----------

export type IntakeAnswer = { answer: string; importance?: Importance };

/** A client's answers to the standard form. Keys are question ids; notes are keyed by category. */
export type FilledIntake = {
  answers: Record<string, IntakeAnswer | string>;
  notes?: Partial<Record<CategoryKey, string>>;
};

function getAnswer(f: FilledIntake, id: string): IntakeAnswer | undefined {
  const v = f.answers[id];
  if (v === undefined || v === "") return undefined;
  return typeof v === "string" ? { answer: v } : v;
}

/** The exact line a choice answer is written as on the form (also used as its source quote). */
export function answerLine(q: IntakeQuestion, a: IntakeAnswer) {
  return `${asked(q)} ${a.answer}${q.importance && a.importance ? `  [Importance: ${a.importance}]` : ""}`;
}

/** "Diet:" but "Do you want children?" (no colon after a question mark). */
function asked(q: IntakeQuestion) {
  return q.text.endsWith("?") ? q.text : `${q.text}:`;
}

/** Writes a filled form out as plain text, exactly as the client's file would read. */
export function renderIntakeText(f: FilledIntake): string {
  const lines = [
    "THE DATE CREW · STANDARD CLIENT INTAKE FORM",
    `Form version: ${INTAKE_FORM_VERSION}`,
    "For each preference, mark how important it is: Deal-breaker / Nice to have / Doesn't matter.",
  ];
  for (const s of INTAKE_SECTIONS) {
    lines.push("", `SECTION ${s.number}: ${s.title.toUpperCase()}`);
    s.questions.forEach((q, i) => {
      const n = `${s.number}.${i + 1}`;
      const a = getAnswer(f, q.id);
      if (q.answerType === "Free text") {
        lines.push(`${n} ${asked(q)}`, a?.answer ?? "(left blank)");
      } else if (a) {
        lines.push(`${n} ${answerLine(q, a)}`);
      } else {
        lines.push(`${n} ${asked(q)} (left blank)`);
      }
    });
    if (s.note) {
      const note = f.notes?.[s.key as CategoryKey];
      lines.push(`${s.number}.${s.questions.length + 1} ${NOTE_TEXT} ${note ?? "-"}`);
    }
  }
  return lines.join("\n") + "\n";
}

export type DerivedPreference = {
  /** Question id for marked answers. */
  key: string;
  category: CategoryKey;
  label: string;
  type: PreferenceType;
  sourceQuote: string;
};

/**
 * The mechanical part of sorting: every marked answer becomes a preference, typed by the client's
 * own importance mark. "Doesn't matter" answers are left out. (Free text is read by the AI.)
 */
export function derivePreferences(f: FilledIntake): DerivedPreference[] {
  const out: DerivedPreference[] = [];
  for (const s of INTAKE_SECTIONS) {
    if (s.key === "about") continue;
    for (const q of s.questions) {
      if (!q.importance || !q.label) continue;
      const a = getAnswer(f, q.id);
      if (!a || a.importance === "Doesn't matter") continue;
      out.push({
        key: q.id,
        category: s.key,
        label: q.label(a.answer),
        // A missing mark is treated as a soft rule (and should get a follow-up).
        type: a.importance === "Deal-breaker" ? "deal_breaker" : "soft_rule",
        sourceQuote: answerLine(q, a),
      });
    }
  }
  return out;
}

export function aboutAnswers(f: FilledIntake) {
  const get = (id: string) => getAnswer(f, id)?.answer;
  const age = Number(get("age"));
  return {
    name: get("name"),
    age: Number.isFinite(age) && age > 0 ? age : undefined,
    city: get("city"),
    profession: get("profession"),
  };
}
