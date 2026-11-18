"use client";

import { useState, type ReactNode } from "react";
import { ArrowDownUp, Check, CheckCheck, PencilLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PreferenceEdit } from "@/lib/actions";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
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

/** Everything the section needs to make preferences editable. Leave it out for a read-only view. */
export type PreferenceHandlers = {
  editingId: string | null;
  onConfirm: (id: string) => void;
  onStartEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, edit: PreferenceEdit) => void;
  onMove: (id: string) => void;
  onConfirmAll: (type: PreferenceType) => void;
};

function PreferenceEditor({
  preference,
  onSave,
  onCancel,
}: {
  preference: Preference;
  onSave: (edit: PreferenceEdit) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(preference.label);
  const [detail, setDetail] = useState(preference.detail ?? "");
  const [category, setCategory] = useState<CategoryKey>(preference.category);

  return (
    <form
      className="w-full space-y-3 rounded-lg border border-gold-light bg-cream-light p-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ label, detail, category });
      }}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
        <label className="space-y-1">
          <span className="text-xs font-medium text-ink-muted">Preference</span>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} autoFocus required className="bg-white" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-ink-muted">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryKey)}
            className="h-8 w-full rounded-lg border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-xs font-medium text-ink-muted">Extra context (optional)</span>
        <Input
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="e.g. Confirmed on call, flexible for the right person"
          className="bg-white"
        />
      </label>
      <p className="text-xs text-ink-subtle">
        From the form: <q className="italic">{preference.sourceQuote}</q>
      </p>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function PreferenceRow({ preference, handlers }: { preference: Preference; handlers?: PreferenceHandlers }) {
  const editing = handlers?.editingId === preference.id;

  if (editing && handlers) {
    return (
      <li id={`pref-${preference.id}`} className="scroll-mt-24 py-3.5 first:pt-0 last:pb-0">
        <PreferenceEditor
          preference={preference}
          onCancel={handlers.onCancelEdit}
          onSave={(edit) => handlers.onSaveEdit(preference.id, edit)}
        />
      </li>
    );
  }

  const moveLabel = preference.type === "deal_breaker" ? "Move to soft rules" : "Move to deal-breakers";

  return (
    <li
      id={`pref-${preference.id}`}
      className="flex scroll-mt-24 flex-col gap-2.5 py-3.5 first:pt-0 last:pb-0"
    >
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
      {handlers && (
        <div className="flex shrink-0 flex-wrap gap-1.5">
          {preference.status === "ai_suggested" && (
            <Button
              size="xs"
              variant="outline"
              className="border-sage/40 text-forest hover:bg-status-ready-bg"
              onClick={() => handlers.onConfirm(preference.id)}
            >
              <Check /> Confirm
            </Button>
          )}
          <Button size="xs" variant="outline" onClick={() => handlers.onStartEdit(preference.id)}>
            <PencilLine /> Edit
          </Button>
          <Button size="xs" variant="outline" onClick={() => handlers.onMove(preference.id)} title={moveLabel}>
            <ArrowDownUp /> {moveLabel}
          </Button>
        </div>
      )}
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
  handlers,
}: {
  type: PreferenceType;
  preferences: Preference[];
  handlers?: PreferenceHandlers;
}) {
  const items = preferences.filter((p) => p.type === type);
  const unconfirmed = items.filter((p) => p.status === "ai_suggested").length;
  // Group by category, in the standard category order.
  const groups = CATEGORIES.map((c) => ({ ...c, items: items.filter((p) => p.category === c.key) })).filter(
    (g) => g.items.length > 0,
  );
  const isDealBreaker = type === "deal_breaker";

  return (
    <section
      aria-labelledby={`${type}-heading`}
      className={cn("rounded-xl border bg-white", isDealBreaker ? "border-gold-light" : "border-border")}
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
        {handlers &&
          (unconfirmed > 0 ? (
            <Button size="sm" onClick={() => handlers.onConfirmAll(type)}>
              <CheckCheck /> Confirm all ({unconfirmed})
            </Button>
          ) : (
            items.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm text-status-ready-fg">
                <CheckCheck className="size-4" aria-hidden /> All reviewed
              </span>
            )
          ))}
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
                  <PreferenceRow key={p.id} preference={p} handlers={handlers} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
