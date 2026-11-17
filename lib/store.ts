"use client";

/**
 * The ONE place the app reads and saves portfolios.
 *
 * Prototype: portfolios live in the browser's localStorage, starting from the mock data in /data.
 * Production: swap the inside of this file for Supabase (or any database). The screens only use
 * the functions exported here, so they wouldn't need to change.
 */
import { useSyncExternalStore } from "react";
import { MOCK_PORTFOLIOS } from "@/data/mock-portfolios";
import type { Portfolio } from "./types";

const STORAGE_KEY = "tdc:portfolios:v1";

let cache: Portfolio[] | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function load(): Portfolio[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Portfolio[]) : MOCK_PORTFOLIOS;
  } catch {
    cache = MOCK_PORTFOLIOS; // storage blocked or corrupted: fall back to the mock data
  }
  return cache;
}

function save(next: Portfolio[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked: changes still work until the page is refreshed.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      cache = null; // another tab changed the data
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// ---------- reading ----------

/** All portfolios. Re-renders the component whenever anything changes. */
export function usePortfolios(): Portfolio[] {
  return useSyncExternalStore(subscribe, load, () => MOCK_PORTFOLIOS);
}

/** One portfolio by id, or undefined if it doesn't exist. */
export function usePortfolio(id: string): Portfolio | undefined {
  return usePortfolios().find((p) => p.id === id);
}

/**
 * True once the browser's saved data has been read. Before that (the first split second, and on
 * the server) only the mock data is known, so pages for user-created portfolios should wait.
 */
export function useStoreReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

// ---------- saving ----------

export function addPortfolio(portfolio: Portfolio) {
  save([portfolio, ...load()]);
}

/** Apply a change to one portfolio. `updatedAt` is set automatically. */
export function updatePortfolio(id: string, change: (p: Portfolio) => Portfolio) {
  save(
    load().map((p) => (p.id === id ? { ...change(p), updatedAt: new Date().toISOString() } : p)),
  );
}

/** Forget everything saved in this browser and go back to the mock data. */
export function resetStore() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to remove
  }
  cache = null;
  emit();
}
