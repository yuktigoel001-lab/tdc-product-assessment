"use client";

import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { INTAKE_FORM_NAME, INTAKE_FORM_VERSION, INTAKE_SECTIONS, NOTE_TEXT } from "@/lib/intake-form";

const IMPORTANCE_RULES = [
  { mark: "Deal-breaker", becomes: "Deal-breaker", className: "border border-gold text-gold" },
  { mark: "Nice to have", becomes: "Soft rule", className: "bg-muted text-ink-muted" },
  { mark: "Doesn't matter", becomes: "Not added", className: "bg-status-new-bg text-ink-subtle" },
];

/** Read-only view of TDC's standard intake form: sections, questions, options and the importance scale. */
export function StandardFormDialog({ trigger }: { trigger: (open: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {trigger(() => setOpen(true))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="font-serif text-2xl font-normal">
              {INTAKE_FORM_NAME} <span className="font-sans text-sm text-ink-subtle">({INTAKE_FORM_VERSION})</span>
            </DialogTitle>
            <DialogDescription>
              Every client answers the same questions, in the same order, so every matchmaker captures the same details.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 space-y-6 overflow-y-auto overscroll-contain px-6 py-5">
            <section className="rounded-lg bg-cream-light p-4">
              <h3 className="font-sans text-sm font-semibold text-ink">Importance scale</h3>
              <p className="mt-1 text-sm text-ink-muted">
                The client marks every preference question. Their mark decides where it goes in the portfolio. The AI
                never changes it; if the wording disagrees with the mark, it asks a follow-up question instead.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {IMPORTANCE_RULES.map((r) => (
                  <li key={r.mark} className="flex items-center gap-1.5 rounded-full border border-border bg-white py-1 pr-3 pl-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.className}`}>{r.mark}</span>
                    <span className="text-ink-subtle">→</span>
                    <span className="text-ink">{r.becomes}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-subtle">
                Free text: &quot;Is there anything that&apos;s a definite no?&quot; becomes deal-breakers. Other free
                text and &quot;{NOTE_TEXT}&quot; notes become soft rules.
              </p>
            </section>

            {INTAKE_SECTIONS.map((s) => (
              <section key={s.number}>
                <h3 className="flex items-baseline gap-2 text-lg text-ink">
                  <span className="font-sans text-xs font-semibold text-gold">Section {s.number}</span>
                  {s.title}
                </h3>
                <ol className="mt-2 divide-y divide-border rounded-lg border border-border">
                  {s.questions.map((q, i) => (
                    <li key={q.id} className="grid gap-1 px-3.5 py-2.5 text-sm sm:grid-cols-[1fr_auto] sm:gap-4">
                      <div>
                        <p className="text-ink">
                          <span className="mr-1.5 text-xs text-ink-subtle">
                            {s.number}.{i + 1}
                          </span>
                          {q.text}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {q.answerType}
                          {q.options && <> · {q.options.join(" · ")}</>}
                        </p>
                      </div>
                      <span className="text-xs whitespace-nowrap text-ink-subtle sm:pt-0.5">
                        {q.importance
                          ? "Importance mark"
                          : q.freeTextType === "deal_breaker"
                            ? "→ Deal-breakers"
                            : q.freeTextType === "soft_rule"
                              ? "→ Soft rules"
                              : "About the client"}
                      </span>
                    </li>
                  ))}
                  {s.note && (
                    <li className="px-3.5 py-2.5 text-sm text-ink-muted">
                      <span className="mr-1.5 text-xs text-ink-subtle">
                        {s.number}.{s.questions.length + 1}
                      </span>
                      {NOTE_TEXT} <span className="text-xs text-ink-subtle">(optional free text)</span>
                    </li>
                  )}
                </ol>
              </section>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
