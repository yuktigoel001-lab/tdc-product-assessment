import type { ReactNode } from "react";

/** A titled card used in the portfolio side panel. */
export function SideCard({
  title,
  count,
  children,
}: {
  title: ReactNode;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-white">
      <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-lg text-ink">{title}</h2>
        {count !== undefined && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-ink-muted">{count}</span>
        )}
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
