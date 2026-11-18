/**
 * Generates all demo files from data/intakes.ts, so every form follows the standard template:
 *  - public/mock-forms/<client>.txt          the 8 mock clients' filled forms
 *  - public/sample-forms/*.txt and *.pdf     the 5 sample forms (PDFs via make:pdfs)
 *  - data/sample-results/sample-N.json       demo-mode results (the "AI output")
 * Run with: npm run build:demo-data
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { MOCK_INTAKES, SAMPLE_INTAKES, type ClientIntake } from "../data/intakes";
import { buildDemoSortResult } from "../lib/demo-sorting";
import { renderIntakeText } from "../lib/intake-form";
import { SAMPLE_FORMS } from "../lib/samples";
import { sortResultSchema } from "../lib/sort-schema";

const root = process.cwd();
const formText = (c: ClientIntake) => (c.intake ? renderIntakeText(c.intake) : c.rawText!);

for (const [id, client] of Object.entries(MOCK_INTAKES)) {
  writeFileSync(join(root, "public", "mock-forms", `${id}.txt`), formText(client));
  buildDemoSortResult({ ...client.sort, intake: client.intake }); // throws if a follow-up points nowhere
  console.log(`✓ public/mock-forms/${id}.txt`);
}

for (const sample of SAMPLE_FORMS) {
  const client: ClientIntake = SAMPLE_INTAKES[sample.id];
  const text = formText(client);
  const isPdf = sample.fileName.endsWith(".pdf");
  const target = isPdf
    ? join(root, "scripts", "pdf-sources", sample.fileName.replace(/\.pdf$/, ".txt"))
    : join(root, "public", "sample-forms", sample.fileName);
  writeFileSync(target, text);

  const { result } = buildDemoSortResult({ ...client.sort, intake: client.intake });
  sortResultSchema.parse(result);
  writeFileSync(join(root, "data", "sample-results", `${sample.id}.json`), JSON.stringify(result, null, 2) + "\n");
  console.log(`✓ ${sample.id}: form + result (${result.preferences.length} preferences, ${result.followUps.length} follow-ups)`);
}

execSync("npm run make:pdfs --silent", { stdio: "inherit" });
