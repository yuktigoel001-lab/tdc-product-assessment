import { STATUS_LABELS } from "@/lib/status";
import type { PortfolioStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<PortfolioStatus, string> = {
  new: "bg-status-new-bg text-status-new-fg",
  in_review: "bg-white text-status-review-fg ring-1 ring-sage/30 ring-inset",
  needs_follow_up: "bg-status-followup-bg text-status-followup-fg",
  ready: "bg-status-ready-bg text-status-ready-fg",
};

const DOTS: Record<PortfolioStatus, string> = {
  new: "bg-ink-subtle",
  in_review: "bg-sage/60",
  needs_follow_up: "bg-gold",
  ready: "bg-sage",
};

export function StatusBadge({ status, className }: { status: PortfolioStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STYLES[status],
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", DOTS[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}
