/**
 * The fixed list of preference categories. Used by the AI output, the UI and the mock data.
 * Mirrors what most Indian matrimonial platforms capture, plus TDC's usual deal-breakers.
 */
export const CATEGORIES = [
  { key: "age_height", label: "Age and height", examples: "Age range, height range" },
  { key: "marital_status", label: "Marital status", examples: "Never married, open to divorced" },
  { key: "location", label: "Location", examples: "Current city, open to relocating, open to NRI" },
  { key: "religion_community", label: "Religion and community", examples: "Religion, community, how religious" },
  { key: "language", label: "Language", examples: "Mother tongue, languages spoken" },
  { key: "education", label: "Education", examples: "Minimum degree, field" },
  { key: "profession_income", label: "Profession and income", examples: "Industry, career stage, income range" },
  { key: "family", label: "Family", examples: "Family type, living with parents after marriage, family values" },
  { key: "lifestyle", label: "Lifestyle", examples: "Diet, smoking, drinking, fitness" },
  { key: "children", label: "Children", examples: "Wants children, timeline, open to a partner with children" },
  { key: "values_personality", label: "Values and personality", examples: "Personality traits, outlook" },
  { key: "other", label: "Other", examples: "Anything that doesn't fit above" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key) as [CategoryKey, ...CategoryKey[]];

export function categoryLabel(key: CategoryKey): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
