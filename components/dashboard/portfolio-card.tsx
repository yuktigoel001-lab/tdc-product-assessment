import Link from "next/link";
import { MessageCircleQuestion, ShieldAlert } from "lucide-react";
import { StatusBadge } from "@/components/portfolio/status-badge";
import { formatDate } from "@/lib/format";
import { countDealBreakers, countOpenFollowUps, portfolioStatus } from "@/lib/status";
import type { Portfolio } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PortfolioCard({ portfolio }: { portfolio: Portfolio }) {
  const status = portfolioStatus(portfolio);
  const dealBreakers = countDealBreakers(portfolio);
  const openFollowUps = countOpenFollowUps(portfolio);
  const meta = [portfolio.age, portfolio.city].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/portfolios/${portfolio.id}`}
      className="group flex flex-col rounded-xl border border-border bg-white p-5 transition-colors hover:border-gold-light focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl leading-tight text-ink group-hover:text-forest">{portfolio.clientName}</h2>
          {meta && <p className="mt-0.5 text-sm text-ink-muted">{meta}</p>}
        </div>
        <StatusBadge status={status} className="mt-1" />
      </div>

      {portfolio.profession && (
        <p className="mt-2 line-clamp-1 text-sm text-ink-subtle">{portfolio.profession}</p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-sm">
        <span className="inline-flex items-center gap-1.5 text-ink-muted">
          <ShieldAlert className="size-4 text-gold" aria-hidden />
          <span>
            <strong className="font-semibold text-ink">{dealBreakers}</strong> deal-breaker{dealBreakers === 1 ? "" : "s"}
          </span>
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            openFollowUps > 0 ? "text-status-followup-fg" : "text-ink-subtle",
          )}
        >
          <MessageCircleQuestion className="size-4" aria-hidden />
          <span>
            <strong className="font-semibold">{openFollowUps}</strong> open follow-up{openFollowUps === 1 ? "" : "s"}
          </span>
        </span>
        <span className="ml-auto text-xs text-ink-subtle">Updated {formatDate(portfolio.updatedAt)}</span>
      </div>
    </Link>
  );
}
