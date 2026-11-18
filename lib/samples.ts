/**
 * The sample files on the New portfolio page.
 *  - The standard sample: TDC's standard intake form (v1), filled by a sample client ("Use a sample form" tab).
 *  - The non-standard sample: a free-form email, downloadable from the "Upload a file" tab, to demo the warning.
 */
export const STANDARD_SAMPLE = {
  id: "standard-sample",
  title: "TDC standard intake form (v1), sample client",
  clientName: "Vikram Sethi",
  description:
    "34, chartered accountant in Mumbai. Clear deal-breakers, a few answers that contradict each other, and one importance mark that doesn't match his own note.",
  fileName: "tdc-standard-form-vikram-sethi.txt",
  mimeType: "text/plain",
} as const;

export const NON_STANDARD_SAMPLE = {
  id: "non-standard-sample",
  title: "Non-standard form (a free-form email)",
  clientName: "Neha Iyengar",
  description: "An email from the client instead of the standard form. Upload it to see the warning.",
  fileName: "non-standard-form-neha-iyengar.txt",
  mimeType: "text/plain",
} as const;

export const SAMPLE_FORMS = [STANDARD_SAMPLE, NON_STANDARD_SAMPLE] as const;

export type SampleId = (typeof SAMPLE_FORMS)[number]["id"];

export function sampleUrl(fileName: string) {
  return `/sample-forms/${fileName}`;
}

export function findSample(id: string) {
  return SAMPLE_FORMS.find((s) => s.id === id);
}
