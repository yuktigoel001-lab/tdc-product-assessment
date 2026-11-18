"use client";

import { useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SideCard } from "./side-card";
import { formatDate } from "@/lib/format";
import type { OriginalForm } from "@/lib/types";

/** Shows the attached intake form, and opens it: text in a pop-up, PDFs in a new tab. */
export function OriginalFormCard({ form }: { form: OriginalForm }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const isPdf = form.mimeType === "application/pdf";

  const available = Boolean(form.url || form.blobKey);

  /** Loads the form from the site (sample/mock forms) or from browser storage (uploads). */
  async function loadBlob(): Promise<Blob> {
    if (form.url) {
      const res = await fetch(form.url);
      if (!res.ok) throw new Error(String(res.status));
      return res.blob();
    }
    const { getFormFile } = await import("@/lib/form-files");
    const blob = form.blobKey ? await getFormFile(form.blobKey) : undefined;
    if (!blob) throw new Error("missing");
    return blob;
  }

  async function openForm() {
    if (isPdf) {
      if (form.url) {
        window.open(form.url, "_blank", "noopener,noreferrer");
        return;
      }
      // Open the tab straight away (so pop-up blockers allow it), then load the stored PDF into it.
      const tab = window.open("", "_blank");
      try {
        const blob = await loadBlob();
        const objectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        if (tab) tab.location.href = objectUrl;
        else window.location.href = objectUrl;
      } catch {
        tab?.close();
        setError(true);
        setOpen(true);
      }
      return;
    }
    setOpen(true);
    if (text !== null) return;
    try {
      setText(await (await loadBlob()).text());
    } catch {
      setError(true);
    }
  }

  return (
    <SideCard title="Original form">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cream text-gold">
          <FileText className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium break-all text-ink">{form.fileName}</p>
          <p className="text-xs text-ink-subtle">
            {isPdf ? "PDF" : "Text"} · uploaded {formatDate(form.uploadedAt)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={openForm} disabled={!available}>
          View form {isPdf && <ExternalLink />}
        </Button>
        {!available && <p className="mt-2 text-xs text-ink-subtle">The original file isn&apos;t stored in this browser.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] gap-0 p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="font-serif text-xl font-normal">Original intake form</DialogTitle>
            <DialogDescription>
              {form.fileName} · uploaded {formatDate(form.uploadedAt)}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto bg-cream-light px-6 py-5">
            {error ? (
              <p className="text-sm text-destructive">
                Sorry, the form couldn&apos;t be loaded. Uploaded forms are kept only in the browser they were added
                from.
              </p>
            ) : text === null ? (
              <p className="text-sm text-ink-subtle">Loading the form…</p>
            ) : (
              <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink">{text}</pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SideCard>
  );
}
