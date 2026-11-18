/**
 * Server endpoint that "sorts" an intake form.
 *
 * This prototype runs on DEMO DATA ONLY: the sample forms return pre-sorted results stored in
 * /data/sample-results, and any other file gets a friendly "demo data only" message.
 * In production, this is where the server would send the form to Claude (keeping the API key on
 * the server) and check the answer against the same schema (lib/sort-schema.ts).
 *
 * GET  → { mode: "demo" }
 * POST → form data with `file` (PDF or .txt) and optional `sampleId`; returns a SortResponse.
 */
import { SAMPLE_RESULTS } from "@/data/sample-results";
import { checkIntakeFile } from "@/lib/intake-file";
import { findSample } from "@/lib/samples";
import { sortResultSchema, type SortResponse } from "@/lib/sort-schema";

function reply(body: SortResponse, status = 200) {
  return Response.json(body, { status });
}

export async function GET() {
  return Response.json({ mode: "demo" });
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply({ ok: false, code: "bad_file", message: "We couldn't read that upload. Please try again." }, 400);
  }

  const file = form.get("file");
  const sampleId = form.get("sampleId");
  if (!(file instanceof File)) {
    return reply({ ok: false, code: "bad_file", message: "Please choose an intake form to upload." }, 400);
  }
  const problem = checkIntakeFile(file);
  if (problem) return reply({ ok: false, code: "bad_file", message: problem }, 400);

  const sample = typeof sampleId === "string" ? findSample(sampleId) : undefined;
  if (!sample) {
    return reply(
      {
        ok: false,
        code: "demo_mode_upload",
        message:
          "This prototype runs on demo data only, so it can't sort your own file yet. Please pick one of the sample forms instead.",
      },
      400,
    );
  }

  // A short pause so the demo feels like the real thing.
  await new Promise((r) => setTimeout(r, 1500));
  const result = sortResultSchema.parse(SAMPLE_RESULTS[sample.id]);
  return reply({ ok: true, mode: "demo", result });
}
