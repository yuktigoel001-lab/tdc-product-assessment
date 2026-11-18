"use client";

import { useEffect, useState } from "react";

export type AiMode = "live" | "demo";

let cached: Promise<AiMode> | null = null;

function fetchMode(): Promise<AiMode> {
  cached ??= fetch("/api/sort-intake")
    .then((r) => r.json())
    .then((d: { mode?: string }) => (d.mode === "live" ? "live" : "demo"))
    .catch(() => {
      cached = null; // try again next time
      return "demo" as const;
    });
  return cached;
}

/** Asks the server whether live AI sorting is available. `null` while checking. */
export function useAiMode(): AiMode | null {
  const [mode, setMode] = useState<AiMode | null>(null);
  useEffect(() => {
    let active = true;
    fetchMode().then((m) => active && setMode(m));
    return () => {
      active = false;
    };
  }, []);
  return mode;
}
