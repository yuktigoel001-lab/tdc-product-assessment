import { countReviewed, portfolioStatus } from "@/lib/status";
import type { Portfolio } from "@/lib/types";

export function StatsStrip({ portfolios }: { portfolios: Portfolio[] }) {
  const total = portfolios.length;
  const needFollowUp = portfolios.filter((p) => portfolioStatus(p) === "needs_follow_up").length;
  const allPrefs = portfolios.reduce((sum, p) => sum + p.preferences.length, 0);
  const reviewed = portfolios.reduce((sum, p) => sum + countReviewed(p), 0);
  const share = allPrefs === 0 ? 0 : Math.round((reviewed / allPrefs) * 100);

  const stats = [
    { label: "Total clients", value: String(total), note: null },
    { label: "Need follow-up", value: String(needFollowUp), note: needFollowUp > 0 ? "Questions to ask clients" : "All clear" },
    { label: "Preferences confirmed", value: `${share}%`, note: `${reviewed} of ${allPrefs} checked by matchmaker` },
  ];

  return (
    <dl className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-cream-light sm:grid-cols-3">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={i > 0 ? "border-t border-border px-5 py-4 sm:border-t-0 sm:border-l" : "px-5 py-4"}
        >
          <dt className="text-xs font-medium tracking-wide text-ink-subtle uppercase">{s.label}</dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="font-serif text-3xl text-forest">{s.value}</span>
            {s.note && <span className="text-xs text-ink-muted">{s.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
