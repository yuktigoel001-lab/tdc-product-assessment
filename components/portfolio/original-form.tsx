"use client";

import { useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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

  async function openText() {
    setOpen(true);
    if (text !== null || !form.url) return;
    try {
      const res = await fetch(form.url);
      if (!res.ok) throw new Error(String(res.status));
      setText(await res.text());
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
        {isPdf && form.url ? (
          <a
            href={form.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View form <ExternalLink />
          </a>
        ) : (
          <Button variant="outline" size="sm" onClick={openText} disabled={!form.url}>
            View form
          </Button>
        )}
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
              <p className="text-sm text-destructive">Sorry, the form couldn&apos;t be loaded.</p>
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
