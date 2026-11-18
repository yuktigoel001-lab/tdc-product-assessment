import type { ReactNode } from "react";
import { Check, PencilLine, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import type { Preference, PreferenceStatus, PreferenceType } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS: Record<PreferenceStatus, { label: string; icon: typeof Check; className: string }> = {
  ai_suggested: { label: "AI suggested", icon: Sparkles, className: "bg-status-new-bg text-status-new-fg" },
  confirmed: { label: "Confirmed", icon: Check, className: "bg-status-ready-bg text-status-ready-fg" },
  edited: { label: "Edited", icon: PencilLine, className: "bg-cream text-gold" },
};

export function PreferenceStatusBadge({ status }: { status: PreferenceStatus }) {
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium whitespace-nowrap",
        s.className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {s.label}
    </span>
  );
}

export function PreferenceRow({ preference, actions }: { preference: Preference; actions?: ReactNode }) {
  return (
    <li className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-medium text-ink">{preference.label}</p>
          <PreferenceStatusBadge status={preference.status} />
        </div>
        {preference.detail && <p className="mt-0.5 text-sm text-ink-muted">{preference.detail}</p>}
        <blockquote className="mt-1.5 text-xs leading-relaxed text-ink-subtle">
          <span className="mr-1 font-medium tracking-wide uppercase">From the form:</span>
          <q className="italic">{preference.sourceQuote}</q>
        </blockquote>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-1.5">{actions}</div>}
    </li>
  );
}

const COPY: Record<PreferenceType, { title: ReactNode; hint: string }> = {
  deal_breaker: {
    title: (
      <>
        Deal-<em>breakers</em>
      </>
    ),
    hint: "Never share a profile that breaks one of these.",
  },
  soft_rule: {
    title: (
      <>
        Soft <em>rules</em>
      </>
    ),
    hint: "Nice to have. Weigh them, but they can bend for the right person.",
  },
};

export function PreferenceSection({
  type,
  preferences,
  headerAction,
  renderActions,
}: {
  type: PreferenceType;
  preferences: Preference[];
  headerAction?: ReactNode;
  renderActions?: (p: Preference) => ReactNode;
}) {
  const items = preferences.filter((p) => p.type === type);
  // Group by category, in the standard category order.
  const groups = CATEGORIES.map((c) => ({ ...c, items: items.filter((p) => p.category === c.key) })).filter(
    (g) => g.items.length > 0,
  );
  const isDealBreaker = type === "deal_breaker";

  return (
    <section
      aria-labelledby={`${type}-heading`}
      className={cn(
        "rounded-xl border bg-white",
        isDealBreaker ? "border-gold-light" : "border-border",
      )}
    >
      <header
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4",
          isDealBreaker ? "border-gold-light/70 bg-cream-light" : "border-border",
        )}
      >
        <div>
          <h2 id={`${type}-heading`} className="flex items-center gap-2.5 text-2xl text-ink">
            <span>{COPY[type].title}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-sans text-xs font-medium",
                isDealBreaker ? "border border-gold text-gold" : "bg-muted text-ink-muted",
              )}
            >
              {items.length}
            </span>
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">{COPY[type].hint}</p>
        </div>
        {headerAction}
      </header>

      {groups.length === 0 ? (
        <p className="px-6 py-6 text-sm text-ink-subtle">None yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {groups.map((g) => (
            <div key={g.key} className="grid gap-2 px-6 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <h3 className="pt-0.5 font-sans text-xs font-semibold tracking-wide text-ink-subtle uppercase">
                {g.label}
              </h3>
              <ul className="divide-y divide-border/70">
                {g.items.map((p) => (
                  <PreferenceRow key={p.id} preference={p} actions={renderActions?.(p)} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
