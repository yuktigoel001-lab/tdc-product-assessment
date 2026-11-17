/**
 * Checks the mock data is honest: every source quote must appear word for word in the client's form,
 * every category must be one of the 12, and follow-ups must point at real preferences.
 * Run with: npm run check:data
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MOCK_PORTFOLIOS } from "../data/mock-portfolios";
import { CATEGORY_KEYS } from "../lib/categories";
import { portfolioStatus } from "../lib/status";

let problems = 0;
for (const p of MOCK_PORTFOLIOS) {
  const form = readFileSync(join(process.cwd(), "public", p.form.url!), "utf8");
  const ids = new Set(p.preferences.map((x) => x.id));
  for (const pref of p.preferences) {
    if (!form.includes(pref.sourceQuote)) {
      problems++;
      console.log(`✗ ${p.id} ${pref.id}: quote not found in form → "${pref.sourceQuote}"`);
    }
    if (!CATEGORY_KEYS.includes(pref.category)) {
      problems++;
      console.log(`✗ ${p.id} ${pref.id}: unknown category ${pref.category}`);
    }
  }
  if (ids.size !== p.preferences.length) {
    problems++;
    console.log(`✗ ${p.id}: duplicate preference ids`);
  }
  for (const f of p.followUps) {
    for (const rid of f.relatedPreferenceIds) {
      if (!ids.has(rid)) {
        problems++;
        console.log(`✗ ${p.id} ${f.id}: points at missing preference ${rid}`);
      }
    }
  }
  console.log(`  ${p.clientName.padEnd(16)} matchmaker ${p.matchmakerId}  ${portfolioStatus(p).padEnd(16)} ${p.preferences.length} prefs, ${p.followUps.length} follow-ups`);
}
console.log(problems === 0 ? "\n✓ All mock data checks passed" : `\n✗ ${problems} problem(s)`);
process.exit(problems === 0 ? 0 : 1);
