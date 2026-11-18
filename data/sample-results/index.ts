/**
 * Pre-sorted results for the sample files, returned in demo mode.
 * Generated from data/intakes.ts by: npm run build:demo-data
 */
import type { SampleId } from "@/lib/samples";
import nonStandardSample from "./non-standard-sample.json";
import standardSample from "./standard-sample.json";

export const SAMPLE_RESULTS: Record<SampleId, unknown> = {
  "standard-sample": standardSample,
  "non-standard-sample": nonStandardSample,
};
