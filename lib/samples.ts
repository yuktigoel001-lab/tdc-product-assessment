/** The 4 sample intake forms anyone can try, each testing something different. */
export const SAMPLE_FORMS = [
  {
    id: "sample-1",
    title: "Sample 1 · Clean answers",
    tests: "Clear answers with obvious deal-breakers (vegetarian, non-smoker).",
    clientName: "Aditi Rao",
    fileName: "sample-1-clean-answers.txt",
    mimeType: "text/plain",
  },
  {
    id: "sample-2",
    title: "Sample 2 · Contradictions",
    tests: "Must live in Mumbai vs open to moving abroad; age 25 to 28 vs 10+ years' experience.",
    clientName: "Vikram Sethi",
    fileName: "sample-2-contradictions.txt",
    mimeType: "text/plain",
  },
  {
    id: "sample-3",
    title: "Sample 3 · Vague answers (PDF)",
    tests: "\"Good family background\", \"not too religious\", \"settled\".",
    clientName: "Riya Bansal",
    fileName: "sample-3-vague-answers.pdf",
    mimeType: "application/pdf",
  },
  {
    id: "sample-4",
    title: "Sample 4 · Children and lifestyle (PDF)",
    tests: "Children within 2 years, no smoking at all, location left blank.",
    clientName: "Karan Verma",
    fileName: "sample-4-children-and-lifestyle.pdf",
    mimeType: "application/pdf",
  },
] as const satisfies readonly {
  id: string;
  title: string;
  tests: string;
  clientName: string;
  fileName: string;
  mimeType: "text/plain" | "application/pdf";
}[];

export type SampleId = (typeof SAMPLE_FORMS)[number]["id"];

export function sampleUrl(fileName: string) {
  return `/sample-forms/${fileName}`;
}

export function findSample(id: string) {
  return SAMPLE_FORMS.find((s) => s.id === id);
}
