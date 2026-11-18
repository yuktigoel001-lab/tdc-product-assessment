import type { ReactNode } from "react";
import { CheckCircle2, CircleHelp } from "lucide-react";
import { SideCard } from "./side-card";
import type { FollowUp, Preference } from "@/lib/types";

export function FollowUpsPanel({
  followUps,
  preferences,
  renderActions,
}: {
  followUps: FollowUp[];
  preferences: Preference[];
  renderActions?: (f: FollowUp) => ReactNode;
}) {
  const open = followUps.filter((f) => f.status === "open");
  const resolved = followUps.filter((f) => f.status === "resolved");
  const labelFor = (id: string) => preferences.find((p) => p.id === id)?.label;

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
                <div className="min-w-0 space-y-1.5">
                  <p className="text-sm font-medium text-ink">{f.question}</p>
                  <p className="text-xs leading-relaxed text-ink-muted">
                    <span className="font-medium text-status-followup-fg">Why: </span>
                    {f.reason}
                  </p>
                  <RelatedChips ids={f.relatedPreferenceIds} labelFor={labelFor} />
                  {renderActions?.(f)}
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
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm text-ink-muted">{f.question}</p>
                    {f.resolutionNote && (
                      <p className="rounded-md bg-status-ready-bg/60 px-2.5 py-1.5 text-xs text-status-ready-fg">
                        {f.resolutionNote}
                      </p>
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

function RelatedChips({ ids, labelFor }: { ids: string[]; labelFor: (id: string) => string | undefined }) {
  const labels = ids.map(labelFor).filter(Boolean);
  if (labels.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1 pt-0.5" aria-label="Related preferences">
      {labels.map((l) => (
        <li key={l} className="rounded-full border border-border bg-white px-2 py-0.5 text-[0.7rem] text-ink-muted">
          {l}
        </li>
      ))}
    </ul>
  );
}
