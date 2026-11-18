"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Read-only view of a filled text form (same look as "View form" on a portfolio). */
export function FormPreviewDialog({
  url,
  fileName,
  title = "Filled intake form",
  trigger,
}: {
  url: string;
  fileName: string;
  title?: string;
  trigger: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function show() {
    setOpen(true);
    if (text !== null) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      setText(await res.text());
    } catch {
      setError(true);
    }
  }

  return (
    <>
      {trigger(show)}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] gap-0 p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="font-serif text-xl font-normal">{title}</DialogTitle>
            <DialogDescription>{fileName}</DialogDescription>
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
    </>
  );
}
