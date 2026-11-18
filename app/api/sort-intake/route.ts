/**
 * Server endpoint that "sorts" an intake form.
 *
 * This prototype runs on DEMO DATA ONLY: the sample files return pre-sorted results stored in
 * /data/sample-results, and any other file gets a friendly "demo data only" message.
 * A sample file can be picked (sampleId) or uploaded: an uploaded file is recognised by its content,
 * so the downloadable non-standard form can be demoed through "Upload a file".
 * In production, this is where the server would send the form to Claude (keeping the API key on
 * the server) and check the answer against the same schema (lib/sort-schema.ts).
 *
 * GET  → { mode: "demo" }
 * POST → form data with `file` (PDF or .txt) and optional `sampleId`; returns a SortResponse.
 */
import { SAMPLE_INTAKES, type ClientIntake } from "@/data/intakes";
import { SAMPLE_RESULTS } from "@/data/sample-results";
import { renderIntakeText } from "@/lib/intake-form";
import { checkIntakeFile } from "@/lib/intake-file";
import { findSample, SAMPLE_FORMS } from "@/lib/samples";
import { sortResultSchema, type SortResponse } from "@/lib/sort-schema";

const normalise = (text: string) => text.replace(/\r\n/g, "\n").trim();

/** Which sample file (if any) an uploaded file is, by comparing its text. */
async function recogniseUpload(file: File) {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return undefined;
  const text = normalise(await file.text());
  return SAMPLE_FORMS.find((s) => {
    const client: ClientIntake = SAMPLE_INTAKES[s.id];
    const sampleText = client.intake ? renderIntakeText(client.intake) : client.rawText!;
    return normalise(sampleText) === text;
  });
}

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

  const sample = typeof sampleId === "string" ? findSample(sampleId) : await recogniseUpload(file);
  if (!sample) {
    return reply(
      {
        ok: false,
        code: "demo_mode_upload",
        message:
          "This prototype runs on demo data only, so it can only sort its sample files. Use the sample form, or download \"Try a non-standard form\" below and upload that.",
      },
      400,
    );
  }

  // A short pause so the demo feels like the real thing.
  await new Promise((r) => setTimeout(r, 1500));
  const result = sortResultSchema.parse(SAMPLE_RESULTS[sample.id]);
  return reply({ ok: true, mode: "demo", result });
}
