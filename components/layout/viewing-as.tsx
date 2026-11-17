"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { MATCHMAKERS, type MatchmakerId } from "@/lib/matchmakers";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "tdc:viewing-as";

type ViewingAsContextValue = {
  viewingAs: MatchmakerId;
  setViewingAs: (id: MatchmakerId) => void;
};

const ViewingAsContext = createContext<ViewingAsContextValue | null>(null);

// Tiny subscription so every component re-renders when the choice changes.
const listeners = new Set<() => void>();
let memoryValue: MatchmakerId = "A"; // used if browser storage is blocked

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener); // keeps other tabs in sync
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readSaved(): MatchmakerId {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "A" || saved === "B") return saved;
  } catch {
    // Storage blocked (e.g. private mode).
  }
  return memoryValue;
}

/** Remembers which matchmaker the prototype is "logged in" as. Stands in for real logins. */
export function ViewingAsProvider({ children }: { children: ReactNode }) {
  // On the server there is no browser storage, so it renders as Matchmaker A first.
  const viewingAs = useSyncExternalStore(subscribe, readSaved, () => "A" as MatchmakerId);

  const setViewingAs = useCallback((id: MatchmakerId) => {
    memoryValue = id;
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Ignore: the choice just won't survive a refresh.
    }
    listeners.forEach((l) => l());
  }, []);

  return (
    <ViewingAsContext.Provider value={{ viewingAs, setViewingAs }}>
      {children}
    </ViewingAsContext.Provider>
  );
}

export function useViewingAs() {
  const ctx = useContext(ViewingAsContext);
  if (!ctx) throw new Error("useViewingAs must be used inside ViewingAsProvider");
  return ctx;
}

/** Two-option pill switcher shown in the top bar. */
export function ViewingAsSwitcher() {
  const { viewingAs, setViewingAs } = useViewingAs();

  return (
    <div className="flex items-center gap-2.5">
      <span className="hidden text-xs font-medium tracking-wide text-ink-subtle uppercase sm:inline">
        Viewing as
      </span>
      <div
        role="radiogroup"
        aria-label="Viewing as"
        className="flex rounded-full border border-border bg-white p-0.5"
      >
        {MATCHMAKERS.map((m) => {
          const active = m.id === viewingAs;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setViewingAs(m.id)}
              className={cn(
                "cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap",
                active
                  ? "bg-forest text-cream-light shadow-sm"
                  : "text-ink-muted hover:bg-cream hover:text-forest",
              )}
            >
              {/* Short "A / B" on phones, full name on larger screens */}
              <span className="hidden sm:inline">Matchmaker </span>
              {m.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
