"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PortfolioCard } from "@/components/dashboard/portfolio-card";
import { StatsStrip } from "@/components/dashboard/stats-strip";
import { CURRENT_MATCHMAKER, matchmakerName } from "@/lib/matchmakers";
import { portfolioStatus, STATUS_LABELS } from "@/lib/status";
import { usePortfolios } from "@/lib/store";
import type { PortfolioStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | PortfolioStatus;
const FILTERS: Filter[] = ["all", "new", "in_review", "needs_follow_up", "ready"];

export default function DashboardPage() {
  const all = usePortfolios();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  // Only this matchmaker's clients, most recently updated first.
  const mine = useMemo(
    () =>
      all
        .filter((p) => p.matchmakerId === CURRENT_MATCHMAKER)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [all],
  );

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: mine.length, new: 0, in_review: 0, needs_follow_up: 0, ready: 0 };
    mine.forEach((p) => c[portfolioStatus(p)]++);
    return c;
  }, [mine]);

  const shown = mine.filter(
    (p) =>
      (filter === "all" || portfolioStatus(p) === filter) &&
      p.clientName.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-subtle">{matchmakerName(CURRENT_MATCHMAKER)}</p>
          <h1 className="text-4xl text-ink">
            Your client <em className="text-forest">portfolios</em>
          </h1>
        </div>
        <Link href="/portfolios/new" className={buttonVariants({ size: "lg" })}>
          <Plus /> New portfolio
        </Link>
      </div>

      <StatsStrip portfolios={mine} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f
                  ? "border-forest bg-forest text-cream-light"
                  : "border-border bg-white text-ink-muted hover:border-gold-light hover:text-forest",
              )}
            >
              {f === "all" ? "All" : STATUS_LABELS[f]}
              <span className={cn("ml-1.5 text-xs", filter === f ? "text-gold-light" : "text-ink-subtle")}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name"
            aria-label="Search clients by name"
            className="h-9 rounded-full bg-white pl-9"
          />
        </div>
      </div>

      {shown.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <PortfolioCard key={p.id} portfolio={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-white px-6 py-12 text-center">
          <p className="font-serif text-lg text-ink">No clients match</p>
          <p className="mt-1 text-sm text-ink-muted">
            {mine.length === 0 ? "Create a new portfolio to get started." : "Try another filter or clear the search."}
          </p>
        </div>
      )}
    </div>
  );
}
