"use client";

import { useState } from "react";
import { CheckCircle2, CircleHelp, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SideCard } from "./side-card";
import type { FollowUp, Preference } from "@/lib/types";

export type FollowUpHandlers = {
  onResolve: (followUpId: string, note: string) => void;
  onEditPreference: (preferenceId: string) => void;
};

export function FollowUpsPanel({
  followUps,
  preferences,
  handlers,
}: {
  followUps: FollowUp[];
  preferences: Preference[];
  handlers?: FollowUpHandlers;
}) {
  const open = followUps.filter((f) => f.status === "open");
  const resolved = followUps.filter((f) => f.status === "resolved");
  const related = (ids: string[]) =>
    ids.map((id) => preferences.find((p) => p.id === id)).filter((p): p is Preference => Boolean(p));

  return (
    <SideCard title="Follow-up questions" count={open.length}>
      {followUps.length === 0 ? (
        <p className="text-sm text-ink-subtle">No questions. The AI found nothing vague or contradictory.</p>
      ) : (
        <div className="space-y-4">
          {open.length === 0 && <p className="text-sm text-status-ready-fg">All follow-ups resolved.</p>}

          {open.map((f) => (
            <article key={f.id} className="rounded-lg border border-gold-light bg-status-followup-bg/50 p-3.5">
              <div className="flex gap-2">
                <CircleHelp className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-sm font-medium text-ink">{f.question}</p>
                  <p className="text-xs leading-relaxed text-ink-muted">
                    <span className="font-medium text-status-followup-fg">Why: </span>
                    {f.reason}
                  </p>
                  <RelatedChips prefs={related(f.relatedPreferenceIds)} />
                  {handlers && <ResolveForm onResolve={(note) => handlers.onResolve(f.id, note)} />}
                </div>
              </div>
            </article>
          ))}

          {resolved.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-ink-subtle uppercase">Resolved</p>
              {resolved.map((f) => (
                <article key={f.id} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sage" aria-hidden />
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-sm text-ink-muted">{f.question}</p>
                    {f.resolutionNote && (
                      <p className="rounded-md bg-status-ready-bg/60 px-2.5 py-1.5 text-xs text-status-ready-fg">
                        {f.resolutionNote}
                      </p>
                    )}
                    {handlers && related(f.relatedPreferenceIds).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[0.7rem] text-ink-subtle">Update the related preference:</p>
                        <div className="flex flex-wrap gap-1">
                          {related(f.relatedPreferenceIds).map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handlers.onEditPreference(p.id)}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border bg-white px-2 py-0.5 text-[0.7rem] text-ink-muted hover:border-gold-light hover:text-forest"
                            >
                              <PencilLine className="size-3" aria-hidden />
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </SideCard>
  );
}

function ResolveForm({ onResolve }: { onResolve: (note: string) => void }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  if (!open) {
    return (
      <div className="pt-1">
        <Button size="xs" variant="outline" className="bg-white" onClick={() => setOpen(true)}>
          <CheckCircle2 /> Mark resolved
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-2 pt-1"
      onSubmit={(e) => {
        e.preventDefault();
        onResolve(note);
      }}
    >
      <label className="block space-y-1">
        <span className="text-xs font-medium text-ink-muted">What did the client say? (optional)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          autoFocus
          placeholder="e.g. Values matter more. Open to other communities."
          className="w-full rounded-lg border border-input bg-white px-2.5 py-2 text-sm outline-none placeholder:text-ink-subtle focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="xs">
          Mark resolved
        </Button>
        <Button type="button" size="xs" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function RelatedChips({ prefs }: { prefs: Preference[] }) {
  if (prefs.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1 pt-0.5" aria-label="Related preferences">
      {prefs.map((p) => (
        <li key={p.id} className="rounded-full border border-border bg-white px-2 py-0.5 text-[0.7rem] text-ink-muted">
          {p.label}
        </li>
      ))}
    </ul>
  );
}
