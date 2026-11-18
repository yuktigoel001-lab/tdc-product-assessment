import { CURRENT_MATCHMAKER, matchmakerName } from "@/lib/matchmakers";

/** Shows who this dashboard belongs to, like a signed-in account. */
export function AccountChip() {
  return (
    <div className="flex items-center gap-2.5 rounded-full border border-border bg-white py-1 pr-3.5 pl-1">
      <span
        aria-hidden
        className="flex size-7 items-center justify-center rounded-full bg-forest text-xs font-semibold text-cream-light"
      >
        {CURRENT_MATCHMAKER}
      </span>
      <span className="text-sm font-medium whitespace-nowrap text-ink">{matchmakerName(CURRENT_MATCHMAKER)}</span>
    </div>
  );
}
