/**
 * Server endpoint that "sorts" an intake form.
 *
 * This prototype runs on DEMO DATA ONLY. Every file arrives as an upload; the server recognises the
 * two sample files (the sample filled form and the non-standard form) by a fingerprint of their
 * content (SHA-256), so they work whether a reviewer clicks "Use a sample filled form" or downloads
 * a file and uploads it again. Recognised files return their pre-sorted result from /data/sample-results.
 * Any other file gets a "live AI sorting needs an API key" message.
 *
 * In production, this is where the server would send the form to Claude (keeping the API key on
 * the server) and check the answer against the same schema (lib/sort-schema.ts).
 *
 * GET  → { mode: "demo" }
 * POST → form data with `file` (PDF or .txt); returns a SortResponse.
 */
import { createHash } from "node:crypto";
import { SAMPLE_INTAKES, type ClientIntake } from "@/data/intakes";
import { SAMPLE_RESULTS } from "@/data/sample-results";
import { checkIntakeFile, intakeKind } from "@/lib/intake-file";
import { renderIntakeText } from "@/lib/intake-form";
import { SAMPLE_FORMS } from "@/lib/samples";
import { sortResultSchema, type SortResponse } from "@/lib/sort-schema";

/** Line endings and trailing spaces can change when a file is downloaded and saved, so ignore them. */
const normalise = (text: string) => text.replace(/\r\n?/g, "\n").trim();
const fingerprint = (text: string) => createHash("sha256").update(normalise(text)).digest("hex");

/** Fingerprint of each sample file → the sample. */
const KNOWN_FILES = new Map(
  SAMPLE_FORMS.map((sample) => {
    const client: ClientIntake = SAMPLE_INTAKES[sample.id];
    return [fingerprint(client.intake ? renderIntakeText(client.intake) : client.rawText!), sample] as const;
  }),
);

async function recognise(file: File) {
  if (intakeKind(file) !== "text") return undefined; // the sample files are plain text
  return KNOWN_FILES.get(fingerprint(await file.text()));
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
  if (!(file instanceof File)) {
    return reply({ ok: false, code: "bad_file", message: "Please choose an intake form to upload." }, 400);
  }
  const problem = checkIntakeFile(file);
  if (problem) return reply({ ok: false, code: "bad_file", message: problem }, 400);

  const sample = await recognise(file);
  if (!sample) {
    return reply(
      {
        ok: false,
        code: "demo_mode_upload",
        message:
          "Live AI sorting needs an API key, and this prototype runs on demo data only. To try it, use the sample filled form (Vikram Sethi), or download the non-standard form and upload that.",
      },
      400,
    );
  }

  // A short pause so the demo feels like the real thing.
  await new Promise((r) => setTimeout(r, 1500));
  const result = sortResultSchema.parse(SAMPLE_RESULTS[sample.id]);
  return reply({ ok: true, mode: "demo", result });
}
