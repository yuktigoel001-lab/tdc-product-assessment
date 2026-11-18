"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ClipboardList, Download, Eye, FileText, Loader2, Sparkles, Upload, X } from "lucide-react";
import { FormPreviewDialog } from "@/components/intake/form-preview-dialog";
import { StandardFormDialog } from "@/components/intake/standard-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildPortfolio, newPortfolioId } from "@/lib/build-portfolio";
import { saveFormFile } from "@/lib/form-files";
import { checkIntakeFile, formatBytes, intakeKind } from "@/lib/intake-file";
import { CURRENT_MATCHMAKER, matchmakerName } from "@/lib/matchmakers";
import { NON_STANDARD_SAMPLE, sampleUrl, STANDARD_SAMPLE } from "@/lib/samples";
import type { SortResponse } from "@/lib/sort-schema";
import { addPortfolio } from "@/lib/store";
import type { OriginalForm } from "@/lib/types";
import { cn } from "@/lib/utils";

type Source = "sample" | "upload";
type Stage = "idle" | "reading" | "sorting" | "saving";

const STAGES: { key: Exclude<Stage, "idle">; label: string }[] = [
  { key: "reading", label: "Reading the form…" },
  { key: "sorting", label: "Sorting preferences…" },
  { key: "saving", label: "Building the portfolio…" },
];

export default function NewPortfolioPage() {
  const router = useRouter();
  // The sample tab is selected first, so the sample client's name is filled in (and stays editable).
  const [clientName, setClientName] = useState<string>(STANDARD_SAMPLE.clientName);
  const [source, setSource] = useState<Source>("sample");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const fileInput = useRef<HTMLInputElement>(null);
  const stageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (stageTimer.current) clearTimeout(stageTimer.current);
  }, []);

  const sample = source === "sample" ? STANDARD_SAMPLE : undefined;
  const busy = stage !== "idle";
  const canSubmit = !busy && clientName.trim().length > 0 && (source === "sample" || Boolean(file));

  function switchSource(next: Source) {
    setSource(next);
    setError(null);
    // Pre-fill the sample client's name on the sample tab; clear it again when leaving, unless it was edited.
    if (next === "sample" && !clientName.trim()) setClientName(STANDARD_SAMPLE.clientName);
    if (next === "upload" && clientName === STANDARD_SAMPLE.clientName) setClientName("");
  }

  function pickFile(f: File | undefined) {
    if (!f) return;
    const problem = checkIntakeFile(f);
    setError(problem);
    setFile(problem ? null : f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setStage("reading");

    try {
      // 1. Get the form file (samples are fetched from the site, just like an upload).
      let formFile: File;
      if (source === "sample" && sample) {
        const res = await fetch(sampleUrl(sample.fileName));
        if (!res.ok) throw new Error("Couldn't load the sample form.");
        formFile = new File([await res.blob()], sample.fileName, { type: sample.mimeType });
      } else {
        formFile = file!;
      }

      // 2. Send it to the server for sorting.
      stageTimer.current = setTimeout(() => setStage("sorting"), 700);
      const body = new FormData();
      body.append("file", formFile);
      if (source === "sample" && sample) body.append("sampleId", sample.id);
      const res = await fetch("/api/sort-intake", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as SortResponse | null;
      if (stageTimer.current) clearTimeout(stageTimer.current);
      if (!data) throw new Error("Something went wrong while sorting. Please try again.");
      if (!data.ok) throw new Error(data.message);

      // 3. Build and save the portfolio, keeping the original form attached.
      setStage("saving");
      const id = newPortfolioId(clientName);
      const uploadedAt = new Date().toISOString();
      const mimeType = intakeKind(formFile) === "pdf" ? "application/pdf" : "text/plain";
      let form: OriginalForm;
      if (source === "sample" && sample) {
        form = { fileName: sample.fileName, uploadedAt, mimeType, url: sampleUrl(sample.fileName) };
      } else {
        const blobKey = `form:${id}`;
        await saveFormFile(blobKey, formFile);
        form = { fileName: formFile.name, uploadedAt, mimeType, blobKey };
      }

      addPortfolio(
        buildPortfolio({ id, clientName, matchmakerId: CURRENT_MATCHMAKER, result: data.result, form, mode: data.mode }),
      );
      router.push(`/portfolios/${id}`);
    } catch (err) {
      if (stageTimer.current) clearTimeout(stageTimer.current);
      setStage("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-forest">
        <ArrowLeft className="size-4" aria-hidden /> All portfolios
      </Link>

      <div>
        <h1 className="text-4xl text-ink">
          New <em className="text-forest">portfolio</em>
        </h1>
        <p className="mt-2 text-ink-muted">
          Add the client&apos;s filled intake form. AI sorts it into deal-breakers, soft rules and follow-up questions in
          seconds. You review everything before it&apos;s used.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative rounded-xl border border-border bg-white">
        <fieldset disabled={busy} className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-ink">Client name</span>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Aditi Rao"
                required
                className="h-10 bg-white"
              />
            </label>
            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-ink">Assigned matchmaker</span>
              <span className="flex h-10 items-center gap-2 rounded-lg border border-border bg-cream-light px-3 text-sm text-ink-muted">
                <span className="flex size-5 items-center justify-center rounded-full bg-forest text-[0.65rem] font-semibold text-cream-light">
                  {CURRENT_MATCHMAKER}
                </span>
                {matchmakerName(CURRENT_MATCHMAKER)} (you)
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="block text-sm font-medium text-ink">Filled intake form</span>
            <div role="tablist" aria-label="Form source" className="flex w-fit rounded-full border border-border p-0.5">
              {(
                [
                  ["sample", "Use a sample form"],
                  ["upload", "Upload a file"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={source === key}
                  onClick={() => switchSource(key)}
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium",
                    source === key ? "bg-forest text-cream-light" : "text-ink-muted hover:text-forest",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {source === "sample" ? (
              <div className="rounded-lg border border-gold-light bg-cream-light p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-gold">
                    <FileText className="size-4.5" aria-hidden />
                  </span>
                  <div className="min-w-0 space-y-2">
                    <p className="font-serif text-lg leading-snug text-ink">{STANDARD_SAMPLE.title}</p>
                    <p className="flex gap-2 text-sm text-forest">
                      <ClipboardList className="mt-0.5 size-4 shrink-0" aria-hidden />
                      Assumes the client filled TDC&apos;s standard intake form (v1), so every client is asked the
                      same questions.
                    </p>
                    <p className="text-sm text-ink-muted">
                      <span className="font-medium text-ink">{STANDARD_SAMPLE.clientName}: </span>
                      {STANDARD_SAMPLE.description}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm">
                      <FormPreviewDialog
                        url={sampleUrl(STANDARD_SAMPLE.fileName)}
                        fileName={STANDARD_SAMPLE.fileName}
                        title={STANDARD_SAMPLE.title}
                        trigger={(open) => (
                          <button
                            type="button"
                            onClick={open}
                            className="inline-flex cursor-pointer items-center gap-1 font-medium text-forest underline underline-offset-4 hover:text-sage"
                          >
                            <Eye className="size-3.5" aria-hidden /> Preview form
                          </button>
                        )}
                      />
                      <StandardFormDialog
                        trigger={(open) => (
                          <button
                            type="button"
                            onClick={open}
                            className="cursor-pointer text-ink-muted underline underline-offset-4 hover:text-forest"
                          >
                            View the blank template
                          </button>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {file ? (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-cream-light px-3.5 py-3">
                    <FileText className="size-5 shrink-0 text-gold" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                      <p className="text-xs text-ink-subtle">{formatBytes(file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Remove file"
                      onClick={() => {
                        setFile(null);
                        if (fileInput.current) fileInput.current.value = "";
                      }}
                    >
                      <X />
                    </Button>
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      pickFile(e.dataTransfer.files[0]);
                    }}
                    className={cn(
                      "flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors",
                      dragging ? "border-sage bg-status-ready-bg/50" : "border-input hover:border-gold-light hover:bg-cream-light",
                    )}
                  >
                    <Upload className="size-5 text-gold" aria-hidden />
                    <span className="text-sm text-ink">
                      Drop the form here, or <span className="font-medium text-forest underline">browse</span>
                    </span>
                    <span className="text-xs text-ink-subtle">PDF or .txt, up to 4 MB</span>
                    <input
                      ref={fileInput}
                      type="file"
                      accept=".pdf,.txt,application/pdf,text/plain"
                      className="sr-only"
                      onChange={(e) => pickFile(e.target.files?.[0])}
                    />
                  </label>
                )}
                <p className="text-xs text-ink-subtle">
                  <a
                    href={sampleUrl(NON_STANDARD_SAMPLE.fileName)}
                    download={NON_STANDARD_SAMPLE.fileName}
                    className="inline-flex items-center gap-1 font-medium text-forest underline underline-offset-4 hover:text-sage"
                  >
                    <Download className="size-3.5" aria-hidden /> Try a non-standard form
                  </a>{" "}
                  · downloads {NON_STANDARD_SAMPLE.clientName}&apos;s email; upload it here to see the warning.
                </p>
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <Button type="submit" size="lg" disabled={!canSubmit}>
              <Sparkles /> Create portfolio and sort with AI
            </Button>
            <span className="text-xs text-ink-subtle">Nothing is shared with the client.</span>
          </div>
        </fieldset>

        {busy && <LoadingOverlay stage={stage} />}
      </form>
    </div>
  );
}

function LoadingOverlay({ stage }: { stage: Stage }) {
  const current = STAGES.findIndex((s) => s.key === stage);
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-[2px]"
    >
      <ol className="space-y-3">
        {STAGES.map((s, i) => (
          <li
            key={s.key}
            className={cn(
              "flex items-center gap-3 text-sm",
              i < current && "text-sage",
              i === current && "font-medium text-ink",
              i > current && "text-ink-subtle",
            )}
          >
            <span className="flex size-6 items-center justify-center">
              {i < current ? (
                <Check className="size-4" aria-hidden />
              ) : i === current ? (
                <Loader2 className="size-4 animate-spin text-gold" aria-hidden />
              ) : (
                <span className="size-1.5 rounded-full bg-ink-subtle/50" />
              )}
            </span>
            {s.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
