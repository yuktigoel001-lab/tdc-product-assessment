"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Read-only view of a filled text form (same look as "View form" on a portfolio).
 * `load` returns the form's text: from a URL, a picked file, or browser storage.
 */
export function FormPreviewDialog({
  load,
  fileName,
  title = "Filled intake form",
  trigger,
}: {
  load: () => Promise<string>;
  fileName: string;
  title?: string;
  trigger: (open: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function show() {
    setOpen(true);
    setError(false);
    try {
      setText(await load());
    } catch {
      setError(true);
    }
  }

  return (
    <>
      {trigger(show)}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="font-serif text-xl font-normal">{title}</DialogTitle>
            <DialogDescription>{fileName}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto overscroll-contain bg-cream-light px-6 py-5">
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

/** Loads a form's text from a URL on this site. */
export const loadFromUrl = (url: string) => async () => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return res.text();
};
