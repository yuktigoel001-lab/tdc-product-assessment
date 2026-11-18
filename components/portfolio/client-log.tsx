import {
  ArrowLeftRight,
  Check,
  CheckCheck,
  CheckCircle2,
  FilePlus2,
  FileUp,
  PencilLine,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { SideCard } from "./side-card";
import { formatDateTime } from "@/lib/format";
import type { LogEntry, LogKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<LogKind, LucideIcon> = {
  created: FilePlus2,
  form_uploaded: FileUp,
  ai_sorted: Sparkles,
  confirmed: Check,
  confirmed_all: CheckCheck,
  edited: PencilLine,
  moved: ArrowLeftRight,
  followup_resolved: CheckCircle2,
};

export function ClientLog({ log }: { log: LogEntry[] }) {
  const entries = [...log].sort((a, b) => b.at.localeCompare(a.at)); // newest first

  return (
    <SideCard title="Client log" count={log.length}>
      <ol className="relative max-h-[28rem] space-y-4 overflow-y-auto pr-1">
        {entries.map((e, i) => {
          const Icon = ICONS[e.kind];
          return (
            <li key={e.id} className="relative flex gap-3">
              {i < entries.length - 1 && (
                <span aria-hidden className="absolute top-7 bottom-[-1rem] left-3 w-px bg-border" />
              )}
              <span
                className={cn(
                  "relative flex size-6 shrink-0 items-center justify-center rounded-full border",
                  e.actor === "AI" ? "border-gold-light bg-cream-light text-gold" : "border-border bg-white text-sage",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
              </span>
              <div className="min-w-0 pb-0.5">
                <p className="text-sm text-ink">{e.summary}</p>
                {(e.before || e.after) && (
                  <p className="mt-1 text-xs break-words text-ink-muted">
                    {e.before && <span className="line-through decoration-ink-subtle/60">{e.before}</span>}
                    {e.before && e.after && <span className="mx-1.5 text-ink-subtle">→</span>}
                    {e.after && <span className="text-ink">{e.after}</span>}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-ink-subtle">
                  {e.actor} · {formatDateTime(e.at)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </SideCard>
  );
}
