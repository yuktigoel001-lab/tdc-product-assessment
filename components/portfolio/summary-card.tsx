import { Briefcase, MapPin, UserRound } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { matchmakerName } from "@/lib/matchmakers";
import { countReviewed, portfolioStatus } from "@/lib/status";
import type { Portfolio } from "@/lib/types";

export function SummaryCard({ portfolio }: { portfolio: Portfolio }) {
  const status = portfolioStatus(portfolio);
  const total = portfolio.preferences.length;
  const reviewed = countReviewed(portfolio);
  const pct = total === 0 ? 0 : Math.round((reviewed / total) * 100);

  return (
    <section className="rounded-xl border border-border bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl leading-tight text-ink">{portfolio.clientName}</h1>
          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
            {(portfolio.age || portfolio.city) && (
              <div className="inline-flex items-center gap-1.5">
                <dt className="sr-only">Age and city</dt>
                <MapPin className="size-4 text-ink-subtle" aria-hidden />
                <dd>{[portfolio.age, portfolio.city].filter(Boolean).join(" · ")}</dd>
              </div>
            )}
            {portfolio.profession && (
              <div className="inline-flex items-center gap-1.5">
                <dt className="sr-only">Profession</dt>
                <Briefcase className="size-4 text-ink-subtle" aria-hidden />
                <dd>{portfolio.profession}</dd>
              </div>
            )}
            <div className="inline-flex items-center gap-1.5">
              <dt className="sr-only">Assigned matchmaker</dt>
              <UserRound className="size-4 text-ink-subtle" aria-hidden />
              <dd>{matchmakerName(portfolio.matchmakerId)}</dd>
            </div>
          </dl>
        </div>
        <StatusBadge status={status} className="mt-2" />
      </div>

      <div className="mt-5 rounded-lg border-l-2 border-gold bg-cream-light px-4 py-3">
        <p className="text-xs font-medium tracking-wide text-gold uppercase">What they&apos;re looking for</p>
        <p className="mt-1 leading-relaxed text-ink">{portfolio.summary}</p>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between text-xs text-ink-muted">
          <span>Matchmaker review</span>
          <span>
            <strong className="font-semibold text-ink">{reviewed}</strong> of {total} preferences confirmed
          </span>
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Preferences confirmed"
        >
          <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </section>
  );
}
