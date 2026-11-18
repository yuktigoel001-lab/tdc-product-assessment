"use client";

import { Info } from "lucide-react";
import { useAiMode } from "@/lib/use-ai-mode";

/** Thin notice shown when the server has no API key, so sample forms return pre-sorted results. */
export function DemoBanner() {
  const mode = useAiMode();
  if (mode !== "demo") return null;
  return (
    <div className="border-b border-gold-light/70 bg-status-followup-bg/60">
      <p className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-xs text-status-followup-fg sm:px-6">
        <Info className="size-3.5 shrink-0" aria-hidden />
        Demo mode: showing pre-sorted results for sample forms.
      </p>
    </div>
  );
}
