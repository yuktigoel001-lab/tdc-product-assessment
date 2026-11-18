"use client";

import { clearFormFiles } from "@/lib/form-files";

/** Removes everything the prototype saved in this browser, then reloads with the original mock data. */
async function resetDemoData() {
  if (!window.confirm("Reset demo data? This removes new portfolios and all edits made in this browser.")) return;
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("tdc:"))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage blocked: nothing to reset.
  }
  await clearFormFiles(); // uploaded intake forms
  // Full reload (not client-side navigation) so nothing stale stays in memory.
  window.location.replace(`${window.location.origin}/`);
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-cream-light">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Prototype for The Date Crew Product Growth assessment · mock data only</p>
        <button
          type="button"
          onClick={resetDemoData}
          className="w-fit cursor-pointer text-ink-muted underline underline-offset-4 hover:text-forest"
        >
          Reset demo data
        </button>
      </div>
    </footer>
  );
}
