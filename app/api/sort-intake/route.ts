/**
 * Server-only endpoint that sorts an intake form. The API key is read here and never sent to the browser.
 *
 * GET  → { mode: "live" | "demo" }  (demo when ANTHROPIC_API_KEY is not set)
 * POST → form data with `file` (PDF or .txt) and optional `sampleId`; returns a SortResponse.
 */
import { connection } from "next/server";
import { SAMPLE_RESULTS } from "@/data/sample-results";
import { checkIntakeFile } from "@/lib/intake-file";
import { findSample } from "@/lib/samples";
import { sortResultSchema, type SortResponse } from "@/lib/sort-schema";

function isLive() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function reply(body: SortResponse, status = 200) {
  return Response.json(body, { status });
}

export async function GET() {
  await connection(); // check the key on every request, not once at build time
  return Response.json({ mode: isLive() ? "live" : "demo" });
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

  // ---------- demo mode: no API key ----------
  if (!isLive()) {
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

  // ---------- live mode: Claude sorts the form (built in checkpoint 6) ----------
  return reply(
    { ok: false, code: "ai_failed", message: "Live AI sorting isn't switched on yet. It arrives in checkpoint 6." },
    501,
  );
}
