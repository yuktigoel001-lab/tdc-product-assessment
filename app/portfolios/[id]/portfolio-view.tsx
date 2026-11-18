"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ClientLog } from "@/components/portfolio/client-log";
import { FollowUpsPanel } from "@/components/portfolio/follow-ups-panel";
import { OriginalFormCard } from "@/components/portfolio/original-form";
import { PreferenceSection } from "@/components/portfolio/preference-section";
import { SummaryCard } from "@/components/portfolio/summary-card";
import { CURRENT_MATCHMAKER } from "@/lib/matchmakers";
import { usePortfolio, useStoreReady } from "@/lib/store";

export function PortfolioView() {
  const { id } = useParams<{ id: string }>();
  const portfolio = usePortfolio(id);
  const ready = useStoreReady();

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
          <PreferenceSection type="deal_breaker" preferences={portfolio.preferences} />
          <PreferenceSection type="soft_rule" preferences={portfolio.preferences} />
        </div>
        <aside className="space-y-6">
          <FollowUpsPanel followUps={portfolio.followUps} preferences={portfolio.preferences} />
          <ClientLog log={portfolio.log} />
          <OriginalFormCard form={portfolio.form} />
        </aside>
      </div>
    </div>
  );
}
