"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ClientLog } from "@/components/portfolio/client-log";
import { FollowUpsPanel, type FollowUpHandlers } from "@/components/portfolio/follow-ups-panel";
import { OriginalFormCard } from "@/components/portfolio/original-form";
import { PreferenceSection, type PreferenceHandlers } from "@/components/portfolio/preference-section";
import { SummaryCard } from "@/components/portfolio/summary-card";
import {
  confirmAll,
  confirmPreference,
  editPreference,
  movePreference,
  resolveFollowUp,
} from "@/lib/actions";
import { CURRENT_MATCHMAKER } from "@/lib/matchmakers";
import { updatePortfolio, usePortfolio, useStoreReady } from "@/lib/store";
import type { Portfolio } from "@/lib/types";

export function PortfolioView() {
  const { id } = useParams<{ id: string }>();
  const portfolio = usePortfolio(id);
  const ready = useStoreReady();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Every action goes through the store, which saves it in the browser and refreshes the page.
  const apply = (change: (p: Portfolio) => Portfolio) => updatePortfolio(id, change);

  const startEdit = (prefId: string) => {
    setEditingId(prefId);
    // Bring the preference into view (used when editing from a resolved follow-up).
    setTimeout(
      () => document.getElementById(`pref-${prefId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
      50,
    );
  };

  const preferenceHandlers: PreferenceHandlers = {
    editingId,
    onConfirm: (prefId) => apply((p) => confirmPreference(p, prefId)),
    onStartEdit: startEdit,
    onCancelEdit: () => setEditingId(null),
    onSaveEdit: (prefId, edit) => {
      apply((p) => editPreference(p, prefId, edit));
      setEditingId(null);
    },
    onMove: (prefId) => apply((p) => movePreference(p, prefId)),
    onConfirmAll: (type) => apply((p) => confirmAll(p, type)),
  };

  const followUpHandlers: FollowUpHandlers = {
    onResolve: (followUpId, note) => apply((p) => resolveFollowUp(p, followUpId, note)),
    onEditPreference: startEdit,
  };

  const backLink = (
    <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-forest">
      <ArrowLeft className="size-4" aria-hidden /> All portfolios
    </Link>
  );

  // Wait for the browser's saved data before deciding a portfolio doesn't exist.
  if (!ready && !portfolio) return backLink;

  if (!portfolio || portfolio.matchmakerId !== CURRENT_MATCHMAKER) {
    return (
      <div className="space-y-4">
        {backLink}
        <div className="rounded-xl border border-dashed border-border bg-white px-6 py-12 text-center">
          <p className="font-serif text-xl text-ink">Portfolio not found</p>
          <p className="mt-1 text-sm text-ink-muted">It may have been removed, or it belongs to another matchmaker.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {backLink}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <SummaryCard portfolio={portfolio} />
          <PreferenceSection type="deal_breaker" preferences={portfolio.preferences} handlers={preferenceHandlers} />
          <PreferenceSection type="soft_rule" preferences={portfolio.preferences} handlers={preferenceHandlers} />
        </div>
        <aside className="space-y-6">
          <FollowUpsPanel
            followUps={portfolio.followUps}
            preferences={portfolio.preferences}
            handlers={followUpHandlers}
          />
          <ClientLog log={portfolio.log} />
          <OriginalFormCard form={portfolio.form} />
        </aside>
      </div>
    </div>
  );
}
