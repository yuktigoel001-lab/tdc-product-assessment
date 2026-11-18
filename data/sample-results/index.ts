/**
 * Pre-sorted results for the 4 sample forms, returned in demo mode (no API key).
 * Regenerate them with the real AI: npm run generate:samples (needs ANTHROPIC_API_KEY).
 */
import type { SampleId } from "@/lib/samples";
import sample1 from "./sample-1.json";
import sample2 from "./sample-2.json";
import sample3 from "./sample-3.json";
import sample4 from "./sample-4.json";

export const SAMPLE_RESULTS: Record<SampleId, unknown> = {
  "sample-1": sample1,
  "sample-2": sample2,
  "sample-3": sample3,
  "sample-4": sample4,
};
